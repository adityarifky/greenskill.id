
'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { getSchemes } from '@/lib/data';
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

export default function SchemesPage() {
  const [schemes, setSchemes] = React.useState<Scheme[]>([]);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    getSchemes().then(setSchemes);
  }, []);

  if (!isClient) {
    return null;
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
                {schemes.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell className="font-medium">{scheme.name}</TableCell>
                    <TableCell className="hidden md:table-cell">-</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{scheme.unitCode}</Badge>
                    </TableCell>
                    <TableCell>{scheme.price}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(scheme.createdAt, "d MMMM yyyy", { locale: id })}
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
