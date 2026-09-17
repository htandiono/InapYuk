import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import Link from 'next/link';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { RegisterFormValues } from './RegisterHooks';

export function RegisterFormFields({ register, errors, isSubmitting }: { register: UseFormRegister<RegisterFormValues>; errors: FieldErrors<RegisterFormValues>; isSubmitting: boolean }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label><Input id="name" placeholder="Budi Santoso" {...register('name')} disabled={isSubmitting} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="budi@example.com" {...register('email')} disabled={isSubmitting} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
    </>
  );
}

export function RegisterFormActions({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-xl transition-all" disabled={isSubmitting}>
        {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
      </Button>
      <div className="mt-6 flex items-center space-x-2">
        <Separator className="flex-1" /><span className="text-xs text-muted-foreground uppercase tracking-wider">Atau daftar dengan</span><Separator className="flex-1" />
      </div>
      <div className="mt-6"><GoogleLoginButton /></div>
      <div className="mt-4 text-center text-sm">Punya properti? <Link href="/tenant/register" className="text-primary hover:underline">Daftar sebagai Tenant</Link></div>
    </>
  );
}
