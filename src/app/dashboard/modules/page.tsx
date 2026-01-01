'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal, BookOpen, Trash2, FileEdit, FolderPlus, Folder, ArrowRight, GripVertical } from 'lucide-react';
import * as React from 'react';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, deleteDoc, doc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { Module, UserFolder } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { ModuleFormDynamic } from './_components/module-form-dynamic';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ModulesPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [moduleToDelete, setModuleToDelete] = React.useState<Module | null>(null);
  const [folderToDelete, setFolderToDelete] = React.useState<UserFolder | null>(null);
  const [moduleToPreview, setModuleToPreview] = React.useState<Module | null>(null);
  const [moduleToEdit, setModuleToEdit] = React.useState<Module | null>(null);
  const [isAddFolderOpen, setIsAddFolderOpen] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');
  
  const [openedFolder, setOpenedFolder] = React.useState<{id: string, name: string} | null>(null);
  const [folderModules, setFolderModules] = React.useState<Module[]>([]);
  const [draggedModule, setDraggedModule] = React.useState<Module | null>(null);


  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'modules'), where('userId', '==', user?.uid));
  }, [firestore, user]);

  const foldersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'user_folders'), where('userId', '==', user?.uid));
  }, [firestore, user]);

  const { data: modules, isLoading: isLoadingModules } = useCollection<Module>(modulesQuery);
  const { data: userFolders, isLoading: isLoadingFolders } = useCollection<UserFolder>(foldersQuery);
  
  const isLoading = isUserLoading || isLoadingModules || isLoadingFolders;
  
  const openFolderContent = (folder: {id: string, name: string}) => {
    setOpenedFolder(folder);
    const filteredModules = modules?.filter(m => (folder.id === 'folder-surat-penawaran') ? (m.folderId === 'folder-surat-penawaran' || !m.folderId) : m.folderId === folder.id) || [];
    setFolderModules(filteredModules);
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, module: Module) => {
    setDraggedModule(module);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetModule: Module) => {
    e.preventDefault();
    if (!draggedModule || draggedModule.id === targetModule.id) {
      setDraggedModule(null);
      return;
    }

    const newModules = [...folderModules];
    const draggedIndex = newModules.findIndex(m => m.id === draggedModule.id);
    const targetIndex = newModules.findIndex(m => m.id === targetModule.id);
    
    // Remove the dragged module and insert it at the target position
    newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedModule);

    setFolderModules(newModules);
    setDraggedModule(null);
     // Here you would typically save the new order to Firestore
    toast({
        title: "Urutan Diubah",
        description: `Modul "${draggedModule.title}" dipindahkan.`,
    });
  };


  const handleEditClick = (module: Module) => {
    setOpenedFolder(null); // Close folder content dialog if open
    setModuleToPreview(null); // Close preview dialog if open
    setModuleToEdit(module);
  };
  
  const handleDeleteModule = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!moduleToDelete || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'modules', moduleToDelete.id));
      toast({
        title: 'Sukses!',
        description: 'Modul berhasil dihapus.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Gagal!',
        description: 'Terjadi kesalahan saat menghapus modul.',
      });
      console.error("Error deleting document: ", error);
    } finally {
        setModuleToDelete(null);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'user_folders', folderToDelete.id));
      // Optional: Add logic to handle modules inside the deleted folder
      toast({
        title: 'Sukses!',
        description: `Folder "${folderToDelete.name}" berhasil dihapus.`,
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Gagal!',
        description: 'Terjadi kesalahan saat menghapus folder.',
      });
      console.error("Error deleting folder: ", error);
    } finally {
        setFolderToDelete(null);
    }
  };

  const getFormattedDate = (date: any) => {
    if (!date) return '-';
    if (date.seconds) {
      return format(new Date(date.seconds * 1000), "d MMMM yyyy, HH:mm", { locale: id });
    }
    if (date instanceof Date) {
      return format(date, "d MMMM yyyy, HH:mm", { locale: id });
    }
    return '-';
  };

  const handleSaveFolder = async () => {
    if (newFolderName.trim() === '' || !firestore || !user) {
        toast({
            variant: 'destructive',
            title: 'Gagal!',
            description: 'Nama folder tidak boleh kosong atau pengguna tidak terautentikasi.',
        });
        return;
    }
    
    try {
      await addDoc(collection(firestore, 'user_folders'), {
        name: newFolderName,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      toast({
          title: 'Sukses!',
          description: `Folder "${newFolderName}" berhasil dibuat.`,
      });
      setNewFolderName('');
      setIsAddFolderOpen(false);
    } catch(error) {
      console.error("Error adding folder: ", error);
       toast({
            variant: 'destructive',
            title: 'Gagal!',
            description: 'Terjadi kesalahan saat membuat folder.',
        });
    }
  };
  
  return (
    <div className="flex h-full flex-col">
      <Header title="Daftar Modul" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Daftar Modul Pelatihan</h2>
              <p className="text-muted-foreground">Kelola semua modul pelatihan Anda di sini.</p>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" onClick={() => setIsAddFolderOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Tambah Folder
              </Button>
              <Button asChild>
                <Link href="/dashboard/modules/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Modul Baru
                </Link>
              </Button>
            </div>
          </div>

          {!isLoading && (!modules || modules.length === 0) && (!userFolders || userFolders.length === 0) ? (
              <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-full">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">Belum Ada Modul atau Folder</h3>
                <p className="mb-4">Mulai buat modul atau folder pertama Anda.</p>
                 <Button asChild>
                    <Link href="/dashboard/modules/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Modul Baru
                    </Link>
                 </Button>
              </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    <>
                      <Card>
                          <CardHeader>
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                          </CardHeader>
                          <CardFooter>
                              <Skeleton className="h-4 w-full" />
                          </CardFooter>
                      </Card>
                       <Card>
                          <CardHeader>
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                          </CardHeader>
                          <CardFooter>
                              <Skeleton className="h-4 w-full" />
                          </CardFooter>
                      </Card>
                    </>
                  ) : (
                    <>
                      <Card 
                        key="folder-surat-penawaran" 
                        className="flex flex-col h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-amber-50/50"
                        onClick={() => openFolderContent({id: 'folder-surat-penawaran', name: 'Surat Penawaran'})}
                      >
                          <CardHeader className="flex-row items-start justify-between">
                             <CardTitle className="text-base leading-snug break-words">Surat Penawaran</CardTitle>
                             <Folder className="h-5 w-5 text-amber-500" />
                          </CardHeader>
                          <CardContent className="flex-grow flex items-center justify-center">
                             <Folder className="h-16 w-16 text-amber-200" />
                          </CardContent>
                          <CardFooter className="flex justify-between items-center w-full">
                             <p className="text-xs text-muted-foreground">{modules?.filter(m => m.folderId === 'folder-surat-penawaran' || !m.folderId).length || 0} Modul</p>
                             <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </CardFooter>
                      </Card>

                      {userFolders?.map((folder) => (
                         <Card 
                            key={folder.id} 
                            className="flex flex-col h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-amber-50/50 group"
                          >
                              <CardHeader className="flex-row items-start justify-between">
                                 <CardTitle className="text-base leading-snug break-words cursor-pointer flex-grow" onClick={() => openFolderContent(folder)}>{folder.name}</CardTitle>
                                 <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button 
                                            aria-haspopup="true" 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Aksi Folder</DropdownMenuLabel>
                                           <DropdownMenuItem 
                                                className="text-destructive focus:bg-destructive/10 focus:text-destructive" 
                                                onSelect={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setFolderToDelete(folder);
                                                }}
                                            >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </CardHeader>
                              <CardContent className="flex-grow flex items-center justify-center cursor-pointer" onClick={() => openFolderContent(folder)}>
                                 <Folder className="h-16 w-16 text-amber-200" />
                              </CardContent>
                              <CardFooter className="flex justify-between items-center w-full cursor-pointer" onClick={() => openFolderContent(folder)}>
                                 <p className="text-xs text-muted-foreground">{modules?.filter(m => m.folderId === folder.id).length || 0} Modul</p>
                                 <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </CardFooter>
                          </Card>
                      ))}
                    </>
                  )}
             </div>
          )}
      </main>

       <AlertDialog open={!!moduleToDelete} onOpenChange={(open) => !open && setModuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat diurungkan. Modul "{moduleToDelete?.title}" akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteModule} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
       <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Folder Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus folder "{folderToDelete?.name}"? Tindakan ini tidak dapat diurungkan. Modul di dalam folder ini tidak akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive hover:bg-destructive/90">
              Hapus Folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!moduleToPreview} onOpenChange={(open) => !open && setModuleToPreview(null)}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{moduleToPreview?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-6 -mr-6">
            <div
                className={cn(
                    "min-h-full w-full bg-transparent text-sm ring-offset-background",
                    "prose-h1:font-bold prose-h2:font-semibold prose-h3:font-medium prose-h4:font-normal",
                    "[&_font[size='7']]:text-4xl [&_font[size='7']]:font-bold",
                    "[&_font[size='6']]:text-3xl [&_font[size='6']]:font-bold",
                    "[&_font[size='5']]:text-2xl [&_font[size='5']]:font-semibold",
                    "[&_font[size='4']]:text-xl [&_font[size='4']]:font-semibold",
                    "[&_font[size='3']]:text-base",
                    "[&_font[size='2']]:text-sm",
                    "[&_font[size='1']]:text-xs",
                    "[&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table_td]:border [&_table_td]:p-2 [&_table_th]:border [&_table_th]:p-2"
                )}
                dangerouslySetInnerHTML={{ __html: moduleToPreview?.content || '' }}
            />
          </ScrollArea>
           <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => moduleToPreview && handleEditClick(moduleToPreview)}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!moduleToEdit} onOpenChange={(open) => {
        if (!open) {
          setModuleToEdit(null);
        }
      }}>
        <DialogContent className="max-w-4xl">
           <DialogHeader>
             <DialogTitle>Edit Modul</DialogTitle>
           </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto p-1">
              <ModuleFormDynamic 
                  initialData={moduleToEdit}
                  folders={userFolders || []}
                  onSave={() => setModuleToEdit(null)}
              />
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!openedFolder} onOpenChange={(open) => !open && setOpenedFolder(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Isi Folder: {openedFolder?.name}</DialogTitle>
            <DialogDescription>
              Berikut adalah daftar semua modul yang ada di dalam folder ini.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow">
              <div className="space-y-3 pr-4">
                {!isLoading && folderModules.map((module, index) => (
                  <Card 
                    key={module.id} 
                    className="flex items-center p-3 gap-4 group/item transition-shadow duration-200"
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, module)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, module)}
                  >
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab opacity-0 group-hover/item:opacity-100 transition-opacity"/>
                      <span className="text-lg font-bold text-muted-foreground w-6 text-center">{index + 1}.</span>
                      <div className="flex-grow">
                          <h4 className="font-semibold text-base">{module.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Dibuat pada {getFormattedDate(module.createdAt)}
                          </p>
                      </div>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button 
                                aria-haspopup="true" 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setModuleToPreview(module)}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Pratinjau
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(module)}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive" 
                              onSelect={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setModuleToDelete(module);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                  </Card>
                ))}
                 {isLoading && [...Array(5)].map((_, i) => (
                    <Card key={i} className="flex items-center p-3 gap-4">
                        <Skeleton className="h-6 w-6" />
                        <div className="flex-grow space-y-2">
                           <Skeleton className="h-5 w-3/4" />
                           <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                    </Card>
                ))}
                {!isLoading && folderModules.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">Folder ini kosong.</div>
                )}
              </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Buat Folder Baru</DialogTitle>
                <DialogDescription>
                    Masukkan nama untuk folder baru Anda, lalu klik simpan.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="folder-name" className="text-right">
                        Nama Folder
                    </Label>
                    <Input
                        id="folder-name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="col-span-3"
                        placeholder="Contoh: Modul K3"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddFolderOpen(false)}>Batal</Button>
                <Button onClick={handleSaveFolder}>Simpan Folder</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
