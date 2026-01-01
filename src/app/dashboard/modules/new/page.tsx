'use client';

import { Header } from '@/components/layout/header';
import { ModuleFormDynamic } from '../_components/module-form-dynamic';
import * as React from 'react';
import type { UserFolder } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function NewModulePage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const foldersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'user_folders'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: folders, isLoading: isLoadingFolders } = useCollection<UserFolder>(foldersQuery);
  
  const isLoading = isUserLoading || isLoadingFolders;


  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Modul Baru" />
      <main className="flex-1 p-4 md:p-8">
         <div className="mx-auto max-w-4xl">
            <ModuleFormDynamic folders={folders || []} isLoading={isLoading} />
         </div>
      </main>
    </div>
  );
}
