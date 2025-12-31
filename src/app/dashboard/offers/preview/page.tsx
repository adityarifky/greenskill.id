'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import Image from 'next/image';
import { PrintPreview } from '../_components/print-preview';
import { Header } from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Save, Pencil, PackagePlus, FileText, Calendar, User, Tag, List, MessageSquare } from 'lucide-react';
import type { Offer, Scheme, TemplateParameter } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PreviewData = Partial<Omit<Offer, 'createdAt' | 'userId'>> & {
  scheme?: Partial<Scheme>;
  isTemplateOnlyPreview?: boolean;
  backgroundUrls?: string[];
};

export type Parameter = TemplateParameter;

export default function SessionOfferPreviewPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [previewData, setPreviewData] = React.useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeParams, setActiveParams] = React.useState<Parameter[]>([]);
  const printAreaRef = React.useRef<HTMLDivElement>(null);
  const [templateName, setTemplateName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

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
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, paramKey: string, defaultLabel: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ paramKey, defaultLabel }));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dataString = e.dataTransfer.getData("application/json");
    if (!dataString) return;

    const { paramKey, defaultLabel } = JSON.parse(dataString);
    const parentRect = printAreaRef.current?.getBoundingClientRect();
    if (!parentRect) return;

    const newParam: Parameter = {
      id: `param-${Date.now()}`,
      key: paramKey,
      label: defaultLabel,
      position: { x: e.clientX - parentRect.left, y: e.clientY - parentRect.top },
    };
    setActiveParams(prev => [...prev, newParam]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  };
  
  const handleSaveTemplate = async () => {
    if (!user || !firestore || !previewData?.backgroundUrls?.[0] || !templateName) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: 'Nama templat, gambar latar, dan data pengguna diperlukan.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const templateData = {
        name: templateName,
        backgroundUrl: previewData.backgroundUrls[0],
        parameters: activeParams,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(firestore, 'offer_templates'), templateData);
      toast({
        title: 'Sukses!',
        description: 'Templat berhasil disimpan.',
      });
      router.push('/dashboard/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal!',
        description: 'Terjadi kesalahan saat menyimpan templat.',
      });
    } finally {
      setIsSaving(false);
    }
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
    { key: 'offerId', name: 'Nomor Surat', icon: FileText },
    { key: 'offerDate', name: 'Tanggal Penawaran', icon: Calendar },
    { key: 'customerName', name: 'Nama Customer', icon: User },
    { key: 'schemeName', name: 'Nama Skema', icon: PackagePlus },
    { key: 'schemePrice', name: 'Harga Skema', icon: Tag },
    { key: 'schemeUnits', name: 'Unit Pelatihan', icon: List },
    { key: 'userRequest', name: 'Permintaan User', icon: MessageSquare },
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Simpan Tamplate
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Simpan Tamplate Surat</AlertDialogTitle>
                <AlertDialogDescription>
                  Beri nama templat Anda untuk menyimpannya. Nama ini akan digunakan untuk mengidentifikasi templat di masa mendatang.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="template-name" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="col-span-3"
                    placeholder="Contoh: Templat Penawaran Standar"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveTemplate} disabled={isSaving || !templateName}>
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                    offer={previewData}
                    scheme={previewData.scheme}
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
                <h4 className="font-medium leading-none">Parameter Surat</h4>
                <p className="text-sm text-muted-foreground">
                  Seret parameter ke atas templat.
                </p>
              </div>
              <div className="grid gap-2">
                 {parameterItems.map((param) => (
                   <div
                    key={param.key}
                    draggable
                    onDragStart={(e) => handleDragStart(e, param.key, param.name)}
                    className="flex cursor-grab items-center gap-2 rounded-md border p-2 transition-colors hover:bg-accent"
                  >
                    <param.icon className="h-4 w-4 text-muted-foreground" />
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
