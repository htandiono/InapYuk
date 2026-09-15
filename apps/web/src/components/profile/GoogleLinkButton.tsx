'use client';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clientEnv } from '@/lib/env';
import { api } from '@/lib/api-client';

export function GoogleLinkButton() {
  const router = useRouter();

  if (!clientEnv.googleClientId) {
    return null;
  }

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    try {
      await api.post('/users/google-link', { token: credentialResponse.credential });
      toast.success('Akun Google berhasil ditautkan');
      router.refresh();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal menautkan akun Google');
    }
  };

  const handleError = () => {
    toast.error('Gagal menautkan akun Google');
  };

  return (
    <GoogleOAuthProvider clientId={clientEnv.googleClientId}>
      <div className="w-full flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          theme="outline"
          shape="pill"
        />
      </div>
    </GoogleOAuthProvider>
  );
}
