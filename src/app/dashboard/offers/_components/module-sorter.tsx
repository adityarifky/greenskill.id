'use client';

import * as React from 'react';
import type { Module } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface ModuleSorterProps {
  allModules: Module[];
  initialSelectedIds: string[];
  onSave: (selectedIds: string[]) => void;
  onCancel: () => void;
}

export function ModuleSorter({ allModules, initialSelectedIds, onSave, onCancel }: ModuleSorterProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set(initialSelectedIds));

  const handleToggleSelect = (moduleId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(moduleId)) {
      newSelectedIds.delete(moduleId);
    } else {
      newSelectedIds.add(moduleId);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSave = () => {
    // To preserve original order if needed, but for now, just return selected ids
    const orderedSelection = allModules.filter(m => selectedIds.has(m.id)).map(m => m.id);
    onSave(orderedSelection);
  };

  return (
    <div className="flex h-full flex-col gap-4 pt-2">
      <div className="flex-grow overflow-hidden">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-lg">Pilih Modul</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 pr-4">
                {allModules.map(module => {
                  const isSelected = selectedIds.has(module.id);
                  return (
                    <div
                      key={module.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm transition-colors hover:bg-muted/50",
                        isSelected && "ring-2 ring-primary bg-primary/10"
                      )}
                      onClick={() => handleToggleSelect(module.id)}
                    >
                      <span className="truncate pr-2 font-medium">{module.title}</span>
                      {isSelected && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
                    </div>
                  )
                })}
                {allModules.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Tidak ada modul yang tersedia.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-shrink-0 justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button onClick={handleSave}>Simpan Pilihan</Button>
      </div>
    </div>
  );
}
