'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from "date-fns"
import { CalendarIcon, Upload } from "lucide-react"
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
  backgroundFile: z
    .any()
    .refine((files) => !files || (files && files.length > 0), "File gambar diperlukan jika diisi.")
    .refine((files) => !files || !files[0] || files[0].size <= MAX_FILE_SIZE, `Ukuran file maksimal 5MB.`)
    .refine(
      (files) => !files || !files[0] || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Hanya format .jpg, .jpeg, dan .png yang diterima."
    ).optional(),
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
  const action = initialData ? 'Simpan Perubahan' : 'Buat Penawaran';
  

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
    
    // --- START: BYPASS SAVING LOGIC ---
    try {
        let backgroundUrl = '';
        if (data.backgroundFile && data.backgroundFile.length > 0) {
            const file = data.backgroundFile[0];
            // Convert image to data URL to pass to preview page
            backgroundUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    
        const temporaryOfferData = {
            ...data,
            id: `temp-${Date.now()}`,
            schemeName: selectedScheme.name,
            scheme: selectedScheme,
            backgroundUrl: backgroundUrl,
        };
        
        // Store in sessionStorage to be read by the preview page
        sessionStorage.setItem('previewOffer', JSON.stringify(temporaryOfferData));

        toast({
            title: 'Mengarahkan ke Pratinjau',
            description: 'Data tidak disimpan, hanya ditampilkan untuk pratinjau.',
        });

        router.push('/dashboard/offers/preview');

    } catch (error) {
        console.error("Error creating preview data:", error);
        toast({
            variant: "destructive",
            title: "Gagal Membuat Pratinjau",
            description: "Tidak dapat membuat pratinjau. Silakan coba lagi."
        });
        setIsSubmitting(false);
    }
    // --- END: BYPASS SAVING LOGIC ---
  };
  
  const fileRef = form.register("backgroundFile");

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
              name="backgroundFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Template Background</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="file" className="pl-10" {...fileRef} accept=".jpg, .jpeg, .png" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Unggah gambar latar kustom (format .jpg, .png). Jika kosong, template default akan digunakan.
                  </FormDescription>
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
              {isSubmitting ? "Menyimpan..." : action}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
