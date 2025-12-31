import dynamic from 'next/dynamic';
import { getOfferById, getSchemes } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const OfferForm = dynamic(() => import('../../_components/offer-form').then(mod => mod.OfferForm), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  ),
});

export default async function EditOfferPage({ params }: { params: { id: string } }) {
  const offer = await getOfferById(params.id);
  const schemes = await getSchemes();

  if (!offer) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Edit Penawaran" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <OfferForm initialData={offer} schemes={schemes} />
        </div>
      </main>
    </div>
  );
}
