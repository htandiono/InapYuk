import PropertyList from '@/components/tenant/PropertyList';

export default function TenantPropertiesPage() {
  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-heading">Properti</h2>
          <p className="text-muted-foreground mt-1">Kelola daftar properti yang Anda sewakan</p>
        </div>
      </div>
      
      <PropertyList />
    </div>
  );
}
