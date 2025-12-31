'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { PrintPreview } from '../_components/print-preview';
import { Header } from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { Offer, Scheme } from '@/lib/types';


type PreviewData = Omit<Offer, 'createdAt' | 'userId'> & { scheme: Scheme };

export default function SessionOfferPreviewPage() {
    const router = useRouter();
    const [previewData, setPreviewData] = React.useState<PreviewData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const storedData = sessionStorage.getItem('previewOffer');
        if (storedData) {
            const data = JSON.parse(storedData);
            // The offerDate is stored as a string, convert it back to a Date object
            data.offerDate = new Date(data.offerDate);
            setPreviewData(data);
        }
        setIsLoading(false);
    }, []);

    const defaultTemplateImage = PlaceHolderImages.find(img => img.id === 'a4-template');

    if (isLoading) {
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
        );
    }

    if (!previewData) {
        return (
            <div className="flex h-full flex-col">
                <Header title="Pratinjau Penawaran" />
                <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
                    <div className="text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                        <h2 className="mt-4 text-xl font-semibold">Data Pratinjau Tidak Ditemukan</h2>
                        <p className="mt-2 text-muted-foreground">
                            Silakan buat penawaran baru untuk melihat pratinjau.
                        </p>
                        <Button onClick={() => router.push('/dashboard/offers/new')} className="mt-6">
                            Buat Penawaran
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    const templateImage = {
        id: 'preview-template',
        imageUrl: previewData.backgroundUrl || defaultTemplateImage?.imageUrl || '',
        description: 'Template pratinjau',
        imageHint: '',
    };
    
    // Make sure offerDate is a Date object before passing it to PrintPreview
    const offerWithDate = {
        ...previewData,
        offerDate: previewData.offerDate instanceof Date ? previewData.offerDate : new Date(previewData.offerDate),
    };


    return (
        <div className="flex h-full flex-col bg-muted/40">
            <div className="no-print">
                <Header title="Pratinjau Penawaran (Sementara)" />
            </div>
            <main className="flex-1 p-4 md:p-8">
                <PrintPreview 
                    offer={offerWithDate} 
                    scheme={previewData.scheme} 
                    templateImage={templateImage} 
                    isTemporaryPreview={true}
                />
            </main>
        </div>
    );
}