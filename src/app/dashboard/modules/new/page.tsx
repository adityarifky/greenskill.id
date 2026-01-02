'use client';

import { Header } from '@/components/layout/header';
import { ModuleFormDynamic } from '../_components/module-form-dynamic';
import * as React from 'react';
import type { Module, UserFolder } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function NewModulePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const foldersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'user_folders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'modules'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: folders, isLoading: isLoadingFolders } = useCollection<UserFolder>(foldersQuery);
  const { data: modules, isLoading: isLoadingModules } = useCollection<Module>(modulesQuery);

  const isLoading = isUserLoading || isLoadingFolders || isLoadingModules;


  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Modul Baru" />
      <main className="flex-1 p-4 md:p-8">
         <div className="mx-auto max-w-4xl">
            <ModuleFormDynamic folders={folders || []} moduleCount={modules?.length || 0} isLoading={isLoading} />
         </div>
      </main>
    </div>
  );
}
