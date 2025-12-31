'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
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
import { Badge } from '@/components/ui/badge';
import type { Scheme } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SchemesPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const schemesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'registration_schemas');
  }, [firestore, user]);

  const { data: schemes, isLoading: isLoadingSchemes } = useCollection<Scheme>(schemesQuery);
  
  const isLoading = isUserLoading || isLoadingSchemes;

  if (!isClient) {
    return (
       <div className="flex h-full flex-col">
        <Header title="Skema Registrasi" />
        <main className="flex-1 p-4 md:p-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-10 w-44" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-6 w-32" /></TableHead>
                                <TableHead className="hidden md:table-cell"><Skeleton className="h-6 w-32" /></TableHead>
                                <TableHead className="hidden md:table-cell"><Skeleton className="h-6 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-6 w-28" /></TableHead>
                                <TableHead className="hidden md:table-cell"><Skeleton className="h-6 w-32" /></TableHead>
                                <TableHead><span className="sr-only">Aksi</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      <Header title="Skema Registrasi" />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Skema</CardTitle>
                <CardDescription>Kelola semua skema pelatihan Anda.</CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/schemes/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Skema Baru
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Skema</TableHead>
                  <TableHead className="hidden md:table-cell">Nama Unit</TableHead>
                  <TableHead className="hidden md:table-cell">Kode Unit</TableHead>
                  <TableHead>Harga</TableHead>
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
                      <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  </>
                )}
                {!isLoading && schemes && schemes.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell className="font-medium">{scheme.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{scheme.unitName}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{scheme.unitCode}</Badge>
                    </TableCell>
                    <TableCell>Rp {Number(scheme.price).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {scheme.createdAt instanceof Date 
                        ? format(scheme.createdAt, "d MMMM yyyy", { locale: id }) 
                        : scheme.createdAt && typeof scheme.createdAt === 'object' && 'seconds' in scheme.createdAt
                        ? format(new Date((scheme.createdAt as any).seconds * 1000), "d MMMM yyyy", { locale: id })
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
                            <Link href={`/dashboard/schemes/${scheme.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {!isLoading && (!schemes || schemes.length === 0) && (
              <div className="py-10 text-center text-muted-foreground">
                Belum ada skema yang dibuat.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
