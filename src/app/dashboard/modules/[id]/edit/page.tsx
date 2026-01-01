'use client';

import { doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Header } from '@/components/layout/header';
import { ModuleFormDynamic } from '../_components/module-form-dynamic';
import type { Module } from '@/lib/types';

export default function EditModulePage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { id } = params;

  const moduleRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'modules', id);
  }, [firestore, id]);

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
