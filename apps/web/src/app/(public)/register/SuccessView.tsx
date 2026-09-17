import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface SuccessViewProps {
  cooldown: number;
  isResending: boolean;
  onResend: () => void;
}

export function SuccessView({ cooldown, isResending, onResend }: SuccessViewProps) {
  const router = useRouter();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Berhasil!</CardTitle>
          <CardDescription>
            Pendaftaran berhasil. Silakan cek email kamu untuk link verifikasi.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 justify-center">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
          >
            Kembali ke Beranda
          </Button>
          <Button
            onClick={onResend}
            variant="link"
            className="text-sm text-primary p-0 h-auto"
            disabled={isResending || cooldown > 0}
          >
            {isResending
              ? 'Mengirim...'
              : cooldown > 0
                ? `Kirim ulang email (${cooldown}s)`
                : 'Belum menerima email? Kirim ulang'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
