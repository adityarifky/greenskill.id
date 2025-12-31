'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { LayoutTemplate, MoreHorizontal } from 'lucide-react';
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
import type { OfferTemplate } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function TemplatesPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const templatesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'offer_templates'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: templates, isLoading: isLoadingTemplates } = useCollection<OfferTemplate>(templatesQuery);

  const isLoading = isUserLoading || isLoadingTemplates;

  return (
    <div className="flex h-full flex-col">
      <Header title="Daftar Tamplate Surat" />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Templat Tersimpan</CardTitle>
            <CardDescription>Kelola semua templat penawaran yang telah Anda buat.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Templat</TableHead>
                  <TableHead>Jumlah Parameter</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal Dibuat</TableHead>
                  <TableHead>
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
                {!isLoading && templates?.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.parameters?.length || 0}</TableCell>
                    <TableCell className="hidden md:table-cell">
                       {template.createdAt ? format(template.createdAt, "d MMMM yyyy", { locale: id }) : '-'}
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
                          {/* Add actions like Edit, Preview, Delete in the future */}
                          <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                          <DropdownMenuItem disabled>Pratinjau</DropdownMenuItem>
                          <DropdownMenuItem disabled className="text-destructive">Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {!isLoading && (!templates || templates.length === 0) && (
              <div className="py-10 text-center text-muted-foreground flex flex-col items-center">
                <LayoutTemplate className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>Belum ada templat yang disimpan.</p>
                <Button variant="link" asChild>
                    <Link href="/dashboard/offers/new">Buat penawaran untuk menyimpan templat baru</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
