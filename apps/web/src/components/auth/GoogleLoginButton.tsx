'use client';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clientEnv } from '@/lib/env';
import { api } from '@/lib/api-client';

export function GoogleLoginButton() {
  const router = useRouter();

  if (!clientEnv.googleClientId) {
    return null;
  }

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    try {
      await api.post('/auth/google', { token: credentialResponse.credential });
      toast.success('Login Google berhasil');
      router.push('/');
      router.refresh();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Gagal login dengan Google');
    }
  };

  const handleError = () => {
    toast.error('Login dengan Google gagal');
  };

  return (
    <GoogleOAuthProvider clientId={clientEnv.googleClientId}>
      <div className="w-full flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
          theme="outline"
          shape="pill"
        />
      </div>
    </GoogleOAuthProvider>
  );
}
