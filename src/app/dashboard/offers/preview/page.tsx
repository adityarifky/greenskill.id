'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import Image from 'next/image';
import { PrintPreview } from '../_components/print-preview';
import { Header } from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Printer } from 'lucide-react';
import type { Offer, Scheme } from '@/lib/types';
import { DraggableParameterButton } from '../_components/parameter-button';


type PreviewData = Partial<Omit<Offer, 'createdAt' | 'userId'>> & { 
  scheme?: Scheme;
  isTemplateOnlyPreview?: boolean;
};

const dummyScheme: Scheme = {
  id: 'dummy-scheme',
  name: 'Nama Skema Belum Dipilih',
  price: 0,
  units: [{ unitCode: 'XXX-00', unitName: 'Nama Unit Belum Dipilih' }],
  userId: 'dummy-user',
};

const dummyOffer: Omit<Offer, 'id'| 'schemeId' | 'userId' | 'createdAt'> = {
    customerName: 'Nama Customer Belum Diisi',
    offerDate: new Date(),
    userRequest: 'Permintaan Pengguna Belum Diisi',
    schemeName: 'Nama Skema Belum Dipilih',
};

export default function SessionOfferPreviewPage() {
    const router = useRouter();
    const [previewData, setPreviewData] = React.useState<PreviewData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const storedData = sessionStorage.getItem('previewOffer');
        if (storedData) {
            const data = JSON.parse(storedData);
            if (data.offerDate) {
                data.offerDate = new Date(data.offerDate);
            }
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
                    <div className="print-container mx-auto w-full max-w-4xl rounded-lg bg-white shadow-lg">
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
    
    const offerForPreview = { ...dummyOffer, ...previewData };
    const schemeForPreview = previewData.scheme || dummyScheme;
    const isTemporary = !!previewData.id?.startsWith('temp-');

    const backgroundUrls = previewData.backgroundUrls && previewData.backgroundUrls.length > 0 
        ? previewData.backgroundUrls 
        : [defaultTemplateImage?.imageUrl || ''];

    const headerTitle = previewData.isTemplateOnlyPreview ? "Pratinjau Template Latar" : "Pratinjau Penawaran";
    
    return (
        <div className="flex h-full flex-col bg-muted/40">
            <div className="no-print">
                <Header title={headerTitle} />
            </div>
            <main className="flex-1 p-4 md:p-8">
                 <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Formulir
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak Halaman Ini
                    </Button>
                </div>
                 <div className="space-y-8">
                    {backgroundUrls.map((url, index) => {
                        const templateImage = {
                            id: `preview-template-${index}`,
                            imageUrl: url,
                            description: 'Template pratinjau',
                            imageHint: '',
                        };
                        return (
                             <div key={index} className="print-container mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
                                <div className="print-content relative aspect-[1/1.414] w-full">
                                    <Image
                                        src={templateImage.imageUrl}
                                        alt={templateImage.description}
                                        fill
                                        sizes="100vw"
                                        priority
                                        className="object-cover"
                                    />
                                    {!previewData.isTemplateOnlyPreview && (
                                        <PrintPreview 
                                            offer={offerForPreview as Offer} 
                                            scheme={schemeForPreview} 
                                            isTemporaryPreview={isTemporary}
                                        />
                                    )}
                                    <DraggableParameterButton />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
