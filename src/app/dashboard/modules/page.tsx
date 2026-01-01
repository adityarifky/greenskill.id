'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal, BookOpen } from 'lucide-react';
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
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

export default function ModulesPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [moduleToDelete, setModuleToDelete] = React.useState<Module | null>(null);

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'modules'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: modules, isLoading: isLoadingModules } = useCollection<Module>(modulesQuery);
  
  const isLoading = isUserLoading || isLoadingModules;
  
  const handleDelete = async () => {
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Modul Pelatihan</CardTitle>
                <CardDescription>Kelola semua modul pelatihan Anda di sini.</CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/modules/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Modul Baru
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul Modul</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead>
                      <span className="sr-only">Aksi</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                  {!isLoading && modules?.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{module.title}</TableCell>
                      <TableCell>
                        {getFormattedDate(module.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/modules/${module.id}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setModuleToDelete(module)}>Hapus</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             {!isLoading && (!modules || modules.length === 0) && (
              <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">Belum Ada Modul</h3>
                <p>Mulai buat modul pelatihan pertama Anda.</p>
                 <Button asChild variant="link">
                    <Link href="/dashboard/modules/new">
                        Buat Modul Baru
                    </Link>
                 </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
