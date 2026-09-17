import { LogoutButton } from '@/components/LogoutButton';

export default function TenantPropertiesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center">
      <h1 className="text-3xl font-bold font-heading text-primary mb-4">Dashboard Tenant</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Selamat datang di halaman kelola properti!
      </p>
      <div className="p-6 bg-muted rounded-lg border max-w-md w-full mb-8">
        <p className="text-sm font-medium">
          🚧 <strong>Segera Hadir di Sprint 2</strong> 🚧
        </p>
        <p className="text-sm mt-2 text-muted-foreground">
          Fitur manajemen properti dan dashboard tenant tidak termasuk dalam MVP Sprint 1. Tetap semangat!
        </p>
      </div>
      <LogoutButton />
    </div>
  );
}
