'use client';

import * as React from 'react';
import type { Offer, Scheme } from '@/lib/types';
import { DraggableParameter } from './draggable-parameter';
import type { Parameter } from '../preview/page';

interface PrintContentProps {
  offer: Offer;
  scheme: Scheme;
  activeParams: Parameter[];
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onLabelChange: (id: string, label: string) => void; // Kept for API consistency
  parentRef: React.RefObject<HTMLDivElement>;
}

export function PrintPreview({
  activeParams,
  onPositionChange,
  parentRef,
}: PrintContentProps) {
  
  return (
    <div className="absolute inset-0 text-gray-800">
      {activeParams.map(param => (
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
