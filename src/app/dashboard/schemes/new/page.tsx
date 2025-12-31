'use client';

import { Header } from '@/components/layout/header';
import { SchemeFormDynamic } from '../_components/scheme-form-dynamic';
import * as React from 'react';

export default function NewSchemePage() {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="flex h-full flex-col">
        <Header title="Buat Skema Baru" />
        <main className="flex-1 p-4 md:p-8">
            {isClient ? <SchemeFormDynamic /> : <SchemeFormDynamic isLoading={true} />}
        </main>
        </div>
    );
}
