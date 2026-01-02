'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { OfferFormDynamic } from '../_components/offer-form-dynamic';
import type { Module, UserFolder } from '@/lib/types';
import * as React from 'react';

export default function NewOfferPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'modules'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const foldersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'user_folders'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: modules, isLoading: isLoadingModules } = useCollection<Module>(modulesQuery);
  const { data: userFolders, isLoading: isLoadingFolders } = useCollection<UserFolder>(foldersQuery);
  
  const isLoading = isUserLoading || isLoadingModules || isLoadingFolders;

  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Surat Baru" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {isClient ? (
             <OfferFormDynamic 
                allModules={modules || []} 
                userFolders={userFolders || []} 
                isLoading={isLoading} 
              />
          ) : (
             <OfferFormDynamic allModules={[]} userFolders={[]} isLoading={true} />
          )}
        </div>
      </main>
    </div>
  );
}
