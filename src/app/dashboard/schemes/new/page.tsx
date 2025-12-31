import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

const SchemeForm = dynamic(() => import('../_components/scheme-form').then(mod => mod.SchemeForm), {
  ssr: false,
  loading: () => (
     <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  ),
});

export default function NewSchemePage() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Skema Baru" />
      <main className="flex-1 p-4 md:p-8">
        <SchemeForm />
      </main>
    </div>
  );
}
