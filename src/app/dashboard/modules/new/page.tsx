'use client';

import { Header } from '@/components/layout/header';
import { ModuleFormDynamic } from '../_components/module-form-dynamic';

export default function NewModulePage() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Modul Baru" />
      <main className="flex-1 p-4 md:p-8">
         <div className="mx-auto max-w-4xl">
            <ModuleFormDynamic />
         </div>
      </main>
    </div>
  );
}
