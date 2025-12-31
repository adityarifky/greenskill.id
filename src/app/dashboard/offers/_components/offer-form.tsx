'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from "date-fns"
import { CalendarIcon, Upload, Eye } from "lucide-react"
import * as React from 'react';
 
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Scheme, Offer } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];


const formSchema = z.object({
  schemeId: z.string().min(1, { message: 'Silakan pilih skema.' }),
  customerName: z.string().min(2, { message: 'Nama customer harus diisi.' }),
  offerDate: z.date({ required_error: "Tanggal penawaran harus diisi."}),
  userRequest: z.string().min(10, { message: 'Permintaan pengguna harus memiliki setidaknya 10 karakter.' }),
  backgroundFiles: z
    .any()
    .refine((files) => !files || (files instanceof FileList && files.length > 0), "Pilih setidaknya satu file gambar.")
    .refine((files) => {
        if (!files || !(files instanceof FileList)) return true;
        for (let i = 0; i < files.length; i++) {
            if (files[i].size > MAX_FILE_SIZE) return false;
        }
        return true;
    }, `Ukuran file maksimal 5MB per file.`)
    .refine((files) => {
        if (!files || !(files instanceof FileList)) return true;
        for (let i = 0; i < files.length; i++) {
            if (!ACCEPTED_IMAGE_TYPES.includes(files[i].type)) return false;
        }
        return true;
    }, "Hanya format .jpg, .jpeg, dan .png yang diterima.")
    .optional(),
});

type OfferFormValues = z.infer<typeof formSchema>;

interface OfferFormProps {
  initialData?: Offer | null;
  schemes: Scheme[];
}

export function OfferForm({ initialData, schemes }: OfferFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasTemplateFiles, setHasTemplateFiles] = React.useState(false);
  
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      offerDate: initialData.offerDate instanceof Date ? initialData.offerDate : new Date(initialData.offerDate),
    } : {
      schemeId: '',
      customerName: '',
      offerDate: new Date(),
      userRequest: '',
    },
  });

  const title = initialData ? 'Edit Penawaran' : 'Buat Penawaran Baru';
  const description = initialData ? 'Perbarui detail penawaran.' : 'Isi formulir untuk membuat penawaran baru.';
  const action = initialData ? 'Simpan Perubahan' : 'Pratinjau & Simpan';
  

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setHasTemplateFiles(true);
      try {
        const filePromises = Array.from(files).map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });
        const urls = await Promise.all(filePromises);
        sessionStorage.setItem('previewOffer', JSON.stringify({ backgroundUrls: urls, isTemplateOnlyPreview: true }));
      } catch (error) {
        console.error("Error processing template files:", error);
        setHasTemplateFiles(false);
      }
    } else {
      setHasTemplateFiles(false);
    }
    // Also trigger react-hook-form's change handler
    form.register('backgroundFiles').onChange(event);
  };
  
  const handlePreviewTemplates = () => {
    router.push('/dashboard/offers/preview');
  };

  const onSubmit = async (data: OfferFormValues) => {
    setIsSubmitting(true);

    const selectedScheme = schemes.find(s => s.id === data.schemeId);
    if (!selectedScheme) {
        toast({
            variant: "destructive",
            title: "Gagal!",
            description: "Skema yang dipilih tidak valid.",
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
        let backgroundUrls: string[] = [];
        if (data.backgroundFiles && data.backgroundFiles.length > 0) {
            const filePromises = Array.from(data.backgroundFiles).map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            backgroundUrls = await Promise.all(filePromises);
        }
    
        const temporaryOfferData = {
            ...data,
            id: `temp-${Date.now()}`,
            schemeName: selectedScheme.name,
            scheme: selectedScheme,
            backgroundUrls: backgroundUrls,
            isTemplateOnlyPreview: false, // Make sure this is false for full preview
        };
        
        sessionStorage.setItem('previewOffer', JSON.stringify(temporaryOfferData));

        toast({
            title: 'Mengarahkan ke Pratinjau',
            description: 'Data akan disimpan setelah Anda mengkonfirmasi dari halaman pratinjau.',
        });

        router.push('/dashboard/offers/preview');

    } catch (error) {
        console.error("Error creating preview data:", error);
        toast({
            variant: "destructive",
            title: "Gagal Membuat Pratinjau",
            description: "Tidak dapat membuat pratinjau. Silakan coba lagi."
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="schemeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Skema Pelatihan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={schemes.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={schemes.length > 0 ? "Pilih skema yang akan digunakan" : "Tidak ada skema tersedia"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schemes.map((scheme) => (
                        <SelectItem key={scheme.id} value={scheme.id}>
                          {scheme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Penawaran akan didasarkan pada skema yang dipilih.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Customer</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: PT Jaya Abadi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offerDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Penawaran</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="backgroundFiles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Template Background</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="file" className="pl-10" onChange={handleFileChange} accept=".jpg, .jpeg, .png" multiple />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Unggah satu atau lebih gambar latar (format .jpg, .png). Jika kosong, template default akan digunakan.
                  </FormDescription>
                   {hasTemplateFiles && (
                    <Button type="button" variant="secondary" size="sm" onClick={handlePreviewTemplates} className="mt-2">
                        <Eye className="mr-2 h-4 w-4" />
                        Pratinjau Template
                    </Button>
                   )}
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="userRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permintaan Pengguna</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Permintaan untuk 20 karyawan, termasuk sertifikat dan makan siang."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Jelaskan detail spesifik untuk penawaran ini.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" className="w-full text-lg" disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : action}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
