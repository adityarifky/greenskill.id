'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import type { Module } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ModuleFormDynamic } from '../../_components/module-form-dynamic';


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
  
  return (
    <div className="flex h-full flex-col">
      <Header title="Edit Modul" />
      <main className="flex-1 p-4 md:p-8">
         <div className="mx-auto max-w-4xl">
            <ModuleFormDynamic initialData={module} isLoading={isLoading} />
         </div>
      </main>
    </div>
  );
}
