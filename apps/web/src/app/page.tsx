import { cookies } from 'next/headers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { SearchForm } from '@/components/home/SearchForm';
import { PropertyListPreview } from '@/components/home/PropertyListPreview';

export default async function HomePage() {
  const cookieStore = await cookies(), isAuthenticated = !!cookieStore.get('accessToken')?.value;
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-1 w-full flex flex-col pt-8 pb-16">
        <div className="w-full max-w-5xl mx-auto px-5 sm:px-8"><HeroCarousel /><SearchForm /><PropertyListPreview /></div>
      </main>
      <Footer />
    </div>
  );
}
