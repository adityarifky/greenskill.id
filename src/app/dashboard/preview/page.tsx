'use client';

import * as React from 'react';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Scheme, Offer, Module } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PreviewPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const schemesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Schemes are public, no user filter needed
    return collection(firestore, 'registration_schemas');
  }, [firestore]);

  const offersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'training_offers'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'modules'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: schemes, isLoading: isLoadingSchemes } = useCollection<Scheme>(schemesQuery);
  const { data: offers, isLoading: isLoadingOffers } = useCollection<Offer>(offersQuery);
  const { data: modules, isLoading: isLoadingModules } = useCollection<Module>(modulesQuery);
  
  const isLoading = isUserLoading || isLoadingSchemes || isLoadingOffers || isLoadingModules;

  const getFormattedDate = (date: any): string => {
    if (!date) return '-';
  
    // Handle Firestore Timestamp object
    if (date.seconds) {
      try {
        return format(new Date(date.seconds * 1000), "d MMMM yyyy, HH:mm", { locale: id });
      } catch (e) {
        return 'Invalid Date';
      }
    }
  
    // Handle JavaScript Date object
    if (date instanceof Date) {
       try {
        return format(date, "d MMMM yyyy, HH:mm", { locale: id });
      } catch (e) {
        return 'Invalid Date';
      }
    }
  
    // Handle ISO string or other string formats
    if (typeof date === 'string') {
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return format(parsedDate, "d MMMM yyyy, HH:mm", { locale: id });
        }
      } catch (e) {
         // Fall through to return the original string if parsing fails
      }
    }
    
    // Fallback for any other unexpected format
    return String(date);
  };


  return (
    <div className="flex h-full flex-col">
      <Header title="Pratinjau Data" />
      <main className="flex-1 p-4 md:p-8">
        <Tabs defaultValue="schemes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schemes">Skema Registrasi</TabsTrigger>
            <TabsTrigger value="offers">Daftar Surat</TabsTrigger>
            <TabsTrigger value="modules">Daftar Modul</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schemes">
            <Card>
              <CardHeader>
                <CardTitle>Skema Registrasi</CardTitle>
                <CardDescription>Tampilan semua skema registrasi yang tersedia.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Skema</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Jumlah Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && Array.from({length: 3}).map((_, i) => (
                         <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && schemes?.map((scheme) => (
                      <TableRow key={scheme.id}>
                        <TableCell>{scheme.name}</TableCell>
                        <TableCell>Rp {Number(scheme.price || 0).toLocaleString('id-ID')}</TableCell>
                        <TableCell>{scheme.units?.length || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!isLoading && (!schemes || schemes.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground">Belum ada skema.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Surat</CardTitle>
                <CardDescription>Tampilan semua surat yang telah Anda buat.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Skema</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && Array.from({length: 3}).map((_, i) => (
                         <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && offers?.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>{offer.customerName}</TableCell>
                        <TableCell>{offer.schemeName}</TableCell>
                        <TableCell>{getFormattedDate(offer.offerDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!isLoading && (!offers || offers.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground">Belum ada surat.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="modules">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Modul</CardTitle>
                <CardDescription>Tampilan semua modul pelatihan yang telah Anda buat.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul Modul</TableHead>
                      <TableHead>Dibuat Pada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && Array.from({length: 3}).map((_, i) => (
                         <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && modules?.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell>{module.title}</TableCell>
                        <TableCell>{getFormattedDate(module.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                 {!isLoading && (!modules || modules.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground">Belum ada modul.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
