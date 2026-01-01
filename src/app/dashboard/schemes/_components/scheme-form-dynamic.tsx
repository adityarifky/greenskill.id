'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Scheme } from '@/lib/types';

const SchemeForm = dynamic(() => import('./scheme-form').then(mod => mod.SchemeForm), {
  ssr: false,
  loading: () => <SchemeFormSkeleton />,
});

interface SchemeFormDynamicProps {
  initialData?: Scheme | null;
  isLoading?: boolean;
  onSave?: () => void;
}

export function SchemeFormDynamic({ initialData, isLoading, onSave }: SchemeFormDynamicProps) {
    if (isLoading) {
        return <SchemeFormSkeleton />;
    }
    return <SchemeForm initialData={initialData} onSave={onSave} />;
}


function SchemeFormSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-8">
                <Skeleton className="h-56 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
      </div>
    )
}
