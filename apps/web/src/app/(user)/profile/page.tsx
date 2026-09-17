import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProfileView } from '@/components/profile/ProfileView';
import { clientEnv } from '@/lib/env';

export const metadata = {
  title: 'Profil Saya | InapYuk',
};

async function getProfile(token: string) {
  try {
    const res = await fetch(`${clientEnv.apiBaseUrl}/users/profile`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch { return null; }
}

export default async function ProfilePage() {
  const cookieStore = await cookies(), token = cookieStore.get('accessToken')?.value;
  if (!token) redirect('/login');
  const user = await getProfile(token);
  if (!user) redirect('/login');
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar isAuthenticated={true} />
      <main className="flex-1 w-full flex flex-col pt-8 pb-16"><div className="w-full max-w-5xl mx-auto px-5 sm:px-8"><ProfileView user={user} /></div></main>
      <Footer />
    </div>
  );
}
