'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { SuccessView } from './SuccessView';
import { useRegisterCooldown, useRegisterForm, useRegisterResend } from './RegisterHooks';
import { RegisterFormFields, RegisterFormActions } from './RegisterFormUI';

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const { cooldown, setCooldown } = useRegisterCooldown();
  const { form, isSubmitting, serverError, onSubmit } = useRegisterForm(setCooldown, setSuccess);
  const { isResending, onResend } = useRegisterResend(form.getValues, setCooldown);

  if (success) return <SuccessView cooldown={cooldown} isResending={isResending} onResend={onResend} />;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4"><Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center text-center pb-2"><Logo className="mb-2 text-3xl" /><CardTitle className="text-xl font-bold">Daftar Akun</CardTitle><CardDescription>Mulai cari dan bandingkan penginapan terbaik</CardDescription></CardHeader>
        <CardContent><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {serverError && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{serverError}</div>}
            <RegisterFormFields register={form.register} errors={form.formState.errors} isSubmitting={isSubmitting} />
            <RegisterFormActions isSubmitting={isSubmitting} />
        </form></CardContent>
    </Card></div>
  );
}
