import { cookies } from 'next/headers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PropertyCatalog } from '@/components/properties/PropertyCatalog';
import { Suspense } from 'react';

export default async function PropertiesPage() {
  const cookieStore = await cookies(), isAuthenticated = !!cookieStore.get('accessToken')?.value;
  return (
    <div className="flex min-h-full flex-col">
      <Navbar isAuthenticated={isAuthenticated} hideSearch={true} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pt-8 pb-16 sm:px-8">
        <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Memuat...</div>}><PropertyCatalog /></Suspense>
      </main>
      <Footer />
    </div>
  );
}
