'use client';
import { BackButton } from '@/components/ui/BackButton';
import Image from 'next/image';
import { useState } from 'react';
import { BookingWidget } from './BookingWidget';
import { ImageLightbox } from './ImageLightbox';
import { PriceCalendar } from './PriceCalendar';
import { PropertyLocation } from './PropertyLocation';
import { RoomSelector, type Room } from './RoomSelector';

export interface Property {
  id: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  province: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  category: { name: string };
  tenant?: { id: string; companyName: string; logoUrl?: string | null } | null;
  images: { url: string }[];
  rooms: Room[];
}
export interface PropertyDetailViewProps {
  property: Property;
  initialDate?: string;
}

// prettier-ignore
function Gallery({ imgs, name }: { imgs: { url: string }[], name: string }) {
  const [lb, setLb] = useState({ open: false, idx: 0 });
  const renderImg = (i: number, cls?: string, children?: React.ReactNode) => <div key={i} onClick={() => setLb({ open: true, idx: i })} className={`relative cursor-pointer w-full h-full rounded-3xl overflow-hidden bg-muted group ${cls || ''}`}><Image src={imgs[i].url} alt={name} fill sizes="100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />{children}</div>;
  if (imgs.length === 0) return <div className="w-full aspect-21/9 sm:aspect-video md:aspect-21/9 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground">Belum ada foto</div>;
  if (imgs.length === 1) return <><div className="w-full aspect-21/9 sm:aspect-video md:aspect-21/9">{renderImg(0)}</div>{lb.open && <ImageLightbox images={imgs} initialIndex={lb.idx} isOpen={lb.open} onClose={() => setLb({ ...lb, open: false })} altPrefix={name} />}</>;
  if (imgs.length === 2) return <><div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-75 sm:h-100 md:h-125">{renderImg(0)}{renderImg(1, "hidden md:block")}</div>{lb.open && <ImageLightbox images={imgs} initialIndex={lb.idx} isOpen={lb.open} onClose={() => setLb({ ...lb, open: false })} altPrefix={name} />}</>;
  if (imgs.length === 3) return <><div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-75 sm:h-100 md:h-125">{renderImg(0)}<div className="hidden md:grid grid-rows-2 gap-4 h-full">{renderImg(1)}{renderImg(2)}</div></div>{lb.open && <ImageLightbox images={imgs} initialIndex={lb.idx} isOpen={lb.open} onClose={() => setLb({ ...lb, open: false })} altPrefix={name} />}</>;
  if (imgs.length === 4) return <><div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-75 sm:h-100 md:h-125">{renderImg(0)}<div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">{renderImg(1, "col-span-2")}{renderImg(2)}{renderImg(3)}</div></div>{lb.open && <ImageLightbox images={imgs} initialIndex={lb.idx} isOpen={lb.open} onClose={() => setLb({ ...lb, open: false })} altPrefix={name} />}</>;
  return <><div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-75 sm:h-100 md:h-125">{renderImg(0)}<div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">{imgs.slice(1, 5).map((_, idx) => renderImg(idx + 1, "", idx === 3 && imgs.length > 5 ? <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xl hover:bg-black/50 transition-colors">+{imgs.length - 5}</div> : null))}</div></div>{lb.open && <ImageLightbox images={imgs} initialIndex={lb.idx} isOpen={lb.open} onClose={() => setLb({ ...lb, open: false })} altPrefix={name} />}</>;
}

// prettier-ignore
function PropertyHeader({ property }: { property: Property }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><span className="uppercase tracking-wider font-semibold text-accent">{property.category.name}</span><span>&bull;</span><span>{property.city}, {property.province}</span></div>
      <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">{property.name}</h1>
      <p className="text-muted-foreground mt-2">{property.address}</p>
    </div>
  );
}

// prettier-ignore
function PropertyDesc({ text, isExpanded, onToggle }: { text: string, isExpanded: boolean, onToggle: () => void }) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Tentang Penginapan Ini</h2>
      <div className="relative">
        <p className={`text-muted-foreground leading-relaxed whitespace-pre-wrap ${!isExpanded && text.length > 300 ? 'line-clamp-4' : ''}`}>{text}</p>
        {text.length > 300 && <button onClick={onToggle} className="text-primary font-semibold mt-2 hover:underline focus:outline-none">{isExpanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}</button>}
      </div>
    </div>
  );
}

// prettier-ignore
function PropertySidebar({ slug, room, date, setDate, night, setNight }: { slug: string, room: string, date: string | null, setDate: (d: string | null) => void, night: { date?: string, price: number, isAvailable: boolean } | null, setNight: (n: { date?: string, price: number, isAvailable: boolean } | null) => void }) {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6 flex flex-col gap-6">
        {room ? <><PriceCalendar slug={slug} roomId={room} selectedDate={date} onSelectDate={setDate} onNightDataChange={setNight} /><BookingWidget selectedDate={date} selectedNightData={night} roomId={room} /></> : <div className="p-6 rounded-3xl border border-border text-center text-muted-foreground">Tidak ada kamar tersedia.</div>}
      </div>
    </div>
  );
}

// prettier-ignore
export function PropertyDetailView({ property, initialDate }: PropertyDetailViewProps) {
  const cheapestRoomId = [...property.rooms].sort((a, b) => Number(a.basePrice) - Number(b.basePrice))[0]?.id || '';
  const [[roomId, night, date, isExp], set] = useState<[string, { date?: string, price: number, isAvailable: boolean } | null, string | null, boolean]>([cheapestRoomId, null, initialDate || null, false]);
  return (
    <div className="w-full">
      <div className="mb-6"><BackButton fallbackHref="/properties" /></div><PropertyHeader property={property} /><div className="mb-12"><Gallery imgs={property.images} name={property.name} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2"><PropertyDesc text={property.description} isExpanded={isExp} onToggle={() => set([roomId, night, date, !isExp])} /><hr className="my-10 border-border/60" /><RoomSelector rooms={property.rooms} selectedRoomId={roomId} onSelectRoom={(r: string) => set([r, night, date, isExp])} selectedNight={night} /><PropertyLocation lat={property.latitude} lng={property.longitude} name={property.name} address={property.address} city={property.city} province={property.province} /></div>
        <PropertySidebar slug={property.slug} room={roomId} date={date} setDate={(d: string | null) => set([roomId, night, d, isExp])} night={night} setNight={(n: { date?: string, price: number, isAvailable: boolean } | null) => set([roomId, n, date, isExp])} />
      </div>
    </div>
  );
}
