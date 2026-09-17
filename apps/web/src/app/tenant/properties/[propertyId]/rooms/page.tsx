import RoomList from '@/components/tenant/RoomList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function PropertyRoomsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/tenant/properties"><Button variant="ghost" className="mb-4 pl-0 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4 mr-2" />Kembali ke Properti</Button></Link>
        <h2 className="text-3xl font-bold tracking-tight text-primary font-heading">Kelola Kamar</h2>
        <p className="text-muted-foreground mt-1">Kelola jenis kamar yang tersedia untuk properti ini</p>
      </div>
      <RoomList propertyId={propertyId} />
    </div>
  );
}
