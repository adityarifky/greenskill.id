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
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type PreviewData = Partial<Omit<Offer, 'createdAt' | 'userId'>> & {
  scheme?: Scheme;
  isTemplateOnlyPreview?: boolean;
};

export type Parameter = {
  id: string;
  label: string;
  value: string;
  position: { x: number; y: number };
  key: string;
};

const dummyScheme: Scheme = {
  id: 'dummy-scheme',
  name: 'Nama Skema Belum Dipilih',
  price: 0,
  units: [{ unitCode: 'XXX-00', unitName: 'Nama Unit Belum Dipilih' }],
  userId: 'dummy-user',
};

const dummyOffer: Omit<Offer, 'id' | 'schemeId' | 'userId' | 'createdAt'> = {
  customerName: 'Nama Customer Belum Diisi',
  offerDate: new Date(),
  userRequest: 'Permintaan Pengguna Belum Diisi',
  schemeName: 'Nama Skema Belum Dipilih',
};

export default function SessionOfferPreviewPage() {
  const router = useRouter();
  const [previewData, setPreviewData] = React.useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeParams, setActiveParams] = React.useState<Parameter[]>([]);
  const printAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('previewOffer');
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.offerDate) {
          data.offerDate = new Date(data.offerDate);
        }
        setPreviewData(data);

        // Auto-generate parameters from data
        const offer = { ...dummyOffer, ...data };
        const scheme = data.scheme || dummyScheme;
        const initialParams: Parameter[] = [
          {
            id: 'customerName',
            key: 'customerName',
            label: 'Customer',
            value: offer.customerName,
            position: { x: 50, y: 150 },
          },
          {
            id: 'offerDate',
            key: 'offerDate',
            label: 'Tanggal',
            value: format(offer.offerDate, 'd MMMM yyyy', { locale: id }),
            position: { x: 50, y: 180 },
          },
          {
            id: 'schemeName',
            key: 'schemeName',
            label: 'Skema',
            value: scheme.name,
            position: { x: 50, y: 220 },
          },
          {
            id: 'price',
            key: 'price',
            label: 'Harga',
            value: `Rp ${Number(scheme.price || 0).toLocaleString('id-ID')}`,
            position: { x: 50, y: 250 },
          },
          {
            id: 'userRequest',
            key: 'userRequest',
            label: 'Permintaan',
            value: offer.userRequest,
            position: { x: 50, y: 280 },
          },
        ];
        setActiveParams(initialParams);
      }
    } catch (error) {
      console.error("Failed to parse preview data from session storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setActiveParams(prev =>
      prev.map(p => (p.id === id ? { ...p, position: newPosition } : p))
    );
  };
  
  const handleLabelChange = (id: string, newLabel: string) => {
    // This function is kept for potential future use, but is not currently active
    // since labels are now derived from data keys.
    setActiveParams(prev =>
      prev.map(p => (p.id === id ? { ...p, label: newLabel } : p))
    );
  };

  const defaultTemplateImage = PlaceHolderImages.find(img => img.id === 'a4-template');
  const offerForPreview = { ...dummyOffer, ...previewData };
  const schemeForPreview = previewData?.scheme || dummyScheme;

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

  const backgroundUrls =
    previewData.backgroundUrls && previewData.backgroundUrls.length > 0
      ? previewData.backgroundUrls
      : [defaultTemplateImage?.imageUrl || ''];

  const headerTitle = previewData.isTemplateOnlyPreview
    ? 'Pratinjau Template Latar'
    : 'Pratinjau Penawaran';

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
                <div
                  ref={printAreaRef}
                  className="print-content relative aspect-[1/1.414] w-full"
                >
                  <Image
                    src={templateImage.imageUrl}
                    alt={templateImage.description}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover pointer-events-none"
                  />
                  {!previewData.isTemplateOnlyPreview && (
                    <PrintPreview
                      offer={offerForPreview as Offer}
                      scheme={schemeForPreview}
                      activeParams={activeParams}
                      onPositionChange={handlePositionChange}
                      onLabelChange={handleLabelChange} // This is kept for consistency
                      parentRef={printAreaRef}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
