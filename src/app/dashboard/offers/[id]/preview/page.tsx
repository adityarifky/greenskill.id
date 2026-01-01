'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { doc } from 'firebase/firestore';
import { use } from 'react';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Offer, Scheme } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/layout/header';
import { PrintPreview } from '../../_components/print-preview';
import { Skeleton } from '@/components/ui/skeleton';
import { SignatureSection } from '../../_components/signature-section';

export default function OfferPreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const firestore = useFirestore();

    const offerRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'training_offers', id);
    }, [firestore, id]);

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
                <Header title="Pratinjau Surat" />
            </div>
            <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
                 <div className="print-container w-full mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
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
        <Header title="Pratinjau Surat" />
        <main className="flex-1 p-4 md:p-8 text-center">
          <p>Gambar template tidak ditemukan.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-muted/40">
      <div className="no-print">
        <Header title="Pratinjau Surat" />
      </div>
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="print-container w-full mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
            <div className="print-content relative aspect-[1/1.414] w-full">
                <Image
                    src={templateImage.imageUrl}
                    alt={templateImage.description}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover pointer-events-none"
                  />
                  <PrintPreview offer={offer} scheme={scheme} />
                  <SignatureSection />
            </div>
        </div>
      </main>
    </div>
  );
}
