import Link from 'next/link';
import { Store } from 'lucide-react';
import { PropertyImageCarousel } from './PropertyImageCarousel';

interface PropertyCardProps {
  id: string;
  slug: string;
  name: string;
  city: string;
  province: string;
  categoryName: string;
  imageUrls: string[];
  cheapestPrice: number;
  tenantName?: string | null;
  queryString?: string;
}



function PropertyDetails({ name, city, province, categoryName, cheapestPrice, tenantName }: Omit<PropertyCardProps, 'slug' | 'queryString' | 'imageUrls' | 'id'>) {
  const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(cheapestPrice);
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider">{categoryName}</p>
        <span className="text-xs text-muted-foreground truncate max-w-30" title={`${city}, ${province}`}>{city}, {province}</span>
      </div>
      <h3 className="font-heading text-lg font-bold text-foreground truncate mt-1">{name}</h3>
      {tenantName && <div className="flex items-center gap-1 mt-1"><Store className="h-3 w-3 text-muted-foreground shrink-0" /><span className="text-xs text-muted-foreground truncate">{tenantName}</span></div>}
      <div className="mt-3 flex items-baseline gap-1"><p className="text-lg font-bold text-primary">{formattedPrice}</p><p className="text-xs text-muted-foreground">/ malam</p></div>
    </div>
  );
}

export function PropertyCard(props: PropertyCardProps) {
  const href = props.queryString ? `/properties/${props.slug}?${props.queryString}` : `/properties/${props.slug}`;
  return (
    <Link href={href} className="group block rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all">
      <PropertyImageCarousel imageUrls={props.imageUrls} name={props.name} />
      <PropertyDetails {...props} />
    </Link>
  );
}
