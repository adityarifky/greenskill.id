import Link from 'next/link';
import { ArrowRight, FileText, FilePlus2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Dasbor" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Selamat Datang di Greenskill!</h2>
          <p className="text-muted-foreground">Pilih tindakan di bawah ini untuk memulai.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <FileText className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>Kelola Skema</CardTitle>
              <CardDescription>Buat, edit, dan kelola semua skema registrasi pelatihan Anda di satu tempat.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardFooter>
              <Link href="/dashboard/schemes" passHref legacyBehavior>
                <Button asChild className="w-full">
                  <a>
                    Buka Skema
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <FilePlus2 className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>Buat Penawaran</CardTitle>
              <CardDescription>Hasilkan penawaran pelatihan baru dengan cepat berdasarkan skema yang ada.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardFooter>
              <Link href="/dashboard/offers/new" passHref legacyBehavior>
                <Button asChild className="w-full">
                  <a>
                    Buat Penawaran
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
