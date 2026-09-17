import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

export interface ConfirmResetValues {
  password: string;
  confirmPassword: string;
}

interface PasswordFieldProps {
  id: 'password' | 'confirmPassword';
  label: string;
  placeholder: string;
  register: ReturnType<typeof useForm<ConfirmResetValues>>['register'];
  error?: string;
  disabled: boolean;
}

export function PasswordField({ id, label, placeholder, register, error, disabled }: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <PasswordInput id={id} placeholder={placeholder} {...register(id)} disabled={disabled} />
      {id === 'password' && (
        <p className="text-[0.8rem] text-muted-foreground mt-1.5 leading-snug">
          Minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

type FCProps = { serverError: string | null; errors: { password?: { message?: string }; confirmPassword?: { message?: string } }; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; isSubmitting: boolean; register: ReturnType<typeof useForm<ConfirmResetValues>>['register']; };
export function FormContent({ serverError, errors, onSubmit, isSubmitting, register }: FCProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {serverError && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{serverError}</div>}
      <PasswordField id="password" label="Password Baru" placeholder="Minimal 8 karakter" register={register} error={errors.password?.message} disabled={isSubmitting} />
      <PasswordField id="confirmPassword" label="Konfirmasi Password Baru" placeholder="Ketik ulang password" register={register} error={errors.confirmPassword?.message} disabled={isSubmitting} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}</Button>
    </form>
  );
}
