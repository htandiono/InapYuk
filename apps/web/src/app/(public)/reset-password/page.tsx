import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Lupa Password | InapYuk',
  description: 'Reset password akun InapYuk Anda',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  );
}
