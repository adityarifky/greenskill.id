'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Module, UserFolder } from '@/lib/types';

const ModuleForm = dynamic(() => import('./module-form').then(mod => mod.ModuleForm), {
  ssr: false,
  loading: () => <ModuleFormSkeleton />,
});

interface ModuleFormDynamicProps {
  initialData?: Module | null;
  folders: UserFolder[];
  isLoading?: boolean;
  onSave?: () => void;
}

export function ModuleFormDynamic({ initialData, folders, isLoading, onSave }: ModuleFormDynamicProps) {
    if (isLoading) {
        return <ModuleFormSkeleton />;
    }
  return <ModuleForm initialData={initialData} folders={folders} onSave={onSave} />;
}

function ModuleFormSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
}
