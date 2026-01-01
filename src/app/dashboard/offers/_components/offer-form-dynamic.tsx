'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Offer, Module } from '@/lib/types';

const OfferForm = dynamic(() => import('./offer-form').then(mod => mod.OfferForm), {
  ssr: false,
  loading: () => <OfferFormSkeleton />,
});

interface OfferFormDynamicProps {
  initialData?: Offer | null;
  modules: Module[];
  isLoading?: boolean;
}

export function OfferFormDynamic({ initialData, modules, isLoading }: OfferFormDynamicProps) {
    if (isLoading) {
        return <OfferFormSkeleton />;
    }
  return <OfferForm modules={modules} />;
}


function OfferFormSkeleton() {
    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
}
