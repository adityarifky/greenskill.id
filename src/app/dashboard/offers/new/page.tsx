'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { OfferFormDynamic } from '../_components/offer-form-dynamic';
import type { Module } from '@/lib/types';
import * as React from 'react';

export default function NewOfferPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
   const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'modules'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: modules, isLoading: isLoadingModules } = useCollection<Module>(modulesQuery);

  const isLoading = isUserLoading || isLoadingModules;

  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Surat Baru" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {isClient ? (
             <OfferFormDynamic modules={modules || []} isLoading={isLoading} />
          ) : (
             <OfferFormDynamic modules={[]} isLoading={true} />
          )}
        </div>
      </main>
    </div>
  );
}
