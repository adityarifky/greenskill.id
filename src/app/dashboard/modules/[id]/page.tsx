'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { doc } from 'firebase/firestore';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Module } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


export default function ModuleDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { id } = params;

  const moduleRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'modules', id);
  }, [firestore, id]);

  const { data: module, isLoading } = useDoc<Module>(moduleRef);
  
  if (!isLoading && !module) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Detail Modul" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
           <div className="mb-6 flex items-center justify-between">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/modules">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={`/dashboard/modules/${id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Modul
                    </Link>
                </Button>
            </div>
            {isLoading ? (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-5/6" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>{module?.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div
                            className={cn(
                                "min-h-[400px] w-full rounded-b-md bg-transparent text-sm",
                                // These classes ensure the WYSIWYG content is rendered correctly
                                "prose prose-sm max-w-none",
                                "prose-h1:font-bold prose-h2:font-semibold prose-h3:font-medium prose-h4:font-normal",
                                "[&_font[size='7']]:text-4xl [&_font[size='7']]:font-bold",
                                "[&_font[size='6']]:text-3xl [&_font[size='6']]:font-bold",
                                "[&_font[size='5']]:text-2xl [&_font[size='5']]:font-semibold",
                                "[&_font[size='4']]:text-xl [&_font[size='4']]:font-semibold",
                                "[&_font[size='3']]:text-base",
                                "[&_font[size='2']]:text-sm",
                                "[&_font[size='1']]:text-xs",
                            )}
                            dangerouslySetInnerHTML={{ __html: module?.content || '' }}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
      </main>
    </div>
  );
}
