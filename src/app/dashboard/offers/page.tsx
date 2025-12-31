import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal } from 'lucide-react';

import { getOffers } from '@/lib/data';
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

export default async function OffersPage() {
  const offers = await getOffers();

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
              <Link href="/dashboard/offers/new" passHref legacyBehavior>
                <Button asChild>
                  <a>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Buat Penawaran Baru
                  </a>
                </Button>
              </Link>
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
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.schemeName}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-sm truncate">{offer.userRequest}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(offer.createdAt, "d MMMM yyyy", { locale: id })}
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
                          <Link href={`/dashboard/offers/${offer.id}`} passHref>
                            <DropdownMenuItem>Lihat</DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/offers/${offer.id}/preview`} passHref>
                            <DropdownMenuItem>Pratinjau Cetak</DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/offers/${offer.id}/edit`} passHref>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                          </Link>
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
