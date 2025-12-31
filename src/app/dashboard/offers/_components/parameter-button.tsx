'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function DraggableParameterButton() {
  const [position, setPosition] = React.useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent dialog from opening on drag start
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
     if (buttonRef.current) {
        const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
        const movedX = Math.abs(e.clientX - (left + width / 2)) > 2;
        const movedY = Math.abs(e.clientY - (top + height / 2)) > 2;
        if (!movedX && !movedY) {
            setIsDialogOpen(true);
        }
    }
  };

  return (
    <>
      <Button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        className="z-10 no-print"
        size="sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Parameter
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] no-print">
          <DialogHeader>
            <DialogTitle>Edit Parameter</DialogTitle>
            <DialogDescription>
              Isi detail parameter yang akan ditampilkan pada dokumen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="param-name" className="text-right">
                Nama
               </Label>
               <Input id="param-name" value="Contoh Parameter" className="col-span-3" />
             </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Batal</Button>
            </DialogClose>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
