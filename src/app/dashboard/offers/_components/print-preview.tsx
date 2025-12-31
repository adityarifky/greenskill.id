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
  
  return (
      <div className="absolute inset-0 text-gray-800">
        {/* The single draggable parameter button is back */}
      </div>
  );
}
