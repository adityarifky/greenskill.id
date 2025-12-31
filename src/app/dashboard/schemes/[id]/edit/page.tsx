import dynamic from 'next/dynamic';
import { getSchemeById } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const SchemeForm = dynamic(() => import('../../_components/scheme-form').then(mod => mod.SchemeForm), {
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


export default async function EditSchemePage({ params }: { params: { id: string } }) {
  const scheme = await getSchemeById(params.id);

  if (!scheme) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Edit Skema" />
      <main className="flex-1 p-4 md:p-8">
        <SchemeForm initialData={scheme} />
      </main>
    </div>
  );
}
