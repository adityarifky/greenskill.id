'use client';

import * as React from 'react';
import type { Offer, Scheme } from '@/lib/types';
import { DraggableParameter } from './draggable-parameter';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export type Parameter = {
  id: string;
  label: string;
  value: string;
  position: { x: number; y: number };
};

interface PrintContentProps {
  offer: Offer;
  scheme: Scheme;
  isTemporaryPreview?: boolean;
  activeParams: Parameter[];
  onPositionChange: (id: string, position: { x: number, y: number }) => void;
  parentRef: React.RefObject<HTMLDivElement>;
}

export function PrintPreview({ 
  offer, 
  scheme, 
  isTemporaryPreview = false,
  activeParams,
  onPositionChange,
  parentRef
}: PrintContentProps) {
  const [printDate, setPrintDate] = React.useState('');

  React.useEffect(() => {
    setPrintDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}));
  }, []);
  
  return (
      <div className="absolute inset-0 text-gray-800">
        {activeParams.map((param) => (
          <DraggableParameter 
            key={param.id} 
            param={param} 
            onPositionChange={onPositionChange}
            parentRef={parentRef}
          />
        ))}
      </div>
  );
}
