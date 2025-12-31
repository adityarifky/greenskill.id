
'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import Image from 'next/image';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Save, Pencil, PackagePlus, FileText, Calendar, User, Tag, List, MessageSquare } from 'lucide-react';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { OfferTemplate, TemplateParameter } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PrintPreview } from '@/app/dashboard/offers/_components/print-preview';
import { toast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


export default function EditTemplatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const firestore = useFirestore();

  const templateRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'offer_templates', params.id);
  }, [firestore, params.id]);

  const { data: template, isLoading, error } = useDoc<OfferTemplate>(templateRef);

  const [activeParams, setActiveParams] = React.useState<TemplateParameter[]>([]);
  const printAreaRef = React.useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (template) {
      setActiveParams(template.parameters || []);
    }
  }, [template]);

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
  
  const handleSaveChanges = async () => {
    if (!templateRef) return;
    setIsSaving(true);
    try {
        await setDoc(templateRef, { parameters: activeParams }, { merge: true });
        toast({
            title: 'Sukses!',
            description: 'Perubahan templat berhasil disimpan.',
        });
        router.push('/dashboard/templates');
    } catch (error) {
        console.error("Error updating template:", error);
        toast({
            variant: "destructive",
            title: "Gagal!",
            description: "Terjadi kesalahan saat menyimpan perubahan.",
        });
    } finally {
        setIsSaving(false);
    }
  };

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

    const newParam: TemplateParameter = {
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
  
  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-muted/40">
        <Header title="Memuat Editor Templat..." />
        <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-44" />
            </div>
            <div className="print-container mx-auto w-full max-w-4xl rounded-lg bg-white shadow-lg">
                <div className="print-content relative aspect-[1/1.414] w-full">
                <Skeleton className="h-full w-full" />
                </div>
            </div>
        </main>
      </div>
    );
  }

  if (!template) {
    notFound();
  }

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
      <Header title={`Edit Templat: ${template.name}`} />
      <main className="flex-1 p-4 md:p-8">
        <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between">
            <Button variant="outline" onClick={() => router.push('/dashboard/templates')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Daftar
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                    </>
                )}
            </Button>
        </div>
        <div className="print-container mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
          <div
            ref={printAreaRef}
            className="print-content relative aspect-[1/1.414] w-full"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Image
              src={template.backgroundUrl}
              alt={`Latar belakang untuk ${template.name}`}
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
