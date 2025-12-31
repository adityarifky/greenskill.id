'use client';

import * as React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Parameter } from '../preview/page';
import { Input } from '@/components/ui/input';

interface DraggableParameterProps {
  param: Parameter;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onLabelChange: (id: string, label: string) => void;
  parentRef: React.RefObject<HTMLDivElement>;
}

export function DraggableParameter({ 
  param, 
  onPositionChange, 
  onLabelChange,
  parentRef 
}: DraggableParameterProps) {
  const dragStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = React.useState(!param.label); // Start editing if label is empty
  const [label, setLabel] = React.useState(param.label || '');

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('.drag-handle')) {
        return;
    }
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
  
  const handleLabelBlur = () => {
    onLabelChange(param.id, label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        top: `${param.position.y}px`,
        left: `${param.position.x}px`,
        touchAction: 'none',
      }}
      className="group/param z-10 flex items-center gap-1 rounded-md p-1 hover:bg-blue-100/50 hover:ring-1 hover:ring-blue-500 transition-all"
    >
        <div 
            className="drag-handle cursor-grab p-1"
            onMouseDown={handleMouseDown}
        >
            <GripVertical className="h-5 w-5 text-gray-400 opacity-0 group-hover/param:opacity-100 transition-opacity" />
        </div>
        {isEditing ? (
             <Input 
                placeholder="Beri nama parameter..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-48 bg-white border-dashed"
            />
        ) : (
            <div 
                onClick={() => setIsEditing(true)} 
                className="w-48 h-10 flex items-center px-3 rounded-md border border-dashed border-transparent group-hover/param:border-gray-300 cursor-pointer"
            >
                <span className="text-sm text-muted-foreground">{label || "Klik untuk menamai"}</span>
            </div>
        )}
    </div>
  );
}
