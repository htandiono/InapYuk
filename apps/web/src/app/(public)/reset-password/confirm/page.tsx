import { ConfirmResetPasswordForm } from '@/components/auth/ConfirmResetPasswordForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Konfirmasi Reset Password | InapYuk',
  description: 'Buat password baru akun InapYuk Anda',
};

export default function ConfirmResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse h-64 w-full max-w-md bg-muted rounded-xl" />}>
        <ConfirmResetPasswordForm />
      </Suspense>
    </div>
  );
}
