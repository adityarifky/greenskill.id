'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewModulePage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const [isSaving, setIsSaving] = useState(true);

    useEffect(() => {
        if (firestore && user) {
            const saveModule = async () => {
                const newModuleData = {
                    title: 'nomor, perihal, lampiran',
                    content: '<div>Nomor&nbsp; &nbsp; &nbsp;: 105/SPO/GS/XII/2025</div><div>Perihal&nbsp; &nbsp; &nbsp;: Surat Penawaran Order</div><div>Lampiran&nbsp; : -</div>',
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };

                try {
                    await addDoc(collection(firestore, 'modules'), newModuleData);
                    toast({
                        title: 'Sukses!',
                        description: 'Modul baru berhasil dibuat.',
                    });
                    router.push('/dashboard/modules');
                } catch (error) {
                    console.error("Error saving module: ", error);
                    toast({
                        variant: "destructive",
                        title: "Gagal!",
                        description: "Terjadi kesalahan saat menyimpan modul.",
                    });
                    setIsSaving(false);
                }
            };

            saveModule();
        }
    }, [firestore, user, router]);

    return (
        <div className="flex h-full flex-col">
            <Header title="Membuat Modul Baru..." />
            <main className="flex-1 p-4 md:p-8">
                <div className="mx-auto max-w-4xl text-center">
                    {isSaving ? (
                        <>
                            <p className="mb-4 text-muted-foreground">Menyimpan modul baru ke database...</p>
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-40 w-full" />
                                <Skeleton className="h-10 w-1/2 mx-auto" />
                            </div>
                        </>
                    ) : (
                        <p className="text-destructive">Gagal menyimpan modul. Silakan coba lagi.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
