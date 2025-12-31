import { notFound } from 'next/navigation';
import Image from 'next/image';

import { getOfferById, getSchemeById } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/layout/header';
import { PrintPreview } from '../../_components/print-preview';

export default async function OfferPreviewPage({ params }: { params: { id: string } }) {
  const offer = await getOfferById(params.id);
  if (!offer) {
    notFound();
  }

  const scheme = await getSchemeById(offer.schemeId);
  if (!scheme) {
    notFound();
  }

  const templateImage = PlaceHolderImages.find(img => img.id === 'a4-template');
  
  if (!templateImage) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Pratinjau Penawaran" />
        <main className="flex-1 p-4 md:p-8 text-center">
          <p>Gambar template tidak ditemukan.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-muted/40">
      <div className="no-print">
        <Header title="Pratinjau Penawaran" />
      </div>
      <main className="flex-1 p-4 md:p-8">
        <PrintPreview offer={offer} scheme={scheme} templateImage={templateImage} />
      </main>
    </div>
  );
}
