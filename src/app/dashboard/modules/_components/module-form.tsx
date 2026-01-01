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
import { Bold, AlignLeft, AlignCenter, AlignRight, Baseline } from 'lucide-react';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [currentFontSize, setCurrentFontSize] = useState('3'); // Default to paragraph size
  const [textAlign, setTextAlign] = useState('left');

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
      });
      if (editorRef.current) {
        editorRef.current.innerHTML = initialData.content;
      }
    }
  }, [initialData, form]);

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
    let alignment = 'left';
    let fontSize = '3'; // Default paragraph size

    let current: Node | null = parentNode;
    while (current && current !== editorRef.current) {
      const el = current as HTMLElement;
      const nodeName = el.nodeName.toLowerCase();
      
      if (['b', 'strong'].includes(nodeName)) styles.push('bold');
      
      if (nodeName === 'font' && el.hasAttribute('size')) {
        fontSize = el.getAttribute('size') || '3';
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
    setCurrentFontSize(fontSize);
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

  const handleFormat = (e: React.MouseEvent<HTMLButtonElement>, style: 'bold') => {
    e.preventDefault();
    execCommand(style);
  };
  
  const handleFontSizeChange = (size: string) => {
    if (size) {
        execCommand('fontSize', size);
    }
  };

  const handleAlignment = (alignment: 'left' | 'center' | 'right' | '') => {
    if (alignment) {
        execCommand(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
        setTextAlign(alignment);
    }
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
                         <div className="p-2 border-b flex items-center gap-2">
                            <ToggleGroup type="multiple" variant="outline" size="sm" className="justify-start" value={activeStyles}>
                                <ToggleGroupItem value="bold" aria-label="Toggle bold" asChild>
                                    <button onClick={(e) => handleFormat(e, 'bold')}><Bold className="h-4 w-4" /></button>
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <Select value={currentFontSize} onValueChange={handleFontSizeChange}>
                                <SelectTrigger className="w-24 h-9">
                                    <Baseline className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Sangat Besar (H1)</SelectItem>
                                    <SelectItem value="6">Lebih Besar (H2)</SelectItem>
                                    <SelectItem value="5">Besar (H3)</SelectItem>
                                    <SelectItem value="4">Agak Besar (H4)</SelectItem>
                                    <SelectItem value="3">Normal</SelectItem>
                                    <SelectItem value="2">Kecil</SelectItem>
                                    <SelectItem value="1">Sangat Kecil</SelectItem>
                                </SelectContent>
                            </Select>
                             <ToggleGroup type="single" variant="outline" size="sm" className="justify-start" value={textAlign} onValueChange={(value: "left" | "center" | "right" | "") => handleAlignment(value)}>
                                <ToggleGroupItem value="left" aria-label="Align left">
                                    <AlignLeft className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="center" aria-label="Align center">
                                    <AlignCenter className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="right" aria-label="Align right">
                                    <AlignRight className="h-4 w-4" />
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
                                "prose-h1:font-bold prose-h2:font-semibold prose-h3:font-medium prose-h4:font-normal", // Example styles
                                "[&_font[size='7']]:text-4xl [&_font[size='7']]:font-bold",
                                "[&_font[size='6']]:text-3xl [&_font[size='6']]:font-bold",
                                "[&_font[size='5']]:text-2xl [&_font[size='5']]:font-semibold",
                                "[&_font[size='4']]:text-xl [&_font[size='4']]:font-semibold",
                                "[&_font[size='3']]:text-base",
                                "[&_font[size='2']]:text-sm",
                                "[&_font[size='1']]:text-xs",
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
