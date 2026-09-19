import { TenantSidebar } from '@/components/layout/TenantSidebar';
import { TenantTopbar } from '@/components/layout/TenantTopbar';
import { TenantFooter } from '@/components/layout/TenantFooter';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen min-w-[320px] overflow-hidden bg-muted/20">
      <TenantSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TenantTopbar />
        <main className="flex-1 overflow-y-auto outline-none flex flex-col">
          <div className="flex-1 flex flex-col">{children}</div>
          <TenantFooter />
        </main>
      </div>
    </div>
  );
}
