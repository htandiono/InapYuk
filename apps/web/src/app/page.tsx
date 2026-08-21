import { cookies } from 'next/headers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { SearchForm } from '@/components/home/SearchForm';
import { PropertyListPreview } from '@/components/home/PropertyListPreview';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const isAuthenticated = !!token;

  return (
    <div className="flex min-h-full flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pt-8 pb-16 sm:px-8">
        <HeroCarousel />
        <SearchForm />
        <PropertyListPreview />
      </main>

      <Footer />
    </div>
  );
}
