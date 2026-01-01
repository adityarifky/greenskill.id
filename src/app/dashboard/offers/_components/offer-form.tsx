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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  folderId: z.string().optional(),
  selectedModuleIds: z.array(z.string()).min(1, { message: 'Pilih setidaknya satu modul.' }),
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
  const [selectedFolder, setSelectedFolder] = React.useState<string | undefined>(undefined);

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedModuleIds: [],
    },
  });

  const title = 'Buat Surat';
  const description = 'Pilih modul dan unggah background untuk membuat surat.';
  const action = 'Buat Surat';

  const modulesInSelectedFolder = React.useMemo(() => {
      if (!selectedFolder) return [];
      if (selectedFolder === 'folder-surat-penawaran') {
          return allModules.filter(m => !m.folderId || m.folderId === 'folder-surat-penawaran');
      }
      return allModules.filter(m => m.folderId === selectedFolder);
  }, [selectedFolder, allModules]);

  const onSubmit = async (data: OfferFormValues) => {
    setIsSubmitting(true);
    
    try {
        const selectedModules = allModules.filter(m => data.selectedModuleIds.includes(m.id));
        const combinedContent = selectedModules
            .sort((a, b) => a.position - b.position)
            .map(m => m.content)
            .join('<div style="page-break-after: always;"></div>');

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
                name="folderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Folder Modul</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedFolder(value);
                      form.setValue('selectedModuleIds', []); // Reset selection on folder change
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih folder berisi modul" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         <SelectItem value="folder-surat-penawaran">Surat Penawaran (Default)</SelectItem>
                         {userFolders.map(folder => (
                           <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedFolder && (
                 <FormField
                    control={form.control}
                    name="selectedModuleIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Pilih Modul Konten</FormLabel>
                          <FormDescription>
                            Pilih satu atau lebih modul untuk digabungkan menjadi satu surat.
                          </FormDescription>
                        </div>
                        <Card className="h-[300px] flex flex-col">
                           <CardContent className="p-2 flex-grow overflow-hidden">
                             <ScrollArea className="h-full">
                              {modulesInSelectedFolder.length > 0 ? modulesInSelectedFolder.map((item) => (
                                <FormField
                                  key={item.id}
                                  control={form.control}
                                  name="selectedModuleIds"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item.id}
                                        className="flex flex-row items-center space-x-3 space-y-0 p-3 hover:bg-muted/50 rounded-md transition-colors"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, item.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== item.id
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal flex-1 cursor-pointer">
                                          {item.title}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              )) : (
                                <div className="text-center p-10 text-muted-foreground">
                                    Folder ini tidak memiliki modul.
                                </div>
                              )}
                            </ScrollArea>
                           </CardContent>
                        </Card>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}
            
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
