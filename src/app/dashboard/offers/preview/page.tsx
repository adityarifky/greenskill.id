'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import Image from 'next/image';
import { PrintPreview } from '../_components/print-preview';
import { Header } from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Save, Pencil, Package } from 'lucide-react';
import type { Offer, Scheme } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type PreviewData = Partial<Omit<Offer, 'createdAt' | 'userId'>> & {
  scheme?: Scheme;
  isTemplateOnlyPreview?: boolean;
  backgroundUrls?: string[];
};

export type Parameter = {
  id: string;
  label: string;
  position: { x: number; y: number };
  key: string;
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
      }
    } catch (error) {
      console.error("Failed to parse preview data from session storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePositionChange = React.useCallback((id: string, newPosition: { x: number; y: number }) => {
    setActiveParams(prev =>
      prev.map(p => (p.id === id ? { ...p, position: newPosition } : p))
    );
  }, []);
  
  const handleLabelChange = React.useCallback((id: string, newLabel: string) => {
    setActiveParams(prev =>
      prev.map(p => (p.id === id ? { ...p, label: newLabel } : p))
    );
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, paramKey: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ paramKey }));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dataString = e.dataTransfer.getData("application/json");
    if (!dataString) return;

    const data = JSON.parse(dataString);
    const parentRect = printAreaRef.current?.getBoundingClientRect();
    if (!parentRect) return;

    const offsetX = e.clientX - parentRect.left;
    const offsetY = e.clientY - parentRect.top;

    const newParam: Parameter = {
      id: `param-${Date.now()}`,
      key: data.paramKey,
      label: 'Label Baru',
      position: { x: offsetX, y: offsetY },
    };
    setActiveParams(prev => [...prev, newParam]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  };
  
  const handleSaveTemplate = () => {
    // This is where you'd implement the logic to save the template.
    // For now, we'll just log it.
    console.log("Saving template with parameters:", activeParams);
    // You would likely save `activeParams` to Firestore here.
  };

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

  const backgroundUrls =
    previewData.backgroundUrls && previewData.backgroundUrls.length > 0
      ? previewData.backgroundUrls
      : [defaultTemplateImage?.imageUrl || ''];

  const headerTitle = previewData.isTemplateOnlyPreview
    ? 'Pratinjau Template Latar'
    : 'Pratinjau Penawaran';
  
  const parameterItems = [
    { key: 'generic', name: 'Parameter' },
  ];

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
          <Button onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Tamplate
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
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Image
                    src={templateImage.imageUrl}
                    alt={templateImage.description}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover pointer-events-none"
                  />
                  <PrintPreview
                    activeParams={activeParams}
                    onPositionChange={handlePositionChange}
                    onLabelChange={handleLabelChange}
                    parentRef={printAreaRef}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Popover>
        <PopoverTrigger asChild>
            <Button
                variant="default"
                className="no-print fixed bottom-8 left-8 z-20 h-14 w-14 rounded-full p-4 shadow-lg"
            >
                <Pencil className="h-6 w-6" />
                <span className="sr-only">Tambah Parameter</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60" side="top" align="start">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Parameter</h4>
                <p className="text-sm text-muted-foreground">
                  Seret parameter ke atas templat.
                </p>
              </div>
              <div className="grid gap-2">
                 {parameterItems.map((param) => (
                   <div
                    key={param.key}
                    draggable
                    onDragStart={(e) => handleDragStart(e, param.key)}
                    className="flex cursor-grab items-center gap-2 rounded-md border p-2 transition-colors hover:bg-accent"
                  >
                    <Package className="h-4 w-4" />
                    <span>{param.name}</span>
                   </div>
                 ))}
              </div>
            </div>
        </PopoverContent>
    </Popover>
    </div>
  );
}
