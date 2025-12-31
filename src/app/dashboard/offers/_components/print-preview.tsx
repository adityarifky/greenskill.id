'use client';

import * as React from 'react';
import type { Offer, Scheme } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DraggableParameter } from './draggable-parameter';

interface PrintContentProps {
  offer: Offer;
  scheme: Scheme;
  isTemporaryPreview?: boolean;
}

export function PrintPreview({ offer, scheme, isTemporaryPreview = false }: PrintContentProps) {
  const [printDate, setPrintDate] = React.useState('');

  React.useEffect(() => {
    setPrintDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}));
  }, []);
  
  const offerDateFormatted = offer.offerDate ? format(offer.offerDate instanceof Date ? offer.offerDate : new Date(offer.offerDate), "d MMMM yyyy", { locale: id }) : 'N/A';

  const parameters = [
    { id: 'scheme-name', label: 'Nama Skema', value: scheme.name, initialPosition: { x: 50, y: 120 } },
    { id: 'customer-name', label: 'Penawaran Untuk', value: offer.customerName, initialPosition: { x: 50, y: 180 } },
    { id: 'offer-date', label: 'Tanggal Penawaran', value: offerDateFormatted, initialPosition: { x: 50, y: 205 } },
    { id: 'offer-id', label: 'ID Penawaran', value: isTemporaryPreview ? 'TEMP-PREVIEW' : offer.id, initialPosition: { x: 50, y: 250 } },
    { id: 'unit-codes', label: 'Kode Unit', value: scheme.units && scheme.units.length > 0 ? scheme.units.map(u => u.unitCode).join(', ') : 'N/A', initialPosition: { x: 50, y: 275 } },
    { id: 'user-request-title', label: 'Permintaan Khusus', value: '', isTitle: true, initialPosition: { x: 50, y: 340 } },
    { id: 'user-request-body', label: '', value: offer.userRequest, isBody: true, initialPosition: { x: 50, y: 370 } },
    { id: 'price-label', label: 'Harga Dasar', value: '', initialPosition: { x: 550, y: 650 } },
    { id: 'price-value', label: '', value: `Rp ${Number(scheme.price).toLocaleString('id-ID')}`, isPrice: true, initialPosition: { x: 550, y: 670 } },
    { id: 'print-date', label: 'Dicetak pada', value: printDate, isFooter: true, initialPosition: { x: 50, y: 750 } },
    { id: 'app-name', label: 'Generator File Greenskill', value: '', isFooter: true, initialPosition: { x: 50, y: 770 } },
  ];

  return (
      <div className="absolute inset-0 text-gray-800">
        {parameters.map(param => (
          <DraggableParameter 
            key={param.id}
            label={param.label}
            value={param.value}
            initialPosition={param.initialPosition}
            isTitle={param.isTitle}
            isBody={param.isBody}
            isPrice={param.isPrice}
            isFooter={param.isFooter}
          />
        ))}
      </div>
  );
}
