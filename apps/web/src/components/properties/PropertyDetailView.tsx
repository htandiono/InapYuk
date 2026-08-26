'use client';

import { useState } from 'react';
import { RoomSelector, type Room } from './RoomSelector';
import { PriceCalendar } from './PriceCalendar';

export interface Property {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  province: string;
  address: string;
  category: { name: string };
  images: { url: string }[];
  rooms: Room[];
}

export function PropertyDetailView({ property }: { property: Property }) {
  // Pre-select the room with the lowest base price
  const cheapestRoomId = property.rooms.reduce((prev, curr) => 
    prev.basePrice < curr.basePrice ? prev : curr
  , property.rooms[0])?.id;

  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(cheapestRoomId);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="uppercase tracking-wider font-semibold text-accent">
            {property.category.name}
          </span>
          <span>&bull;</span>
          <span>{property.city}, {property.province}</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
          {property.name}
        </h1>
        <p className="text-muted-foreground mt-2">{property.address}</p>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="aspect-4/3 rounded-3xl overflow-hidden bg-muted relative">
          {property.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={property.images[0].url} alt={property.name} className="object-cover w-full h-full" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Belum ada foto</div>
          )}
        </div>
        <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="rounded-3xl overflow-hidden bg-muted relative">
              {property.images[idx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={property.images[idx].url} alt={`${property.name} ${idx}`} className="object-cover w-full h-full" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-xs">Foto {idx+1}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Tentang Penginapan Ini</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {property.description}
          </p>

          <hr className="my-10 border-border/60" />
          
          <RoomSelector 
            rooms={property.rooms} 
            selectedRoomId={selectedRoomId!} 
            onSelectRoom={setSelectedRoomId}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {selectedRoomId ? (
              <PriceCalendar slug={property.slug} roomId={selectedRoomId} />
            ) : (
              <div className="p-6 rounded-3xl border border-border text-center text-muted-foreground">
                Tidak ada kamar tersedia.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
