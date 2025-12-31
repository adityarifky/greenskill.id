import { Header } from '@/components/layout/header';
import { SchemeFormDynamic } from '../_components/scheme-form-dynamic';

export default function NewSchemePage() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Buat Skema Baru" />
      <main className="flex-1 p-4 md:p-8">
        <SchemeFormDynamic />
      </main>
    </div>
  );
}
