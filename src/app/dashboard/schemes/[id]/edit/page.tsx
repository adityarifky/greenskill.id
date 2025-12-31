
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { SchemeFormDynamic } from '../../_components/scheme-form-dynamic';
import { Scheme } from '@/lib/types';


export default function EditSchemePage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const schemeRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'registration_schemas', params.id);
  }, [firestore, params.id]);

  const { data: scheme, isLoading } = useDoc<Scheme>(schemeRef);

  if (!isLoading && !scheme) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Edit Skema" />
      <main className="flex-1 p-4 md:p-8">
        <SchemeFormDynamic initialData={scheme} />
      </main>
    </div>
  );
}
