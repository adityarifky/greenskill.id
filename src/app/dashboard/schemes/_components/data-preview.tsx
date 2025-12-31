'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPreviewProps {
  name: string;
  unitCode: string;
  price: string;
}

export function DataPreview({ name, unitCode, price }: DataPreviewProps) {
  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle>Pratinjau Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="relative h-48 w-full rounded-lg bg-cover bg-center p-4 text-white"
          style={{ backgroundImage: "url('https://picsum.photos/seed/bg-preview/600/300')" }}
        >
          <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold">{name || 'Nama Skema Anda'}</h3>
            <p className="mt-2 text-sm">Kode: {unitCode || 'KODE-XX'}</p>
            <p className="absolute bottom-4 right-4 text-lg font-semibold">{price || 'Rp 0'}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Ini adalah contoh bagaimana teks Anda akan terlihat di atas gambar latar belakang.
        </p>
      </CardContent>
    </Card>
  );
}
