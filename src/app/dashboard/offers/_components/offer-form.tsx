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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Scheme, Offer } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const formSchema = z.object({
  schemeId: z.string().min(1, { message: 'Silakan pilih skema.' }),
  userRequest: z.string().min(10, { message: 'Permintaan pengguna harus memiliki setidaknya 10 karakter.' }),
});

type OfferFormValues = z.infer<typeof formSchema>;

interface OfferFormProps {
  initialData?: Offer | null;
  schemes: Scheme[];
}

export function OfferForm({ initialData, schemes }: OfferFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      schemeId: '',
      userRequest: '',
    },
  });

  const title = initialData ? 'Edit Penawaran' : 'Buat Penawaran Baru';
  const description = initialData ? 'Perbarui detail penawaran.' : 'Isi formulir untuk membuat penawaran baru.';
  const toastMessage = initialData ? 'Penawaran berhasil diperbarui.' : 'Penawaran baru berhasil dibuat.';
  const action = initialData ? 'Simpan Perubahan' : 'Buat Penawaran';
  
  const isLoading = form.formState.isSubmitting;

  const onSubmit = (data: OfferFormValues) => {
     if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Gagal!",
            description: "Koneksi ke database gagal atau pengguna belum terautentikasi.",
        });
        return;
    }

    const selectedScheme = schemes.find(s => s.id === data.schemeId);
    if (!selectedScheme) {
         toast({
            variant: "destructive",
            title: "Gagal!",
            description: "Skema yang dipilih tidak valid.",
        });
        return;
    }

    const offerData = {
        schemeId: data.schemeId,
        schemeName: selectedScheme.name, // Denormalized name
        userRequest: data.userRequest,
        userId: user.uid,
        updatedAt: serverTimestamp(),
    };

    const operation = initialData
      ? setDoc(doc(firestore, 'training_offers', initialData.id), offerData, { merge: true })
      : addDoc(collection(firestore, 'training_offers'), { ...offerData, createdAt: serverTimestamp() });
      
    operation.then(() => {
        toast({
            title: 'Sukses!',
            description: toastMessage,
        });
        router.push('/dashboard/offers');
        router.refresh();
    }).catch(serverError => {
        console.error("Firestore operation failed:", serverError);
        const contextualError = new FirestorePermissionError({
            path: initialData ? `training_offers/${initialData.id}` : 'training_offers',
            operation: initialData ? 'update' : 'create',
            requestResourceData: offerData,
        });
        errorEmitter.emit('permission-error', contextualError);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="schemeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Skema Pelatihan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={schemes.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={schemes.length > 0 ? "Pilih skema yang akan digunakan" : "Tidak ada skema tersedia"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schemes.map((scheme) => (
                        <SelectItem key={scheme.id} value={scheme.id}>
                          {scheme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Penawaran akan didasarkan pada skema yang dipilih.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permintaan Pengguna</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Permintaan untuk 20 karyawan, termasuk sertifikat dan makan siang."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Jelaskan detail spesifik untuk penawaran ini.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" className="w-full text-lg" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : action}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
