'use client';

import * as React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export type Parameter = {
  id: string;
  label: string;
  position: { x: number; y: number };
  key: string;
  value?: string;
};


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
  parentRef,
}: DraggableParameterProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempLabel, setTempLabel] = React.useState(param.label);
  const dragStartRef = React.useRef<{ initialX: number; initialY: number; offsetX: number; offsetY: number } | null>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing || (e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        dragStartRef.current = {
            initialX: elementRef.current.offsetLeft,
            initialY: elementRef.current.offsetTop,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
        };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current || !parentRef.current) return;

    const parentRect = parentRef.current.getBoundingClientRect();
    
    let newX = e.clientX - parentRect.left - dragStartRef.current.offsetX;
    let newY = e.clientY - parentRect.top - dragStartRef.current.offsetY;

    // Constrain position within parent
    if (elementRef.current) {
        const elementRect = elementRef.current.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, parentRect.width - elementRect.width));
        newY = Math.max(0, Math.min(newY, parentRect.height - elementRect.height));
    }

    onPositionChange(param.id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempLabel(e.target.value);
  };

  const handleLabelSave = () => {
    onLabelChange(param.id, tempLabel);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLabelSave();
    }
    if (e.key === 'Escape') {
      setTempLabel(param.label);
      setIsEditing(false);
    }
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
      className="group/param z-10 flex items-center gap-1 rounded-md p-1 hover:bg-blue-100/50 hover:ring-1 hover:ring-blue-500 transition-all"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <GripVertical className="h-5 w-5 text-gray-400 opacity-0 group-hover/param:opacity-100 transition-opacity cursor-grab" />
      <div className="flex flex-col text-sm w-auto">
         {isEditing ? (
            <div className="flex items-center gap-1">
                <Input 
                    type="text"
                    value={tempLabel}
                    onChange={handleLabelChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleLabelSave}
                    autoFocus
                    className="h-8 bg-white"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        ) : (
             <div className="font-semibold text-gray-800 border border-dashed border-gray-400 p-2 rounded-md bg-white/80">
                <span className="text-gray-500">{param.label}: </span>
                <span className="font-normal whitespace-pre-wrap">{param.value}</span>
            </div>
        )}
      </div>
    </div>
  );
}
