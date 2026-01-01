'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import Image from 'next/image';
import { PrintPreview } from '../_components/print-preview';
import { Header } from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react';
import type { Offer, Scheme } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { toast } from '@/hooks/use-toast';
import { SignatureSection } from '../_components/signature-section';

type PreviewData = Partial<Omit<Offer, 'createdAt' | 'userId'>> & {
  scheme?: Partial<Scheme>;
  isTemplateOnlyPreview?: boolean;
  backgroundUrls?: string[];
};

export default function SessionOfferPreviewPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [previewData, setPreviewData] = React.useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
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

  const handleSaveOffer = async () => {
    if (!previewData || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: 'Data pratinjau, pengguna, atau koneksi database tidak ditemukan.',
      });
      return;
    }
    setIsSaving(true);
    
    try {
      let finalBackgroundUrl: string | undefined = undefined;

      // Check if there's a new background to upload
      if (previewData.backgroundUrls && previewData.backgroundUrls.length > 0) {
        const storage = getStorage();
        const firstFile = previewData.backgroundUrls[0];
        const storageRef = ref(storage, `offer_backgrounds/${user.uid}/${Date.now()}`);
        
        // Upload the base64 data URL
        const snapshot = await uploadString(storageRef, firstFile, 'data_url');
        finalBackgroundUrl = await getDownloadURL(snapshot.ref);
      }

      const offerDataToSave = {
        schemeId: previewData.schemeId,
        schemeName: previewData.scheme?.name,
        customerName: previewData.customerName,
        offerDate: previewData.offerDate,
        userRequest: previewData.userRequest,
        userId: user.uid,
        updatedAt: serverTimestamp(),
        backgroundUrl: finalBackgroundUrl // Can be new URL or undefined
      };

      let docId = previewData.id;
      let toastMessage = 'Penawaran berhasil diperbarui.';

      if (docId && docId.startsWith('temp-')) {
          // This is a new offer
          const docRef = await addDoc(collection(firestore, 'training_offers'), {
              ...offerDataToSave,
              createdAt: serverTimestamp(),
          });
          docId = docRef.id;
          toastMessage = 'Penawaran baru berhasil disimpan.';
      } else if (docId) {
          // This is an existing offer, update it
          const docRef = doc(firestore, 'training_offers', docId);
          // If no new background was uploaded, we don't want to overwrite the existing URL
          if (!finalBackgroundUrl) {
            const existingDoc = await getDoc(docRef);
            offerDataToSave.backgroundUrl = existingDoc.data()?.backgroundUrl;
          }
          await updateDoc(docRef, offerDataToSave);
      } else {
         throw new Error("ID penawaran tidak valid.");
      }

      toast({
        title: 'Sukses!',
        description: toastMessage,
      });

      // Cleanup session storage and redirect
      sessionStorage.removeItem('previewOffer');
      router.push(`/dashboard/offers/${docId}`);
      router.refresh();

    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal!',
        description: 'Terjadi kesalahan saat menyimpan penawaran.',
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
  
  const isExistingOfferWithoutNewTemplate = !previewData.id?.startsWith('temp-') && (!previewData.backgroundUrls || previewData.backgroundUrls.length === 0);

  // If it's an existing offer and no new template is being previewed, fetch its backgroundUrl
  if (isExistingOfferWithoutNewTemplate && !previewData.backgroundUrl) {
    // This part is tricky as we can't easily fetch here.
    // The logic in offer-form should pass the original backgroundUrl.
    // For now, we assume if backgroundUrls is empty, we use the default.
  }

  const backgroundUrls =
    previewData.backgroundUrls && previewData.backgroundUrls.length > 0
      ? previewData.backgroundUrls
      : (previewData.backgroundUrl ? [previewData.backgroundUrl] : [defaultTemplateImage?.imageUrl || '']);

  const headerTitle = previewData.isTemplateOnlyPreview
    ? 'Pratinjau Template Latar'
    : 'Pratinjau Penawaran';

  return (
    <div className="flex h-full flex-col bg-muted/40">
      <div className="no-print">
        <Header title={headerTitle} />
      </div>
      <main className="flex-1 p-4 md:p-8">
        {!previewData.isTemplateOnlyPreview && (
            <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Formulir
            </Button>
            <Button onClick={handleSaveOffer} disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : <><Save className="mr-2 h-4 w-4" /> Simpan & Konfirmasi</>}
            </Button>
            </div>
        )}
         {previewData.isTemplateOnlyPreview && (
             <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-end">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Formulir
                </Button>
             </div>
         )}
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
                  {!previewData.isTemplateOnlyPreview && previewData.scheme && (
                     <PrintPreview
                        offer={previewData}
                        scheme={previewData.scheme}
                      />
                  )}
                  {!previewData.isTemplateOnlyPreview && (
                    <SignatureSection />
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
