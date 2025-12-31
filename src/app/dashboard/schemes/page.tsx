import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle, MoreHorizontal } from 'lucide-react';

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

export default async function SchemesPage() {
  const schemes = await getSchemes();

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
              <Link href="/dashboard/schemes/new" passHref legacyBehavior>
                <Button asChild>
                  <a>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Buat Skema Baru
                  </a>
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Skema</TableHead>
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
                          <Link href={`/dashboard/schemes/${scheme.id}/edit`} passHref>
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
