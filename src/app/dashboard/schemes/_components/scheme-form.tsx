'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { PlusCircle, Trash2 } from 'lucide-react';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import type { Scheme } from '@/lib/types';
import { DataPreview } from './data-preview';
import { useFirestore, useUser } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama skema harus memiliki setidaknya 3 karakter.' }),
  price: z.string().refine(val => /^(Rp\s)?\d{1,3}(\.\d{3})*$/.test(val) || /^\d+$/.test(val), { message: 'Format harga tidak valid. Contoh: Rp 1.500.000 atau 1500000' }),
  units: z.array(
    z.object({
      unitCode: z.string().min(2, { message: "Kode unit diperlukan." }),
      unitName: z.string().min(3, { message: "Nama unit diperlukan." }),
    })
  ).min(1, { message: "Minimal harus ada satu unit pelatihan." }),
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
      price: 'Rp ',
      units: [{ unitCode: '', unitName: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "units"
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
      price: priceAsNumber,
      units: data.units,
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
                
                <div className="space-y-4">
                  <FormLabel>Unit Pelatihan</FormLabel>
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">No</TableHead>
                        <TableHead>Kode Unit</TableHead>
                        <TableHead>Nama Unit</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                             <FormField
                              control={form.control}
                              name={`units.${index}.unitCode`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="KSL-01" {...field} />
                                  </FormControl>
                                   <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                             <FormField
                              control={form.control}
                              name={`units.${index}.unitName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Mengoperasikan Peralatan" {...field} />
                                  </FormControl>
                                   <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {form.formState.errors.units?.root && (
                     <p className="text-sm font-medium text-destructive">{form.formState.errors.units.root.message}</p>
                  )}

                  <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ unitCode: '', unitName: '' })}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Unit
                      </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <DataPreview
              name={watchedValues.name}
              units={watchedValues.units}
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
