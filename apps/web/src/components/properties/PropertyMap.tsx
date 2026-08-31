'use client';
import { useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix missing marker icons in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

interface PropertyMapProps {
  lat: number;
  lng: number;
  name: string;
  address?: string;
  draggable?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
}

export default function PropertyMap({ lat, lng, name, address, draggable = false, onLocationChange }: PropertyMapProps) {
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onLocationChange?.(latLng.lat, latLng.lng);
        }
      },
    }),
    [onLocationChange]
  );

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '380px', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={[lat, lng]} 
          icon={icon} 
          draggable={draggable}
          eventHandlers={draggable ? eventHandlers : undefined}
          ref={markerRef}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{name}</p>
              {address && <p className="text-gray-500 mt-0.5">{address}</p>}
              {draggable && <p className="text-xs text-primary mt-1 font-medium">Geser pin untuk mengubah lokasi</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 z-400 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#EA4335"/>
        </svg>
        Buka di Google Maps
      </a>
    </div>
  );
}
