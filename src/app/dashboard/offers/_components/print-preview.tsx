'use client';

import * as React from 'react';
import { DraggableParameter } from './draggable-parameter';
import type { Parameter } from '../preview/page';

interface PrintContentProps {
  activeParams: Parameter[];
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onLabelChange: (id: string, label: string) => void;
  parentRef: React.RefObject<HTMLDivElement>;
}

export function PrintPreview({
  activeParams,
  onPositionChange,
  onLabelChange,
  parentRef,
}: PrintContentProps) {
  
  return (
    <div className="absolute inset-0 text-gray-800">
      {activeParams.map(param => (
        <DraggableParameter
          key={param.id}
          param={param}
          onPositionChange={onPositionChange}
          onLabelChange={onLabelChange}
          parentRef={parentRef}
        />
      ))}
    </div>
  );
}
