
'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import Image from 'next/image';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Save } from 'lucide-react';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { OfferTemplate, TemplateParameter } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DraggableParameter } from '@/app/dashboard/offers/_components/draggable-parameter';
import { toast } from '@/hooks/use-toast';

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
          >
            <Image
              src={template.backgroundUrl}
              alt={`Latar belakang untuk ${template.name}`}
              fill
              sizes="100vw"
              priority
              className="object-cover pointer-events-none"
            />
             <div className="absolute inset-0">
                {activeParams.map(param => (
                    <DraggableParameter
                    key={param.id}
                    param={param}
                    onPositionChange={handlePositionChange}
                    onLabelChange={handleLabelChange}
                    parentRef={printAreaRef}
                    />
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
