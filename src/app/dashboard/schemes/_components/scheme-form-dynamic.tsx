'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Scheme } from '@/lib/types';

const SchemeForm = dynamic(() => import('./scheme-form').then(mod => mod.SchemeForm), {
  ssr: false,
  loading: () => (
     <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  ),
});

interface SchemeFormDynamicProps {
  initialData?: Scheme | null;
}

export function SchemeFormDynamic({ initialData }: SchemeFormDynamicProps) {
    return <SchemeForm initialData={initialData} />;
}
