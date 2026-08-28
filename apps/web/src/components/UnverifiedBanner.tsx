import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import type { UserRole } from '@inapyuk/types';

interface JwtPayload {
  role: UserRole;
  isVerified: boolean;
}

export async function UnverifiedBanner() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  let isVerified = true;
  try {
    const payload = decodeJwt(token) as unknown as JwtPayload;
    isVerified = payload.isVerified;
  } catch {
    // If we can't parse it, ignore
  }

  if (isVerified) return null;

  return (
    <div className="bg-amber-100 p-3 text-center text-sm font-medium text-amber-800">
      Akun kamu belum diverifikasi. Cek email untuk link verifikasi agar bisa menggunakan semua fitur.{' '}
      <a href="/resend-verification" className="underline hover:text-amber-900 font-bold">
        Kirim ulang email
      </a>
    </div>
  );
}
