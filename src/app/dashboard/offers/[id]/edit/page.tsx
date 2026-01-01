'use client';

import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { OfferFormDynamic } from '../../_components/offer-form-dynamic';
import type { Offer, Scheme } from '@/lib/types';
import { use } from 'react';

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();

  const offerRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'training_offers', id);
  }, [firestore, id]);

  const schemesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'registration_schemas');
  }, [firestore]);

  const { data: offer, isLoading: isLoadingOffer } = useDoc<Offer>(offerRef);
  const { data: schemes, isLoading: isLoadingSchemes } = useCollection<Scheme>(schemesQuery);

  if (!isLoadingOffer && !offer) {
    notFound();
  }
  
  if (isLoadingOffer || isLoadingSchemes) {
    return (
        <div className="flex h-full flex-col">
            <Header title="Edit Penawaran" />
            <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto max-w-2xl">
                <OfferFormDynamic initialData={null} schemes={[]} isLoading={true} />
            </div>
            </main>
        </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Edit Penawaran" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <OfferFormDynamic initialData={offer} schemes={schemes || []} />
        </div>
      </main>
    </div>
  );
}
