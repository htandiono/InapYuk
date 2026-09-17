'use client';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clientEnv } from '@/lib/env';
import { api, ApiError } from '@/lib/api-client';

function useGoogleLogin(role: 'USER' | 'TENANT') {
  const router = useRouter();
  const handleSuccess = async (res: { credential?: string }) => {
    if (!res.credential) return;
    try {
      await api.post('/auth/google', { token: res.credential, role });
      toast.success('Login Google berhasil');
      router.push(role === 'TENANT' ? '/tenant/properties' : '/');
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof ApiError ? error.message : null) || 'Gagal login dengan Google');
    }
  };
  return { handleSuccess, handleError: () => toast.error('Login dengan Google gagal') };
}

export function GoogleLoginButton({ role = 'USER' }: { role?: 'USER' | 'TENANT' }) {
  const { handleSuccess, handleError } = useGoogleLogin(role);
  if (!clientEnv.googleClientId) return null;
  return (
    <GoogleOAuthProvider clientId={clientEnv.googleClientId}>
      <div className="w-full flex justify-center mt-4">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap={false} theme="outline" shape="pill" />
      </div>
    </GoogleOAuthProvider>
  );
}
