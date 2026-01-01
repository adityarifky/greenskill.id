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
import { Bold, AlignLeft, AlignCenter, AlignRight, ChevronDown, Table, Plus, Trash2, Pilcrow, Type } from 'lucide-react';

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserFolder } from '@/lib/types';


// --- Text Editor Component ---
const TextEditor = memo(forwardRef(function TextEditor({ initialContent }: { initialContent: string }, ref) {
    const editorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getContent: () => {
            return editorRef.current?.innerHTML || '';
        }
    }));

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = initialContent;
        }
    }, [initialContent]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    event.preventDefault();
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const dataUrl = e.target?.result as string;
                            document.execCommand('insertImage', false, dataUrl);
                        };
                        reader.readAsDataURL(blob);
                    }
                    return; 
                }
            }
        };
        
        editor.addEventListener('paste', handlePaste);

        return () => {
            // Check if the editor element still exists before removing the listener
            if (editor) {
                editor.removeEventListener('paste', handlePaste);
            }
        };
    }, []);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const applyFontSize = (size: string) => {
        execCommand('formatBlock', 'p'); 
        execCommand('fontSize', size);
    }
    
    const handleTableAction = (action: 'insert' | 'addRow' | 'addCol' | 'deleteRow' | 'deleteCol' | 'deleteTable') => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        let cell = (node.nodeName === 'TD' || node.nodeName === 'TH') ? node : node.parentElement?.closest('td, th');
        
        if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            cell = node.parentElement.closest('td, th');
        }

        if (action === 'insert') {
            const newTable = `
                <table style="border-collapse: collapse; width: 100%;">
                    <tbody>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;">&nbsp;</td>
                            <td style="border: 1px solid black; padding: 8px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;">&nbsp;</td>
                            <td style="border: 1px solid black; padding: 8px;">&nbsp;</td>
                        </tr>
                    </tbody>
                </table><p><br></p>`;
            execCommand('insertHTML', newTable);
            return;
        }

        const table = cell?.closest('table');
        const row = cell?.parentElement as HTMLTableRowElement;

        if (!table || !row || !cell) return;

        const rowIndex = Array.from(table.rows).indexOf(row);
        const cellIndex = Array.from(row.cells).indexOf(cell as HTMLTableCellElement);

        switch (action) {
            case 'addRow': {
                const newRow = table.insertRow(rowIndex + 1);
                for (let i = 0; i < row.cells.length; i++) {
                    const newCell = newRow.insertCell(i);
                    newCell.style.border = '1px solid black';
                    newCell.style.padding = '8px';
                    newCell.innerHTML = '&nbsp;';
                }
                break;
            }
            case 'addCol': {
                for (const r of Array.from(table.rows)) {
                    const newCell = r.insertCell(cellIndex + 1);
                    newCell.style.border = '1px solid black';
                    newCell.style.padding = '8px';
                    newCell.innerHTML = '&nbsp;';
                }
                break;
            }
            case 'deleteRow': {
                if (table.rows.length > 1) {
                    table.deleteRow(rowIndex);
                } else {
                    table.remove();
                }
                break;
            }
            case 'deleteCol': {
                if (row.cells.length > 1) {
                    for (const r of Array.from(table.rows)) {
                        r.deleteCell(cellIndex);
                    }
                } else {
                    table.remove();
                }
                break;
            }
            case 'deleteTable': {
                table.remove();
                break;
            }
        }
        editorRef.current?.focus();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.altKey) {
            handleTableAction('deleteCol');
        } else {
            handleTableAction('deleteRow');
        }
    }
    
    const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            let cell = (node.nodeName === 'TD' || node.nodeName === 'TH') ? node : node.parentElement?.closest('td, th');
            if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
                cell = node.parentElement.closest('td, th');
            }

            if (cell) {
                 const row = cell.parentElement as HTMLTableRowElement;
                 if (cell.cellIndex === row.cells.length -1) {
                    e.preventDefault();
                    handleTableAction('addRow');
                 }
            }
        }
    }


    return (
        <TooltipProvider>
            <div className="rounded-md border border-input">
                <div className="p-2 border-b flex items-center flex-wrap gap-1">
                    <ToggleGroup type="multiple" variant="outline" size="sm">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => execCommand('bold')}>
                                    <Bold className="h-4 w-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>Tebal</TooltipContent>
                        </Tooltip>
                    </ToggleGroup>
                    <ToggleGroup type="single" variant="outline" size="sm">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="left" aria-label="Align left" onClick={() => execCommand('justifyLeft')}>
                                    <AlignLeft className="h-4 w-4" />
                                </ToggleGroupItem>
                             </TooltipTrigger>
                            <TooltipContent>Rata Kiri</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                             <TooltipTrigger asChild>
                                <ToggleGroupItem value="center" aria-label="Align center" onClick={() => execCommand('justifyCenter')}>
                                    <AlignCenter className="h-4 w-4" />
                                </ToggleGroupItem>
                             </TooltipTrigger>
                            <TooltipContent>Rata Tengah</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                             <TooltipTrigger asChild>
                                <ToggleGroupItem value="right" aria-label="Align right" onClick={() => execCommand('justifyRight')}>
                                    <AlignRight className="h-4 w-4" />
                                </ToggleGroupItem>
                             </TooltipTrigger>
                            <TooltipContent>Rata Kanan</TooltipContent>
                        </Tooltip>
                    </ToggleGroup>
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <Type className="h-4 w-4" />
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                             <TooltipContent>Ukuran Teks</TooltipContent>
                        </Tooltip>
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
                     <div className="h-6 border-l border-border mx-1"></div>
                    <ToggleGroup type="single" variant="outline" size="sm">
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="insertTable" aria-label="Insert table" onClick={() => handleTableAction('insert')}>
                                    <Table className="h-4 w-4" />
                                </ToggleGroupItem>
                             </TooltipTrigger>
                            <TooltipContent>Sisipkan Tabel</TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="addRow" aria-label="Add row" onClick={() => handleTableAction('addRow')}>
                                    <Pilcrow className="h-4 w-4" />
                                </ToggleGroupItem>
                             </TooltipTrigger>
                            <TooltipContent>Tambah Baris</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="addCol" aria-label="Add column" onClick={() => handleTableAction('addCol')}>
                                    <Plus className="h-4 w-4" />
                                </ToggleGroupItem>
                             </TooltipTrigger>
                             <TooltipContent>Tambah Kolom</TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem value="delete" aria-label="Delete" onClick={handleDeleteClick} onDoubleClick={(e) => { e.preventDefault(); handleTableAction('deleteTable')}}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </ToggleGroupItem>
                             </TooltipTrigger>
                             <TooltipContent>Hapus Baris (Klik), Kolom (Alt+Klik), Tabel (Dbl Klik)</TooltipContent>
                        </Tooltip>
                    </ToggleGroup>
                </div>
                <div
                    ref={editorRef}
                    id="content-editor"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    className={cn(
                        "min-h-[400px] w-full rounded-b-md bg-transparent p-3 text-sm ring-offset-background",
                        "focus-visible:outline-none",
                        "[&_font[size='7']]:text-4xl [&_font[size='7']]:font-bold",
                        "[&_font[size='6']]:text-3xl [&_font[size='6']]:font-bold",
                        "[&_font[size='5']]:text-2xl [&_font[size='5']]:font-semibold",
                        "[&_font[size='4']]:text-xl [&_font[size='4']]:font-semibold",
                        "[&_font[size='3']]:text-base",
                        "[&_font[size='2']]:text-sm",
                        "[&_font[size='1']]:text-xs",
                        "[&_table]:w-full [&_table]:border-collapse [&_table_td]:border [&_table_td]:p-2 [&_table_th]:border [&_table_th]:p-2",
                        "[&_img]:max-w-full [&_img]:h-auto"
                    )}
                    onKeyDown={handleEditorKeyDown}
                />
            </div>
        </TooltipProvider>
    );
}));

// --- Main Module Form Component ---
const formSchema = z.object({
  title: z.string().min(3, { message: 'Judul modul harus memiliki setidaknya 3 karakter.' }),
  folderId: z.string().optional(),
  content: z.string(), // This field is now just for passing initial data
});

const contentValidationSchema = z.string().min(10, { message: 'Konten modul harus memiliki setidaknya 10 karakter.' });


type ModuleFormValues = z.infer<typeof formSchema>;

interface ModuleFormProps {
  initialData?: Module | null;
  folders: UserFolder[];
  onSave?: () => void;
}

export function ModuleForm({ initialData, folders, onSave }: ModuleFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const editorComponentRef = useRef<{ getContent: () => string }>(null);

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      content: '',
      folderId: 'folder-surat-penawaran',
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
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = currentContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";
      
      if (textContent.length < 10) {
        form.setError('content', {
            type: 'manual',
            message: contentValidationResult.error.issues[0].message
        });
        return;
      }
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
                  name="folderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Folder</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih folder untuk menyimpan modul ini" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="folder-surat-penawaran">Surat Penawaran (Default)</SelectItem>
                           {folders.map(folder => (
                             <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Modul akan disimpan di dalam folder yang Anda pilih.
                      </FormDescription>
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
                        Gunakan tombol di atas untuk memformat teks Anda. Anda juga bisa copy-paste gambar langsung ke editor.
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
