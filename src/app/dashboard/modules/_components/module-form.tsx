'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import type { Module } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import React, { useRef, useEffect, useState, useCallback } from 'react';
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
import { cn } from '@/lib/utils';

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
      content: '<p><br></p>', // Start with a paragraph for better UX
    },
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const [activeStyles, setActiveStyles] = useState<string[]>([]);
  const [currentBlock, setCurrentBlock] = useState('p');
  const [textAlign, setTextAlign] = useState('left');

  const updateToolbar = useCallback(() => {
    if (!document.getSelection) return;
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let parentNode = range.commonAncestorContainer;

    if (parentNode.nodeType === Node.TEXT_NODE) {
      parentNode = parentNode.parentNode!;
    }
    
    const styles: string[] = [];
    let blockType = 'p';
    let alignment = 'left';

    let current: Node | null = parentNode;
    while (current && current !== editorRef.current) {
      const el = current as HTMLElement;
      const nodeName = el.nodeName.toLowerCase();
      
      if (['b', 'strong'].includes(nodeName)) styles.push('bold');
      if (['h1', 'h2', 'p'].includes(nodeName)) {
        blockType = nodeName;
      }

      if (el.style) {
        const align = el.style.textAlign;
        if (['left', 'center', 'right'].includes(align)) {
            alignment = align;
        }
      }
      current = el.parentNode;
    }
    
    setActiveStyles(styles);
    setCurrentBlock(blockType);
    setTextAlign(alignment);
  }, []);


  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const handleSelectionChange = () => {
          updateToolbar();
      };
      document.addEventListener('selectionchange', handleSelectionChange);
      editor.addEventListener('keyup', updateToolbar);
      editor.addEventListener('click', updateToolbar);

      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        editor.removeEventListener('keyup', updateToolbar);
        editor.removeEventListener('click', updateToolbar);
      };
    }
  }, [updateToolbar]);
  
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbar();
  };

  const handleFormat = (e: React.MouseEvent<HTMLButtonElement>, style: 'bold' | 'h1' | 'h2' | 'p') => {
    e.preventDefault();
    if (['h1', 'h2', 'p'].includes(style)) {
      execCommand('formatBlock', `<${style}>`);
    } else {
      execCommand(style);
    }
  };

  const handleAlignment = (e: React.MouseEvent<HTMLButtonElement>, alignment: 'left' | 'center' | 'right') => {
    e.preventDefault();
    execCommand(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    form.setValue('content', newContent, { shouldValidate: true, shouldDirty: true });
  };
  
  useEffect(() => {
     if (initialData?.content && editorRef.current) {
      editorRef.current.innerHTML = initialData.content;
      form.setValue('content', initialData.content, { shouldValidate: true });
     }
  }, [initialData, form]);

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
            const newDocRef = await addDoc(collection(firestore, 'modules'), {
                ...data,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
             // The ID is now available in newDocRef.id
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
                            <ToggleGroup type="multiple" variant="outline" size="sm" className="justify-start" value={activeStyles}>
                                <ToggleGroupItem value="bold" aria-label="Toggle bold" asChild>
                                    <button onClick={(e) => handleFormat(e, 'bold')}><Bold className="h-4 w-4" /></button>
                                </ToggleGroupItem>
                            </ToggleGroup>
                             <ToggleGroup type="single" variant="outline" size="sm" className="justify-start ml-2" value={currentBlock}>
                                <ToggleGroupItem value="h1" aria-label="Toggle H1" asChild>
                                     <button onClick={(e) => handleFormat(e, 'h1')}><Heading1 className="h-4 w-4" /></button>
                                </ToggleGroupItem>
                                <ToggleGroupItem value="h2" aria-label="Toggle H2" asChild>
                                     <button onClick={(e) => handleFormat(e, 'h2')}><Heading2 className="h-4 w-4" /></button>
                                </ToggleGroupItem>
                                <ToggleGroupItem value="p" aria-label="Toggle Paragraph" asChild>
                                    <button onClick={(e) => handleFormat(e, 'p')}><Pilcrow className="h-4 w-4" /></button>
                                </ToggleGroupItem>
                            </ToggleGroup>
                             <ToggleGroup type="single" variant="outline" size="sm" className="justify-start ml-2" value={textAlign} onValueChange={(value) => value && handleAlignment(e as any, value as any)}>
                                <ToggleGroupItem value="left" aria-label="Align left" asChild>
                                    <button onClick={(e) => handleAlignment(e, 'left')}><AlignLeft className="h-4 w-4" /></button>
                                </ToggleGroupItem>
                                <ToggleGroupItem value="center" aria-label="Align center" asChild>
                                    <button onClick={(e) => handleAlignment(e, 'center')}><AlignCenter className="h-4 w-4" /></button>
                                </ToggleGroupItem>
                                <ToggleGroupItem value="right" aria-label="Align right" asChild>
                                    <button onClick={(e) => handleAlignment(e, 'right')}><AlignRight className="h-4 w-4" /></button>
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
                                "prose prose-sm max-w-none focus-visible:outline-none",
                                "prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2"
                            )}
                          >
                          </div>
                        </FormControl>
                    </div>
                    <FormDescription>
                        Gunakan tombol di atas untuk memformat teks Anda secara langsung.
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
