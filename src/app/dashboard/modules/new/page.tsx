'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { ModuleFormDynamic } from '../_components/module-form-dynamic';
import { Button } from '@/components/ui/button';

export default function NewModulePage() {
    return (
        <div className="flex h-full flex-col">
            <Header title="Buat Modul Baru" />
            <main className="flex-1 p-4 md:p-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/modules">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Modul
                            </Link>
                        </Button>
                    </div>
                     <ModuleFormDynamic />
                </div>
            </main>
        </div>
    );
}
