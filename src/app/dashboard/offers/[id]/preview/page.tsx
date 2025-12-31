'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { doc } from 'firebase/firestore';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Offer, Scheme } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/layout/header';
import { PrintPreview } from '../../_components/print-preview';
import { Skeleton } from '@/components/ui/skeleton';

export default function OfferPreviewPage() {
    const params = useParams<{ id: string }>();
    const firestore = useFirestore();

    const offerRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'training_offers', params.id);
    }, [firestore, params.id]);

    const { data: offer, isLoading: isLoadingOffer } = useDoc<Offer>(offerRef);

    const schemeRef = useMemoFirebase(() => {
        if (!firestore || !offer) return null;
        return doc(firestore, 'registration_schemas', offer.schemeId);
    }, [firestore, offer]);

    const { data: scheme, isLoading: isLoadingScheme } = useDoc<Scheme>(schemeRef);

  const defaultTemplateImage = PlaceHolderImages.find(img => img.id === 'a4-template');

  const templateImage = {
      id: offer?.id || 'custom-template',
      imageUrl: offer?.backgroundUrl || defaultTemplateImage?.imageUrl || '',
      description: offer?.backgroundUrl ? 'Custom background template' : defaultTemplateImage?.description || '',
      imageHint: offer?.backgroundUrl ? '' : defaultTemplateImage?.imageHint || '',
  }

  if (isLoadingOffer || isLoadingScheme) {
      return (
         <div className="flex h-full flex-col bg-muted/40">
            <div className="no-print">
                <Header title="Pratinjau Penawaran" />
            </div>
            <main className="flex-1 p-4 md:p-8">
                 <div className="print-container mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
                    <div className="print-content relative aspect-[1/1.414] w-full">
                        <Skeleton className="h-full w-full" />
                    </div>
                </div>
            </main>
        </div>
      )
  }

  if (!offer || !scheme) {
    notFound();
  }
  
  if (!templateImage.imageUrl) {
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
