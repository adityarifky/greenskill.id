'use client';

import { useDoc, useFirestore, useMemoFirebase, useCollection, useUser } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { OfferFormDynamic } from '../../_components/offer-form-dynamic';
import type { Offer, Module, UserFolder } from '@/lib/types';
import { use } from 'react';

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const offerRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'training_offers', id);
  }, [firestore, id]);

  const allModulesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'modules'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const userFoldersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'user_folders'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: offer, isLoading: isLoadingOffer } = useDoc<Offer>(offerRef);
  const { data: allModules, isLoading: isLoadingModules } = useCollection<Module>(allModulesQuery);
  const { data: userFolders, isLoading: isLoadingFolders } = useCollection<UserFolder>(userFoldersQuery);

  const isLoading = isLoadingOffer || isLoadingModules || isLoadingFolders || isUserLoading;

  if (!isLoadingOffer && !offer) {
    notFound();
  }
  
  if (isLoading) {
    return (
        <div className="flex h-full flex-col">
            <Header title="Edit Surat" />
            <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto max-w-2xl">
                <OfferFormDynamic initialData={null} allModules={[]} userFolders={[]} isLoading={true} />
            </div>
            </main>
        </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Edit Surat" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <OfferFormDynamic 
            initialData={offer} 
            allModules={allModules || []}
            userFolders={userFolders || []}
          />
        </div>
      </main>
    </div>
  );
}
