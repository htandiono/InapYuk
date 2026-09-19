import CategoryList from '@/components/tenant/CategoryList';

export default function TenantCategoriesPage() {
  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-heading">Kategori Properti</h2>
          <p className="text-muted-foreground mt-1">Kelola jenis kategori untuk properti Anda</p>
        </div>
      </div>
      
      <CategoryList />
    </div>
  );
}
