'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import type { Module } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import React, { useRef, useEffect } from 'react';
import { Bold } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Judul modul harus memiliki setidaknya 3 karakter.' }),
  content: z.string().min(10, { message: 'Konten modul harus memiliki setidaknya 10 karakter.' }),
});

type ModuleFormValues = z.infer<typeof formSchema>;

interface ModuleFormProps {
  initialData?: Module | null;
  onSave?: () => void;
}

export function ModuleForm({ initialData, onSave }: ModuleFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      content: '',
    },
  });

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      if (editorRef.current) {
        editorRef.current.innerHTML = initialData.content;
      }
    }
  }, [initialData, form]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    form.setValue('content', newContent, { shouldValidate: true, shouldDirty: true });
  };
  
  const title = initialData ? 'Edit Modul' : 'Buat Modul Baru';
  const description = initialData ? 'Perbarui detail modul.' : 'Isi formulir untuk membuat modul baru.';
  const toastMessage = initialData ? 'Modul berhasil diperbarui.' : 'Modul baru berhasil dibuat.';
  const action = initialData ? 'Simpan Perubahan' : 'Buat Modul';

  const onSubmit = async (data: ModuleFormValues) => {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Gagal!",
            description: "Koneksi ke database gagal atau pengguna belum terautentikasi.",
        });
        return;
    }
    
    try {
        if (initialData) {
            // Update existing document
            const docRef = doc(firestore, 'modules', initialData.id);
            await setDoc(docRef, { 
                ...data, 
                updatedAt: serverTimestamp(),
                userId: user.uid // ensure userId is preserved
            }, { merge: true });
        } else {
            // Create new document
            await addDoc(collection(firestore, 'modules'), {
                ...data,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        toast({
            title: 'Sukses!',
            description: toastMessage,
        });

        if (onSave) {
          onSave();
        } else {
          router.push('/dashboard/modules');
        }
        router.refresh(); 
    } catch (error) {
         console.error("Error saving module: ", error);
         toast({
            variant: "destructive",
            title: "Gagal!",
            description: "Terjadi kesalahan saat menyimpan modul.",
        });
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Modul</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Pengenalan Keselamatan Kerja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konten Modul</FormLabel>
                    <div className="rounded-md border border-input">
                         <div className="p-2 border-b">
                            <ToggleGroup type="multiple" variant="outline" size="sm">
                                <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => execCommand('bold')}>
                                    <Bold className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                         </div>
                        <FormControl>
                          <div
                            ref={editorRef}
                            id="content-editor"
                            contentEditable={true}
                            onInput={handleContentChange}
                            onBlur={handleContentChange}
                            suppressContentEditableWarning={true}
                            className={cn(
                                "min-h-[400px] w-full rounded-b-md bg-transparent px-3 py-2 text-sm ring-offset-background",
                                "focus-visible:outline-none"
                            )}
                            dangerouslySetInnerHTML={{ __html: form.getValues('content') }}
                          >
                          </div>
                        </FormControl>
                    </div>
                    <FormDescription>
                        Gunakan tombol di atas untuk memformat teks Anda.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
                 <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Menyimpan...' : action}
                </Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
