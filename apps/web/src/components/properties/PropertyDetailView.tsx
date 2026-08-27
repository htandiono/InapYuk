'use client';

import { useState } from 'react';
import Image from 'next/image';
import { RoomSelector, type Room } from './RoomSelector';
import { PriceCalendar } from './PriceCalendar';
import { BookingWidget } from './BookingWidget';
import { BackButton } from '@/components/ui/BackButton';

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

export interface PropertyDetailViewProps {
  property: Property;
  initialDate?: string;
}

export function PropertyDetailView({ property, initialDate }: PropertyDetailViewProps) {
  // Sort rooms by price to find the cheapest
  const sortedRooms = [...property.rooms].sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
  const cheapestRoomId = sortedRooms[0]?.id;

  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(cheapestRoomId);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate || null);
  const [selectedNightData, setSelectedNightData] = useState<{ price: number, isAvailable: boolean } | null>(null);

  return (
    <div className="w-full">
      <div className="mb-6">
        <BackButton fallbackHref="/properties" />
      </div>

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
      {/* Gallery */}
      <div className="mb-12">
        {property.images.length === 0 && (
          <div className="w-full aspect-21/9 sm:aspect-video md:aspect-21/9 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground">
            Belum ada foto
          </div>
        )}

        {property.images.length === 1 && (
          <div className="w-full aspect-21/9 sm:aspect-video md:aspect-21/9 rounded-3xl overflow-hidden bg-muted relative">
            <Image src={property.images[0].url} alt={property.name} fill sizes="100vw" className="object-cover" />
          </div>
        )}

        {property.images.length === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-75 sm:h-100 md:h-125">
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-muted">
              <Image src={property.images[0].url} alt={property.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="hidden md:block relative w-full h-full rounded-3xl overflow-hidden bg-muted">
              <Image src={property.images[1].url} alt={property.name} fill sizes="50vw" className="object-cover" />
            </div>
          </div>
        )}

        {property.images.length === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-75 sm:h-100 md:h-125">
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-muted">
              <Image src={property.images[0].url} alt={property.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-4 h-full">
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-muted">
                <Image src={property.images[1].url} alt={property.name} fill sizes="50vw" className="object-cover" />
              </div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-muted">
                <Image src={property.images[2].url} alt={property.name} fill sizes="50vw" className="object-cover" />
              </div>
            </div>
          </div>
        )}

        {property.images.length === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-75 sm:h-100 md:h-125">
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-muted">
              <Image src={property.images[0].url} alt={property.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-muted col-span-2">
                <Image src={property.images[1].url} alt={property.name} fill sizes="50vw" className="object-cover" />
              </div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-muted">
                <Image src={property.images[2].url} alt={property.name} fill sizes="25vw" className="object-cover" />
              </div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-muted">
                <Image src={property.images[3].url} alt={property.name} fill sizes="25vw" className="object-cover" />
              </div>
            </div>
          </div>
        )}

        {property.images.length >= 5 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-75 sm:h-100 md:h-125">
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-muted">
              <Image src={property.images[0].url} alt={property.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">
              {property.images.slice(1, 5).map((img, idx) => (
                <div key={idx} className="relative w-full h-full rounded-3xl overflow-hidden bg-muted">
                  <Image src={img.url} alt={`${property.name} ${idx + 1}`} fill sizes="25vw" className="object-cover" />
                  {idx === 3 && property.images.length > 5 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:bg-black/50 transition-colors">
                      +{property.images.length - 5}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Tentang Penginapan Ini</h2>
          <div className="relative">
            <p className={`text-muted-foreground leading-relaxed whitespace-pre-wrap ${!isDescriptionExpanded && property.description.length > 300 ? 'line-clamp-4' : ''}`}>
              {property.description}
            </p>
            {property.description.length > 300 && (
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-primary font-semibold mt-2 hover:underline focus:outline-none"
              >
                {isDescriptionExpanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
              </button>
            )}
          </div>

          <hr className="my-10 border-border/60" />
          
          <RoomSelector 
            rooms={property.rooms} 
            selectedRoomId={selectedRoomId!} 
            onSelectRoom={setSelectedRoomId}
            selectedNight={selectedDate && selectedNightData ? { date: selectedDate, ...selectedNightData } : null}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 flex flex-col gap-6">
            {selectedRoomId ? (
              <>
                <PriceCalendar 
                  slug={property.slug} 
                  roomId={selectedRoomId} 
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onNightDataChange={setSelectedNightData}
                />
                {/* Booking Widget Placeholder for Feature 2 */}
                <BookingWidget 
                  selectedDate={selectedDate} 
                  selectedNightData={selectedNightData} 
                />
              </>
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
