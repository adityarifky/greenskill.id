'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import type { Module } from '@/lib/types';
import { ModuleForm } from '../../_components/module-form';
import { Skeleton } from '@/components/ui/skeleton';


export default function EditModulePage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const moduleRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'modules', params.id);
  }, [firestore, params.id]);

  const { data: module, isLoading } = useDoc<Module>(moduleRef);

  if (!isLoading && !module) {
    notFound();
  }
  
  const FormSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-12 w-full" />
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <Header title="Edit Modul" />
      <main className="flex-1 p-4 md:p-8">
         <div className="mx-auto max-w-4xl">
            {isLoading ? <FormSkeleton /> : <ModuleForm initialData={module} />}
         </div>
      </main>
    </div>
  );
}
