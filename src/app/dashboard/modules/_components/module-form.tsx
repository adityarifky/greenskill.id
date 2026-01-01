'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import type { Module } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import React, { useRef, useEffect, memo, forwardRef, useImperativeHandle } from 'react';
import { Bold, AlignLeft, AlignCenter, AlignRight, ChevronDown } from 'lucide-react';

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// --- Text Editor Component ---
const TextEditor = memo(forwardRef(function TextEditor({ initialContent }: { initialContent: string }, ref) {
    const editorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getContent: () => {
            return editorRef.current?.innerHTML || '';
        }
    }));

    useEffect(() => {
        if (editorRef.current && initialContent) {
            editorRef.current.innerHTML = initialContent;
        }
    }, [initialContent]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const applyFontSize = (size: string) => {
        execCommand('formatBlock', 'p');
        execCommand('fontSize', size);
    }
    
    return (
        <div className="rounded-md border border-input">
            <div className="p-2 border-b flex items-center space-x-1">
                <ToggleGroup type="multiple" variant="outline" size="sm">
                    <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => execCommand('bold')}>
                        <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
                 <ToggleGroup type="single" variant="outline" size="sm">
                    <ToggleGroupItem value="left" aria-label="Align left" onClick={() => execCommand('justifyLeft')}>
                        <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Align center" onClick={() => execCommand('justifyCenter')}>
                        <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" aria-label="Align right" onClick={() => execCommand('justifyRight')}>
                        <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>

                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                            Ukuran Teks
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => applyFontSize('1')}>Sangat Kecil</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => applyFontSize('2')}>Kecil</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => applyFontSize('3')}>Normal</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => applyFontSize('4')}>Sedang</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => applyFontSize('5')}>Besar</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => applyFontSize('6')}>Sangat Besar</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => applyFontSize('7')}>Judul</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div
                ref={editorRef}
                id="content-editor"
                contentEditable={true}
                suppressContentEditableWarning={true}
                className={cn(
                    "min-h-[400px] w-full rounded-b-md bg-transparent px-3 py-2 text-sm ring-offset-background",
                    "focus-visible:outline-none",
                    "[&_font[size='7']]:text-4xl [&_font[size='7']]:font-bold",
                    "[&_font[size='6']]:text-3xl [&_font[size='6']]:font-bold",
                    "[&_font[size='5']]:text-2xl [&_font[size='5']]:font-semibold",
                    "[&_font[size='4']]:text-xl [&_font[size='4']]:font-semibold",
                    "[&_font[size='3']]:text-base",
                    "[&_font[size='2']]:text-sm",
                    "[&_font[size='1']]:text-xs",
                )}
                 dangerouslySetInnerHTML={{ __html: initialContent }}
            />
        </div>
    );
}));

// --- Main Module Form Component ---
const formSchema = z.object({
  title: z.string().min(3, { message: 'Judul modul harus memiliki setidaknya 3 karakter.' }),
  content: z.string(), // This field is now just for passing initial data
});

const contentValidationSchema = z.string().min(10, { message: 'Konten modul harus memiliki setidaknya 10 karakter.' });


type ModuleFormValues = z.infer<typeof formSchema>;

interface ModuleFormProps {
  initialData?: Module | null;
  onSave?: () => void;
}

export function ModuleForm({ initialData, onSave }: ModuleFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const editorComponentRef = useRef<{ getContent: () => string }>(null);

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
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

    const currentContent = editorComponentRef.current?.getContent() || '';
    
    const contentValidationResult = contentValidationSchema.safeParse(currentContent);
    if (!contentValidationResult.success) {
      form.setError('content', {
        type: 'manual',
        message: contentValidationResult.error.issues[0].message
      });
      return;
    }
    
    try {
        const finalData = { ...data, content: currentContent };

        if (initialData) {
            const docRef = doc(firestore, 'modules', initialData.id);
            await setDoc(docRef, { 
                ...finalData, 
                updatedAt: serverTimestamp(),
                userId: user.uid
            }, { merge: true });
        } else {
            await addDoc(collection(firestore, 'modules'), {
                ...finalData,
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
                    <FormControl>
                      <TextEditor 
                        ref={editorComponentRef}
                        initialContent={field.value} 
                      />
                    </FormControl>
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
