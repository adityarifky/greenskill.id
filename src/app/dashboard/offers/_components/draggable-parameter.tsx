'use client';

import * as React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableParameterProps {
    label: string;
    value: string;
    initialPosition: { x: number; y: number };
    isTitle?: boolean;
    isBody?: boolean;
    isPrice?: boolean;
    isFooter?: boolean;
}

export function DraggableParameter({ label, value, initialPosition, isTitle, isBody, isPrice, isFooter }: DraggableParameterProps) {
  const [position, setPosition] = React.useState(initialPosition);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const elementRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (elementRef.current) {
        const parentRect = elementRef.current.parentElement?.getBoundingClientRect();
        if (!parentRect) return;

        dragStartRef.current = {
            x: e.clientX - elementRef.current.offsetLeft,
            y: e.clientY - elementRef.current.offsetTop,
        };
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!elementRef.current || !elementRef.current.parentElement) return;

    const parentRect = elementRef.current.parentElement.getBoundingClientRect();
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    // Boundary checks to keep the element within its parent
    const constrainedX = Math.max(0, Math.min(newX, parentRect.width - elementRef.current.offsetWidth));
    const constrainedY = Math.max(0, Math.min(newY, parentRect.height - elementRef.current.offsetHeight));

    setPosition({
      x: constrainedX,
      y: constrainedY,
    });
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const labelClass = cn({
      'font-semibold': !isTitle && !isBody && !isPrice && !isFooter,
      'text-lg font-semibold border-b pb-1 mb-2': isTitle,
      'whitespace-pre-wrap text-sm text-gray-700': isBody,
      'text-2xl font-bold text-primary': isPrice,
      'text-xs text-gray-500': isFooter,
      'text-sm': !isTitle && !isPrice && !isFooter,
  });

  return (
    <div
        ref={elementRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          cursor: 'grab',
          touchAction: 'none',
        }}
        className="group/param no-print z-10 p-2 rounded-md hover:bg-blue-100/50 hover:ring-1 hover:ring-blue-500 transition-all"
    >
        <div className="relative">
            <div className={cn(labelClass, "pointer-events-none")}>
                {isTitle ? label : (label && <span className="font-semibold">{label}: </span>)}
                {isBody || isPrice || isFooter ? value : (isTitle ? '' : <span>{value}</span>)}
                {isTitle && value && <span>{value}</span>}
            </div>
            <GripVertical className="absolute -left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 opacity-0 group-hover/param:opacity-100 transition-opacity" />
        </div>
    </div>
  );
}
