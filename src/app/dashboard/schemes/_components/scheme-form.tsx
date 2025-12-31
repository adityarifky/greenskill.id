'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Scheme } from '@/lib/types';
import { DataPreview } from './data-preview';
import { useFirestore, useUser } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama skema harus memiliki setidaknya 3 karakter.' }),
  unitName: z.string().min(3, { message: 'Nama unit harus memiliki setidaknya 3 karakter.' }),
  unitCode: z.string().min(2, { message: 'Kode unit diperlukan.' }),
  price: z.string().refine(val => /^(Rp\s)?\d{1,3}(\.\d{3})*$/.test(val) || /^\d+$/.test(val), { message: 'Format harga tidak valid. Contoh: Rp 1.500.000 atau 1500000' }),
});

type SchemeFormValues = z.infer<typeof formSchema>;

interface SchemeFormProps {
  initialData?: Scheme | null;
}

export function SchemeForm({ initialData }: SchemeFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const form = useForm<SchemeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: `Rp ${Number(initialData.price).toLocaleString('id-ID')}`
    } : {
      name: '',
      unitName: '',
      unitCode: '',
      price: 'Rp ',
    },
  });

  const watchedValues = form.watch();

  const title = initialData ? 'Edit Skema' : 'Buat Skema Baru';
  const description = initialData ? 'Perbarui detail skema.' : 'Isi formulir untuk membuat skema baru.';
  const toastMessage = initialData ? 'Skema berhasil diperbarui.' : 'Skema baru berhasil dibuat.';
  const action = initialData ? 'Simpan Perubahan' : 'Buat Skema';

  const onSubmit = (data: SchemeFormValues) => {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Gagal!",
            description: "Koneksi ke database gagal atau pengguna belum terautentikasi.",
        });
        return;
    }
    
    const priceAsNumber = parseInt(data.price.replace(/[^0-9]/g, ''), 10);
    const schemeData = {
      name: data.name,
      unitName: data.unitName,
      unitCode: data.unitCode,
      price: priceAsNumber,
      updatedAt: serverTimestamp(),
      userId: user.uid,
    };

    const operation = initialData
      ? setDoc(doc(firestore, 'registration_schemas', initialData.id), schemeData, { merge: true })
      : addDoc(collection(firestore, 'registration_schemas'), { ...schemeData, createdAt: serverTimestamp() });
      
    operation.then(() => {
        toast({
            title: 'Sukses!',
            description: toastMessage,
        });
        router.push('/dashboard/schemes');
        router.refresh();
    }).catch(serverError => {
        console.error("Firestore operation failed:", serverError);
        const contextualError = new FirestorePermissionError({
            path: initialData ? `registration_schemas/${initialData.id}` : 'registration_schemas',
            operation: initialData ? 'update' : 'create',
            requestResourceData: schemeData,
        });
        errorEmitter.emit('permission-error', contextualError);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Skema</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Pelatihan Keselamatan Dasar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="unitName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Mengoperasikan Peralatan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: KSL-01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga</FormLabel>
                      <FormControl>
                        <Input placeholder="Rp 1.500.000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Gunakan format: Rp [jumlah]. Contoh: Rp 1.500.000
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <DataPreview
              name={watchedValues.name}
              unitName={watchedValues.unitName}
              unitCode={watchedValues.unitCode}
              price={watchedValues.price}
            />
             <Button type="submit" className="w-full text-lg">
                {action}
              </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
