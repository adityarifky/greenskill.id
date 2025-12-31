import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Printer, FileEdit } from 'lucide-react';

import { getOfferById, getSchemeById } from '@/lib/data';
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

export default async function OfferDetailsPage({ params }: { params: { id: string } }) {
  const offer = await getOfferById(params.id);

  if (!offer) {
    notFound();
  }

  const scheme = await getSchemeById(offer.schemeId);

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
                Dibuat pada {format(offer.createdAt, "d MMMM yyyy, HH:mm", { locale: id })}
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
                    <span className="font-semibold">{scheme?.price}</span>
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
