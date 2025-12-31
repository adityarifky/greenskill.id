'use client';

import * as React from 'react';
import { DraggableParameter } from './draggable-parameter';
import type { TemplateParameter, Offer, Scheme } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface PrintContentProps {
  activeParams: TemplateParameter[];
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onLabelChange: (id: string, label: string) => void;
  parentRef: React.RefObject<HTMLDivElement>;
  offer?: Partial<Offer> | null;
  scheme?: Partial<Scheme> | null;
}

export function PrintPreview({
  activeParams,
  onPositionChange,
  onLabelChange,
  parentRef,
  offer,
  scheme,
}: PrintContentProps) {

  const getParamValue = (key: string) => {
    switch (key) {
      case 'customerName':
        return offer?.customerName || 'Nama Pelanggan';
      case 'offerDate':
        return offer?.offerDate ? format(new Date(offer.offerDate), 'd MMMM yyyy', { locale: id }) : 'Tanggal Penawaran';
      case 'schemeName':
        return scheme?.name || 'Nama Skema';
      case 'schemePrice':
        return scheme?.price ? `Rp ${Number(scheme.price).toLocaleString('id-ID')}` : 'Harga Skema';
      case 'schemeUnits':
        return scheme?.units?.map(u => `${u.unitCode} - ${u.unitName}`).join('\n') || 'Unit-unit Pelatihan';
      case 'userRequest':
        return offer?.userRequest || 'Detail permintaan khusus dari pelanggan.';
       case 'offerId':
        return offer?.id || 'OFFER/ID/001';
      default:
        return 'Value';
    }
  };

  return (
    <div className="absolute inset-0 text-gray-800">
      {activeParams.map(param => (
        <DraggableParameter
          key={param.id}
          param={{ ...param, value: getParamValue(param.key) }}
          onPositionChange={onPositionChange}
          onLabelChange={onLabelChange}
          parentRef={parentRef}
        />
      ))}
    </div>
  );
}
