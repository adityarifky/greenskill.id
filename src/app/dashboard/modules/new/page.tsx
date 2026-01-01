'use client';

import { Header } from '@/components/layout/header';
import { ModuleFormDynamic } from '../_components/module-form-dynamic';
import * as React from 'react';
import type { UserFolder } from '@/lib/types';

export default function NewModulePage() {
  const [folders, setFolders] = React.useState<UserFolder[]>([]);
  
  React.useEffect(() => {
    try {
      const storedFolders = localStorage.getItem('userFolders');
      if (storedFolders) {
        setFolders(JSON.parse(storedFolders));
      }
    } catch (error) {
      console.error("Failed to parse folders from localStorage", error);
    }
  }, []);


  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Modul Baru" />
      <main className="flex-1 p-4 md:p-8">
         <div className="mx-auto max-w-4xl">
            <ModuleFormDynamic folders={folders} />
         </div>
      </main>
    </div>
  );
}
