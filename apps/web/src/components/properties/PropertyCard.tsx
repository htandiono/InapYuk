import Link from 'next/link';
import { Store } from 'lucide-react';

interface PropertyCardProps {
  id: string;
  slug: string;
  name: string;
  city: string;
  province: string;
  categoryName: string;
  imageUrl: string | null;
  cheapestPrice: number;
  tenantName?: string | null;
  queryString?: string;
}

export function PropertyCard({
  slug,
  name,
  city,
  province,
  categoryName,
  imageUrl,
  cheapestPrice,
  tenantName,
  queryString,
}: PropertyCardProps) {
  // Use Indonesian Rupiah format
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(cheapestPrice);

  const href = queryString ? `/properties/${slug}?${queryString}` : `/properties/${slug}`;

  return (
    <Link
      href={href}
      className="group block rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all"
    >
      <div className="aspect-4/3 w-full bg-muted relative overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground text-xs">
            Belum ada foto
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider">
            {categoryName}
          </p>
          <span
            className="text-xs text-muted-foreground truncate max-w-30"
            title={`${city}, ${province}`}
          >
            {city}, {province}
          </span>
        </div>

        <h3 className="font-heading text-lg font-bold text-foreground truncate mt-1">{name}</h3>

        {tenantName && (
          <div className="flex items-center gap-1 mt-1">
            <Store className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{tenantName}</span>
          </div>
        )}

        <div className="mt-3 flex items-baseline gap-1">
          <p className="text-lg font-bold text-primary">{formattedPrice}</p>
          <p className="text-xs text-muted-foreground">/ malam</p>
        </div>
      </div>
    </Link>
  );
}
