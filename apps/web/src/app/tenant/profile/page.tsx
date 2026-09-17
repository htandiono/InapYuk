import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TenantProfilePlaceholder() {
  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full text-center border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Profil Tenant</CardTitle>
          <CardDescription>Pembaruan profil dan password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p>
              Fitur manajemen profil (termasuk unggah foto dan ubah password) dijadwalkan untuk
              dikerjakan pada <strong>Sprint Berikutnya</strong>.
            </p>
          </div>

          <Link href="/tenant/properties" className="block">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
