'use client';

import * as React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shuffle } from 'lucide-react';
import type { Module } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModuleSorterProps {
  allModules: Module[];
  initialSelectedIds: string[];
  onSave: (selectedIds: string[]) => void;
  onCancel: () => void;
}

export function ModuleSorter({ allModules, initialSelectedIds, onSave, onCancel }: ModuleSorterProps) {
  const [available, setAvailable] = React.useState<Module[]>([]);
  const [selected, setSelected] = React.useState<Module[]>([]);
  const [focusedModuleId, setFocusedModuleId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initialSelected = initialSelectedIds.map(id => allModules.find(m => m.id === id)).filter(Boolean) as Module[];
    const initialAvailable = allModules.filter(m => !initialSelectedIds.includes(m.id));
    setSelected(initialSelected);
    setAvailable(initialAvailable);
  }, [allModules, initialSelectedIds]);

  const handleSelect = (module: Module) => {
    setAvailable(available.filter(m => m.id !== module.id));
    setSelected([...selected, module]);
    setFocusedModuleId(module.id);
  };

  const handleDeselect = (module: Module) => {
    setSelected(selected.filter(m => m.id !== module.id));
    setAvailable([...available, module]);
    setFocusedModuleId(null);
  };

  const move = (direction: 'up' | 'down') => {
    if (!focusedModuleId) return;
    const index = selected.findIndex(m => m.id === focusedModuleId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selected.length) return;

    const newSelected = [...selected];
    const temp = newSelected[index];
    newSelected[index] = newSelected[newIndex];
    newSelected[newIndex] = temp;
    setSelected(newSelected);
  };

  const handleSave = () => {
    onSave(selected.map(m => m.id));
  };

  return (
    <div className="flex flex-grow flex-col gap-4 pt-2">
      <div className="grid flex-grow grid-cols-2 gap-4">
        {/* Available Modules */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Modul Tersedia</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {available.map(module => (
                  <div key={module.id} className="flex items-center justify-between rounded-md border p-3">
                    <span className="truncate pr-2">{module.title}</span>
                    <Button size="icon" variant="outline" onClick={() => handleSelect(module)}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {available.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Semua modul telah dipilih.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Selected Modules */}
         <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Modul Terpilih & Urutan</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {selected.map((module, index) => (
                  <div
                    key={module.id}
                    className={`flex items-center justify-between rounded-md border p-3 transition-colors ${focusedModuleId === module.id ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                    onClick={() => setFocusedModuleId(module.id)}
                  >
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleDeselect(module)}>
                          <ArrowLeft className="h-4 w-4 text-destructive" />
                        </Button>
                        <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">{index + 1}.</span>
                            <span className="truncate">{module.title}</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button size="icon" variant="outline" onClick={() => move('up')} disabled={index === 0}>
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => move('down')} disabled={index === selected.length - 1}>
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                ))}
                 {selected.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Pilih modul dari daftar di sebelah kiri.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button onClick={handleSave}>Simpan Urutan</Button>
      </div>
    </div>
  );
}
