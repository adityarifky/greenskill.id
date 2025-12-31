import { getSchemeById } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { SchemeFormDynamic } from '../../_components/scheme-form-dynamic';


export default async function EditSchemePage({ params }: { params: { id: string } }) {
  const scheme = await getSchemeById(params.id);

  if (!scheme) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Edit Skema" />
      <main className="flex-1 p-4 md:p-8">
        <SchemeFormDynamic initialData={scheme} />
      </main>
    </div>
  );
}
