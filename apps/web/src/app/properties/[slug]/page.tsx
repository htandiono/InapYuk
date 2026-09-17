import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PropertyDetailView, type Property } from '@/components/properties/PropertyDetailView';
import { api } from '@/lib/api-client';

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const isAuthenticated = !!token;

  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const initialCheckIn =
    typeof resolvedSearchParams.checkIn === 'string' ? resolvedSearchParams.checkIn : undefined;

  let property: Property;
  try {
    const data = await api.get<Property>(`/properties/${slug}`);
    property = data;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as { status: number }).status === 404
    ) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="flex min-h-full flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pt-8 pb-16 sm:px-8">
        <PropertyDetailView property={property} initialDate={initialCheckIn} />
      </main>

      <Footer />
    </div>
  );
}
