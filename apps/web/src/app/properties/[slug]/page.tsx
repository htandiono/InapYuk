import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PropertyDetailView, type Property } from '@/components/properties/PropertyDetailView';
import { api } from '@/lib/api-client';

async function fetchProperty(slug: string) {
  try {
    return await api.get<Property>(`/properties/${slug}`);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) notFound();
    throw err;
  }
}

type TParams = { params: Promise<{ slug: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> };
export default async function PropertyDetailPage({ params, searchParams }: TParams) {
  const cookieStore = await cookies(), isAuthenticated = !!cookieStore.get('accessToken')?.value;
  const { slug } = await params, resolvedSearchParams = await searchParams;
  const initialCheckIn = typeof resolvedSearchParams.checkIn === 'string' ? resolvedSearchParams.checkIn : undefined;
  const property = await fetchProperty(slug);
  return (
    <div className="flex min-h-full flex-col">
      <Navbar isAuthenticated={isAuthenticated} searchHref="/properties" />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pt-8 pb-16 sm:px-8"><PropertyDetailView property={property} initialDate={initialCheckIn} /></main>
      <Footer />
    </div>
  );
}
