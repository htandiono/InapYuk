'use client';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clientEnv } from '@/lib/env';
import { api, ApiError } from '@/lib/api-client';

function useGoogleLink() {
  const router = useRouter();
  const handleSuccess = async (res: { credential?: string }) => {
    if (!res.credential) return;
    try {
      await api.post('/users/google-link', { token: res.credential });
      toast.success('Akun Google berhasil ditautkan');
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof ApiError ? error.message : null) || 'Gagal menautkan akun Google');
    }
  };
  return { handleSuccess, handleError: () => toast.error('Gagal menautkan akun Google') };
}

export function GoogleLinkButton() {
  const { handleSuccess, handleError } = useGoogleLink();
  if (!clientEnv.googleClientId) return null;
  return (
    <GoogleOAuthProvider clientId={clientEnv.googleClientId}>
      <div className="w-full flex justify-center mt-4">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap={false} theme="outline" shape="pill" />
      </div>
    </GoogleOAuthProvider>
  );
}
