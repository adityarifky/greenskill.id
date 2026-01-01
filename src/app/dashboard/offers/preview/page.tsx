'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Printer } from 'lucide-react';
import type { Module } from '@/lib/types';
import { cn } from '@/lib/utils';

type PreviewData = {
  id: string;
  module?: Partial<Module>;
  backgroundUrl?: string;
};

export default function SessionOfferPreviewPage() {
  const router = useRouter();
  const [previewData, setPreviewData] = React.useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('previewOffer');
      if (storedData) {
        const data = JSON.parse(storedData);
        setPreviewData(data);
      }
    } catch (error) {
      console.error("Failed to parse preview data from session storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-muted/40">
        <div className="no-print">
          <Header title="Pratinjau Surat" />
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

  if (!previewData || !previewData.backgroundUrl || !previewData.module) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Pratinjau Surat" />
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Data Pratinjau Tidak Lengkap</h2>
            <p className="mt-2 text-muted-foreground">
              Silakan kembali dan pastikan Anda telah memilih modul dan mengunggah gambar background.
            </p>
            <Button onClick={() => router.push('/dashboard/offers/new')} className="mt-6">
              Kembali ke Formulir
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { module, backgroundUrl } = previewData;

  const headerTitle = 'Pratinjau Surat';

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
                Cetak Surat
            </Button>
         </div>
        
          <div className="print-container mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
            <div
              id="print-content-wrapper"
              className="print-content relative w-full"
            >
              {/* This wrapper will contain all pages */}
              <div
                  className={cn(
                      "printable-page relative aspect-[1/1.414]",
                      "bg-white text-sm",
                      "[&_font[size='7']]:text-4xl [&_font[size='7']]:font-bold",
                      "[&_font[size='6']]:text-3xl [&_font[size='6']]:font-bold",
                      "[&_font[size='5']]:text-2xl [&_font[size='5']]:font-semibold",
                      "[&_font[size='4']]:text-xl [&_font[size='4']]:font-semibold",
                      "[&_font[size='3']]:text-base",
                      "[&_font[size='2']]:text-sm",
                      "[&_font[size='1']]:text-xs",
                      "[&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2",
                      "[&_img]:max-w-full [&_img]:h-auto"
                  )}
              >
                  <Image
                    src={backgroundUrl}
                    alt="Background Surat"
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover pointer-events-none"
                  />
                  <div className="absolute inset-0 p-4" dangerouslySetInnerHTML={{ __html: module.content || '' }}/>
              </div>
            </div>
          </div>
      </main>
       <style jsx global>{`
        @media print {
            body {
                background: #fff;
            }
            .print-container {
                box-shadow: none;
                margin: 0;
                padding: 0;
            }
            .printable-page {
                page-break-after: always;
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }
            #print-content-wrapper {
              width: 210mm;
              margin: 0;
            }
        }
        @page {
            size: A4;
            margin: 0;
        }
      `}</style>
    </div>
  );
}
