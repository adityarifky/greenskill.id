'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Printer, FileEdit } from 'lucide-react';
import { doc, collection } from 'firebase/firestore';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Offer, Scheme } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function OfferDetailsPage() {
  const params = useParams<{ id: string }>();
  const firestore = useFirestore();

  const offerRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'training_offers', params.id);
  }, [firestore, params.id]);

  const { data: offer, isLoading: isLoadingOffer } = useDoc<Offer>(offerRef);

  const schemeRef = useMemoFirebase(() => {
    if (!firestore || !offer) return null;
    return doc(firestore, 'registration_schemas', offer.schemeId);
  }, [firestore, offer]);

  const { data: scheme, isLoading: isLoadingScheme } = useDoc<Scheme>(schemeRef);

  if (isLoadingOffer || isLoadingScheme) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Detail Penawaran" />
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center justify-between">
              <Skeleton className="h-10 w-36" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Detail Skema</h3>
                  <Separator className="my-2" />
                  <div className="space-y-2 text-sm">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Permintaan Pengguna</h3>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!offer) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Detail Penawaran" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/offers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Daftar
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" asChild>
                <Link href={`/dashboard/offers/${offer.id}/edit`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/offers/${offer.id}/preview`}>
                  <Printer className="mr-2 h-4 w-4" />
                  Pratinjau Cetak
                </Link>
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Penawaran untuk: {offer.schemeName}</CardTitle>
              <CardDescription>
                Dibuat pada {offer.createdAt ? format(offer.createdAt, "d MMMM yyyy, HH:mm", { locale: id }) : 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Detail Skema</h3>
                <Separator className="my-2" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nama Skema:</span>
                    <span>{scheme?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kode Unit:</span>
                    <span>{scheme?.unitCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga Dasar:</span>
                    <span className="font-semibold">Rp {Number(scheme?.price || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Permintaan Pengguna</h3>
                <Separator className="my-2" />
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {offer.userRequest}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
