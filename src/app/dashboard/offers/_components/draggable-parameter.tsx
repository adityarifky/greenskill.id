'use client';

import * as React from 'react';
import { GripVertical } from 'lucide-react';
import type { Parameter } from '../preview/page';
import { cn } from '@/lib/utils';

interface DraggableParameterProps {
  param: Parameter;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  parentRef: React.RefObject<HTMLDivElement>;
}

export function DraggableParameter({
  param,
  onPositionChange,
  parentRef,
}: DraggableParameterProps) {
  const dragStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (elementRef.current) {
      dragStartRef.current = {
        x: e.clientX - elementRef.current.offsetLeft,
        y: e.clientY - elementRef.current.offsetTop,
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!elementRef.current || !parentRef.current || !dragStartRef.current) return;

    const parentRect = parentRef.current.getBoundingClientRect();
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;

    const constrainedX = Math.max(0, Math.min(newX, parentRect.width - elementRef.current.offsetWidth));
    const constrainedY = Math.max(0, Math.min(newY, parentRect.height - elementRef.current.offsetHeight));

    onPositionChange(param.id, { x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        top: `${param.position.y}px`,
        left: `${param.position.x}px`,
        cursor: 'grab',
        touchAction: 'none',
      }}
      className="group/param z-10 flex items-center gap-1 rounded-md p-2 hover:bg-blue-100/50 hover:ring-1 hover:ring-blue-500 transition-all"
      onMouseDown={handleMouseDown}
    >
      <GripVertical className="h-5 w-5 text-gray-400 opacity-0 group-hover/param:opacity-100 transition-opacity" />
      <div className="flex flex-col text-sm">
        <span className="font-semibold text-gray-600">{param.label}</span>
        <span className="text-gray-800">{param.value}</span>
      </div>
    </div>
  );
}
