'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Offer } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function OffersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const offersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'training_offers'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: offers, isLoading: isLoadingOffers } = useCollection<Offer>(offersQuery);

  const isLoading = isUserLoading || isLoadingOffers;

  if (!isClient) {
    return <OffersPageSkeleton />;
  }
  
  return (
    <div className="flex h-full flex-col">
      <Header title="Daftar Penawaran" />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Penawaran Dibuat</CardTitle>
                <CardDescription>Kelola semua penawaran yang telah Anda buat.</CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/offers/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Penawaran Baru
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skema</TableHead>
                  <TableHead className="hidden md:table-cell">Permintaan Pengguna</TableHead>
                  <TableHead className="hidden md:table-cell">Dibuat pada</TableHead>
                  <TableHead>
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <>
                    <TableRow>
                      <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  </>
                )}
                {!isLoading && offers && offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.schemeName}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-sm truncate">{offer.userRequest}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {offer.createdAt instanceof Date
                        ? format(offer.createdAt, "d MMMM yyyy", { locale: id })
                        : offer.createdAt && typeof offer.createdAt === 'object' && 'seconds' in offer.createdAt
                        ? format(new Date((offer.createdAt as any).seconds * 1000), "d MMMM yyyy", { locale: id })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/offers/${offer.id}`}>Lihat</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/offers/${offer.id}/preview`}>Pratinjau Cetak</Link>
                          </DropdownMenuItem>
                           <DropdownMenuItem asChild>
                            <Link href={`/dashboard/offers/${offer.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {!isLoading && (!offers || offers.length === 0) && (
              <div className="py-10 text-center text-muted-foreground">
                Belum ada penawaran yang dibuat.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

const OffersPageSkeleton = () => (
    <div className="flex h-full flex-col">
        <Header title="Daftar Penawaran" />
        <main className="flex-1 p-4 md:p-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                             <Skeleton className="h-7 w-48" />
                             <Skeleton className="h-4 w-72" />
                        </div>
                        <Skeleton className="h-10 w-48" />
                    </div>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><span className="sr-only">Aksi</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    </div>
);
