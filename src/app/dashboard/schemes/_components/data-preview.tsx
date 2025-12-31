'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrainingUnit } from '@/lib/types';

interface DataPreviewProps {
  name: string;
  units?: TrainingUnit[];
  price: string;
}

export function DataPreview({ name, units, price }: DataPreviewProps) {
  const firstUnit = units && units.length > 0 ? units[0] : { unitName: '', unitCode: '' };

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
            <p className="mt-2 text-sm">{firstUnit.unitName || 'Nama Unit Anda'}</p>
            <p className="mt-1 text-xs text-gray-300">Kode: {firstUnit.unitCode || 'KODE-XX'}</p>
            {units && units.length > 1 && (
              <p className="mt-1 text-xs text-gray-300">+{units.length - 1} unit lainnya</p>
            )}
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
