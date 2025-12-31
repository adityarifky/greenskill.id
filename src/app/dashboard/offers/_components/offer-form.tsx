'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  customerName: z.string().min(2, { message: 'Nama customer harus diisi.' }),
  offerDate: z.date({ required_error: "Tanggal penawaran harus diisi."}),
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
    defaultValues: initialData ? {
      ...initialData,
      offerDate: initialData.offerDate instanceof Date ? initialData.offerDate : new Date(initialData.offerDate),
    } : {
      schemeId: '',
      customerName: '',
      offerDate: new Date(),
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
        customerName: data.customerName,
        offerDate: data.offerDate,
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
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Customer</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: PT Jaya Abadi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offerDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Penawaran</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
