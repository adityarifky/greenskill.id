'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Upload, ListOrdered, CheckCircle } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Module } from '@/lib/types';
import { ModuleSorter } from './module-sorter';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  moduleIds: z.array(z.string()).min(1, { message: 'Silakan pilih minimal satu modul.' }),
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
  const [isSorterOpen, setIsSorterOpen] = React.useState(false);
  
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleIds: [],
    },
  });

  const title = 'Buat Surat';
  const description = 'Pilih modul, urutkan konten, dan unggah background untuk membuat surat.';
  const action = 'Buat Surat';

  const selectedModuleDetails = React.useMemo(() => {
    const selectedIds = form.watch('moduleIds');
    const selectedIdSet = new Set(selectedIds);
    // Preserve the order from the selection
    return selectedIds.map(id => modules.find(m => m.id === id)).filter(Boolean) as Module[];
  }, [form.watch('moduleIds'), modules]);


  const onSubmit = async (data: OfferFormValues) => {
    setIsSubmitting(true);

    const orderedModules = data.moduleIds.map(id => modules.find(m => m.id === id)).filter(Boolean) as Module[];
    
    if (orderedModules.length !== data.moduleIds.length) {
        toast({
            variant: "destructive",
            title: "Gagal!",
            description: "Beberapa modul yang dipilih tidak valid.",
        });
        setIsSubmitting(false);
        return;
    }
    
    // Concatenate content from all selected modules
    const combinedContent = orderedModules.map(m => m.content).join('<div style="page-break-before: always;"></div>');

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
                title: `Surat Gabungan (${orderedModules.length} modul)`,
                content: combinedContent,
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
              name="moduleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Modul Konten</FormLabel>
                   <FormControl>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal"
                        onClick={() => setIsSorterOpen(true)}
                        disabled={modules.length === 0}
                      >
                         <ListOrdered className="mr-2 h-4 w-4" />
                         {selectedModuleDetails.length > 0 ? `${selectedModuleDetails.length} modul dipilih` : (modules.length > 0 ? "Pilih modul..." : "Tidak ada modul tersedia")}
                      </Button>
                    </FormControl>
                    {selectedModuleDetails.length > 0 && (
                      <div className="mt-2 space-y-2 rounded-md border p-3">
                        <p className="text-sm font-medium">Modul Terpilih (berurutan):</p>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground">
                            {selectedModuleDetails.map((module) => (
                                <li key={module.id} className="truncate">{module.title}</li>
                            ))}
                        </ol>
                      </div>
                    )}
                  <FormDescription>Konten dari modul ini akan digabungkan secara berurutan.</FormDescription>
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
       <Dialog open={isSorterOpen} onOpenChange={setIsSorterOpen}>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
              <DialogHeader>
              <DialogTitle>Pilih dan Urutkan Modul</DialogTitle>
              <DialogDescription>
                Klik pada modul untuk memilih atau membatalkan pilihan. Urutan akan sesuai dengan urutan di daftar.
              </DialogDescription>
            </DialogHeader>
             <ModuleSorter
                allModules={modules}
                initialSelectedIds={form.getValues('moduleIds')}
                onSave={(newOrderIds) => {
                    form.setValue('moduleIds', newOrderIds, { shouldValidate: true });
                    setIsSorterOpen(false);
                    toast({
                        title: "Pilihan disimpan!",
                        description: `${newOrderIds.length} modul telah dipilih.`,
                        action: <CheckCircle className="h-5 w-5 text-green-500" />
                    })
                }}
                onCancel={() => setIsSorterOpen(false)}
             />
          </DialogContent>
      </Dialog>
    </Form>
  );
}
