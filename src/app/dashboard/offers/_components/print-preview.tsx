'use client';

import Image from 'next/image';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import type { Offer, Scheme } from '@/lib/types';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

interface PrintPreviewProps {
  offer: Offer;
  scheme: Scheme;
  templateImage: ImagePlaceholder;
}

export function PrintPreview({ offer, scheme, templateImage }: PrintPreviewProps) {
  const [printDate, setPrintDate] = React.useState('');

  React.useEffect(() => {
    setPrintDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}));
  }, []);
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <Link href={`/dashboard/offers/${offer.id}`} passHref legacyBehavior>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Detail
          </Button>
        </Link>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak Halaman Ini
        </Button>
      </div>
      
      <div className="print-container mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
        <div className="print-content relative aspect-[1/1.414] w-full">
          <Image
            src={templateImage.imageUrl}
            alt={templateImage.description}
            data-ai-hint={templateImage.imageHint}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 p-[10%] text-gray-800">
            {/* This is an example layout. Adjust positions with top/left/right/bottom */}
            <h1 className="absolute top-[15%] left-[10%] text-3xl font-bold">{scheme.name}</h1>
            
            <div className="absolute top-[30%] left-[10%] text-sm">
              <p><span className="font-semibold">ID Penawaran:</span> {offer.id}</p>
              <p><span className="font-semibold">Kode Unit:</span> {scheme.unitCode}</p>
            </div>

            <div className="absolute top-[45%] left-[10%] right-[10%]">
              <h2 className="text-lg font-semibold border-b pb-1 mb-2">Permintaan Khusus</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{offer.userRequest}</p>
            </div>

            <div className="absolute bottom-[20%] right-[10%] text-right">
              <p className="text-sm text-gray-600">Harga Dasar</p>
              <p className="text-2xl font-bold text-primary">{scheme.price}</p>
            </div>

             <div className="absolute bottom-[5%] left-[10%] text-xs text-gray-500">
               <p>Dicetak pada: {printDate}</p>
               <p>Generator File Greenskill</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
