'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import type { Module } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import React from 'react';
import { Bold, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Pilcrow } from 'lucide-react';

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

const formSchema = z.object({
  title: z.string().min(3, { message: 'Judul modul harus memiliki setidaknya 3 karakter.' }),
  content: z.string().min(10, { message: 'Konten modul harus memiliki setidaknya 10 karakter.' }),
});

type ModuleFormValues = z.infer<typeof formSchema>;

interface ModuleFormProps {
  initialData?: Module | null;
}

export function ModuleForm({ initialData }: ModuleFormProps) {
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

  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  const applyStyle = (style: 'bold' | 'h1' | 'h2' | 'p') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let newText;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    switch (style) {
      case 'bold':
        newText = `<b>${selectedText}</b>`;
        break;
      case 'h1':
        newText = `<h1>${selectedText}</h1>`;
        break;
      case 'h2':
        newText = `<h2>${selectedText}</h2>`;
        break;
      case 'p':
        newText = `<p>${selectedText}</p>`;
        break;
      default:
        newText = selectedText;
    }
    
    const updatedContent = before + newText + after;
    form.setValue('content', updatedContent);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + newText.length - selectedText.length, start + newText.length);
    }, 0);
  };
  
  const applyAlignment = (alignment: 'left' | 'center' | 'right') => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    // Wrap the selection in a div with the desired text alignment
    const newText = `<div style="text-align: ${alignment};">${selectedText}</div>`;
    const updatedContent = before + newText + after;
    form.setValue('content', updatedContent);

     setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + newText.length - selectedText.length, start + newText.length);
    }, 0);
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
        router.push('/dashboard/modules');
        router.refresh(); // Refresh the page to show the new data
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
                            <ToggleGroup type="multiple" variant="outline" size="sm" className="justify-start">
                                <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => applyStyle('bold')}>
                                    <Bold className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="h1" aria-label="Toggle H1" onClick={() => applyStyle('h1')}>
                                    <Heading1 className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="h2" aria-label="Toggle H2" onClick={() => applyStyle('h2')}>
                                    <Heading2 className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="p" aria-label="Toggle Paragraph" onClick={() => applyStyle('p')}>
                                    <Pilcrow className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                             <ToggleGroup type="single" variant="outline" size="sm" className="justify-start ml-2">
                                <ToggleGroupItem value="left" aria-label="Align left" onClick={() => applyAlignment('left')}>
                                    <AlignLeft className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="center" aria-label="Align center" onClick={() => applyAlignment('center')}>
                                    <AlignCenter className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="right" aria-label="Align right" onClick={() => applyAlignment('right')}>
                                    <AlignRight className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                         </div>
                        <FormControl>
                          <textarea
                            ref={contentRef}
                            placeholder="Tulis konten modul di sini..."
                            className="min-h-[400px] w-full rounded-b-md bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                    </div>
                    <FormDescription>
                        Pilih teks untuk menerapkan styling. Konten disimpan sebagai HTML.
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
