'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal, BookOpen, Trash2, FileEdit, X } from 'lucide-react';
import * as React from 'react';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Module } from '@/lib/types';
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
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ModulesPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [moduleToDelete, setModuleToDelete] = React.useState<Module | null>(null);
  const [moduleToPreview, setModuleToPreview] = React.useState<Module | null>(null);

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'modules'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: modules, isLoading: isLoadingModules } = useCollection<Module>(modulesQuery);
  
  const isLoading = isUserLoading || isLoadingModules;
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
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

  const getFormattedDate = (date: any) => {
    if (!date) return '-';
    // If it's a Firestore timestamp, convert it
    if (date.seconds) {
      return format(new Date(date.seconds * 1000), "d MMMM yyyy, HH:mm", { locale: id });
    }
    // If it's already a Date object
    if (date instanceof Date) {
      return format(date, "d MMMM yyyy, HH:mm", { locale: id });
    }
    return '-';
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
            <Button asChild>
              <Link href="/dashboard/modules/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Buat Modul Baru
              </Link>
            </Button>
          </div>

          {!isLoading && (!modules || modules.length === 0) ? (
              <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-full">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">Belum Ada Modul</h3>
                <p className="mb-4">Mulai buat modul pelatihan pertama Anda.</p>
                 <Button asChild>
                    <Link href="/dashboard/modules/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Modul Baru
                    </Link>
                 </Button>
              </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading && (
                    <>
                      {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardFooter>
                                <Skeleton className="h-4 w-full" />
                            </CardFooter>
                        </Card>
                      ))}
                    </>
                  )}
                  {!isLoading && modules?.map((module) => (
                      <Card 
                        key={module.id} 
                        className="flex flex-col h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                        onClick={() => setModuleToPreview(module)}
                      >
                          <CardHeader className="flex-row items-start justify-between">
                            <CardTitle className="text-lg leading-tight break-words">{module.title}</CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button 
                                    aria-haspopup="true" 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 -mt-2 -mr-2"
                                    onClick={(e) => {
                                      e.preventDefault(); 
                                      e.stopPropagation();
                                    }}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setModuleToDelete(module)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </CardHeader>
                          <CardContent className="flex-grow"></CardContent>
                          <CardFooter>
                            <p className="text-xs text-muted-foreground">
                                Dibuat pada {getFormattedDate(module.createdAt)}
                            </p>
                          </CardFooter>
                      </Card>
                  ))}
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
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
                    "prose prose-sm max-w-none",
                    "[&_font[size='7']]:text-4xl [&_font[size='7']]:font-bold",
                    "[&_font[size='6']]:text-3xl [&_font[size='6']]:font-bold",
                    "[&_font[size='5']]:text-2xl [&_font[size='5']]:font-semibold",
                    "[&_font[size='4']]:text-xl [&_font[size='4']]:font-semibold",
                    "[&_font[size='3']]:text-base",
                    "[&_font[size='2']]:text-sm",
                    "[&_font[size='1']]:text-xs",
                )}
                dangerouslySetInnerHTML={{ __html: moduleToPreview?.content || '' }}
            />
          </ScrollArea>
           <DialogFooter className="pt-4">
              <Button asChild variant="outline">
                <Link href={`/dashboard/modules/${moduleToPreview?.id}`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
