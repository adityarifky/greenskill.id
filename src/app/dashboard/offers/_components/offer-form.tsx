'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle } from "lucide-react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Module, UserFolder } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  content: z.string().min(1, { message: 'Konten surat tidak boleh kosong.' }),
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
  allModules: Module[];
  userFolders: UserFolder[];
}

export function OfferForm({ allModules, userFolders }: OfferFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const title = 'Buat Surat';
  const description = 'Tulis konten surat dan unggah background untuk membuat surat.';
  const action = 'Buat Surat';

  const onSubmit = async (data: OfferFormValues) => {
    setIsSubmitting(true);
    
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
            module: {
                title: `Surat Kustom`,
                content: data.content,
            },
            backgroundUrl: backgroundUrl, 
        };
        
        sessionStorage.setItem('previewOffer', JSON.stringify(temporaryOfferData));

        toast({
            title: 'Mengarahkan ke Pratinjau',
            description: 'Surat Anda sedang disiapkan.',
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konten Surat</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tuliskan isi surat Anda di sini..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Anda dapat menggunakan HTML dasar untuk format teks.
                  </FormDescription>
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
                    Unggah gambar yang akan dijadikan background surat.
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
