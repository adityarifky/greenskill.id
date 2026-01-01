'use client';

import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { notFound, useRouter } from 'next/navigation';
import type { Module } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import * as React from 'react';


export default function ModuleDetailsPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const router = useRouter();

  const moduleRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'modules', params.id);
  }, [firestore, params.id]);

  const { data: module, isLoading } = useDoc<Module>(moduleRef);

  const handleDelete = async () => {
    if (!module || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'modules', module.id));
      toast({
        title: 'Sukses!',
        description: 'Modul berhasil dihapus.',
      });
      router.push('/dashboard/modules');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Gagal!',
        description: 'Terjadi kesalahan saat menghapus modul.',
      });
      console.error("Error deleting document: ", error);
    }
  };

  if (isLoading) {
      return (
          <div className="flex h-full flex-col">
              <Header title="Detail Modul" />
              <main className="flex-1 p-4 md:p-8">
                  <div className="mx-auto max-w-4xl space-y-6">
                      <Skeleton className="h-10 w-48" />
                      <Card>
                          <CardHeader>
                              <Skeleton className="h-8 w-3/4" />
                          </CardHeader>
                          <CardContent>
                              <div className="space-y-4">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-5/6" />
                              </div>
                          </CardContent>
                      </Card>
                  </div>
              </main>
          </div>
      )
  }

  if (!module) {
    notFound();
  }
  
  return (
    <div className="flex h-full flex-col">
      <Header title="Detail Modul" />
      <main className="flex-1 p-4 md:p-8">
         <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex justify-between items-center">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/modules">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Modul
                    </Link>
                </Button>
                 <div className="flex items-center gap-2">
                     <Button asChild>
                         <Link href={`/dashboard/modules/${module.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                         </Link>
                     </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                            <AlertDialogDescription>
                            Tindakan ini tidak dapat diurungkan. Modul "{module.title}" akan dihapus secara permanen.
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
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: module.content }}
                    />
                </CardContent>
            </Card>
         </div>
      </main>
    </div>
  );
}
