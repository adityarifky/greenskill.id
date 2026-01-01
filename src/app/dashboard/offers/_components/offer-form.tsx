'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Upload, Eye, BookOpen } from "lucide-react"
import * as React from 'react';
 
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Module } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  moduleId: z.string().min(1, { message: 'Silakan pilih modul.' }),
  backgroundFiles: z
    .any()
    .refine((files) => files instanceof FileList && files.length > 0, "Silakan unggah sebuah gambar background.")
    .refine((files) => {
        if (!files || !(files instanceof FileList)) return true;
        return files[0].size <= MAX_FILE_SIZE;
    }, `Ukuran file maksimal 5MB.`)
    .refine((files) => {
        if (!files || !(files instanceof FileList)) return true;
        return ACCEPTED_IMAGE_TYPES.includes(files[0].type);
    }, "Hanya format .jpg, .jpeg, .png, dan .webp yang diterima."),
});

type OfferFormValues = z.infer<typeof formSchema>;

interface OfferFormProps {
  modules: Module[];
}

export function OfferForm({ modules }: OfferFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleId: '',
    },
  });

  const title = 'Buat Surat Penawaran';
  const description = 'Pilih modul dan unggah background untuk membuat surat penawaran.';
  const action = 'Buat Penawaran';

  const onSubmit = async (data: OfferFormValues) => {
    setIsSubmitting(true);

    const selectedModule = modules.find(m => m.id === data.moduleId);
    if (!selectedModule) {
        toast({
            variant: "destructive",
            title: "Gagal!",
            description: "Modul yang dipilih tidak valid.",
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
        let backgroundUrl: string | undefined = undefined;
        if (data.backgroundFiles && data.backgroundFiles.length > 0) {
            const file = data.backgroundFiles[0];
            backgroundUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    
        const temporaryOfferData = {
            id: `temp-${Date.now()}`,
            module: selectedModule,
            backgroundUrl: backgroundUrl, 
        };
        
        sessionStorage.setItem('previewOffer', JSON.stringify(temporaryOfferData));

        toast({
            title: 'Mengarahkan ke Pratinjau',
            description: 'Penawaran Anda sedang disiapkan.',
        });

        router.push('/dashboard/offers/preview');

    } catch (error) {
        console.error("Error creating preview data:", error);
        toast({
            variant: "destructive",
            title: "Gagal Membuat Pratinjau",
            description: "Tidak dapat memproses file. Silakan coba lagi."
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
              name="moduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Modul Konten</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={modules.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                         <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <div className="pl-6">
                          <SelectValue placeholder={modules.length > 0 ? "Pilih modul yang kontennya akan digunakan" : "Tidak ada modul tersedia"} />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Konten dari modul ini akan ditampilkan di atas background.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="backgroundFiles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Background Surat</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        type="file" 
                        className="pl-10" 
                        onChange={(e) => field.onChange(e.target.files)} 
                        accept=".jpg, .jpeg, .png, .webp" 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Unggah gambar yang akan dijadikan background surat penawaran.
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
