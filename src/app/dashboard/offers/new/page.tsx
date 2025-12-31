import { getSchemes } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { OfferForm } from '../_components/offer-form';

export default async function NewOfferPage() {
  const schemes = await getSchemes();

  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Penawaran Baru" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <OfferForm schemes={schemes} />
        </div>
      </main>
    </div>
  );
}
