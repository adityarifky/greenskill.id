'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { notFound, useParams } from 'next/navigation';
import type { Module } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ModuleFormDynamic } from '../../_components/module-form-dynamic';
import { Button } from '@/components/ui/button';


export default function EditModulePage() {
  const params = useParams<{ id: string }>();
  const firestore = useFirestore();

  const moduleRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
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
            <div className="mb-6">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/modules">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Modul
                    </Link>
                </Button>
            </div>
            <ModuleFormDynamic initialData={module} isLoading={isLoading} />
         </div>
      </main>
    </div>
  );
}
