import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProfileView } from '@/components/profile/ProfileView';
import { clientEnv } from '@/lib/env';

export const metadata = {
  title: 'Profil Tenant | InapYuk',
};

async function getProfile(token: string) {
  try {
    const res = await fetch(`${clientEnv.apiBaseUrl}/users/profile`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch { return null; }
}

export default async function TenantProfilePage() {
  const cookieStore = await cookies(), token = cookieStore.get('accessToken')?.value;
  if (!token) redirect('/tenant/login');
  const user = await getProfile(token);
  if (!user) redirect('/tenant/login');
  return (
    <div className="p-6 lg:p-8 w-full max-w-5xl mx-auto">
      <ProfileView user={user} isTenant />
    </div>
  );
}
