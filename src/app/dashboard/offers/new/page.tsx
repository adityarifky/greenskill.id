'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { OfferFormDynamic } from '../_components/offer-form-dynamic';
import type { Scheme } from '@/lib/types';
import * as React from 'react';

export default function NewOfferPage() {
  const firestore = useFirestore();
  const { user } = useUser();
   const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const schemesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'registration_schemas');
  }, [firestore, user]);

  const { data: schemes, isLoading } = useCollection<Scheme>(schemesQuery);

  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Penawaran Baru" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {isClient ? (
             <OfferFormDynamic schemes={schemes || []} isLoading={isLoading} />
          ) : (
             <OfferFormDynamic schemes={[]} isLoading={true} />
          )}
        </div>
      </main>
    </div>
  );
}
