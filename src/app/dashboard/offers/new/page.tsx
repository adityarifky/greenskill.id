import { getSchemes } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { OfferFormDynamic } from '../_components/offer-form-dynamic';

export default async function NewOfferPage() {
  const schemes = await getSchemes();

  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Penawaran Baru" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <OfferFormDynamic schemes={schemes} />
        </div>
      </main>
    </div>
  );
}
