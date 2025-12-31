'use client';

import { Header } from '@/components/layout/header';
import { ModuleForm } from '../_components/module-form';

export default function NewModulePage() {
    return (
        <div className="flex h-full flex-col">
            <Header title="Buat Modul Baru" />
            <main className="flex-1 p-4 md:p-8">
                <div className="mx-auto max-w-4xl">
                     <ModuleForm />
                </div>
            </main>
        </div>
    );
}
