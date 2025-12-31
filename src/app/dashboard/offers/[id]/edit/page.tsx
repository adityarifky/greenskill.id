import { getOfferById, getSchemes } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { OfferFormDynamic } from '../../_components/offer-form-dynamic';

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
          <OfferFormDynamic initialData={offer} schemes={schemes} />
        </div>
      </main>
    </div>
  );
}
