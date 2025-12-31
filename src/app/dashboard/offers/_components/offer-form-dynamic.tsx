'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Scheme, Offer } from '@/lib/types';

const OfferForm = dynamic(() => import('./offer-form').then(mod => mod.OfferForm), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  ),
});

interface OfferFormDynamicProps {
  initialData?: Offer | null;
  schemes: Scheme[];
}

export function OfferFormDynamic({ initialData, schemes }: OfferFormDynamicProps) {
  return <OfferForm initialData={initialData} schemes={schemes} />;
}
