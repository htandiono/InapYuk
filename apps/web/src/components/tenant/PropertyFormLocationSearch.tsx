'use client';

import { Search, Loader2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PROVINCES } from '@/data/indonesia-regions';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('../properties/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-32 w-full rounded-lg bg-muted animate-pulse" />,
});

interface LocationSearchProps {
  loading: boolean;
  selectedProvinceId: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  selectedGeo: { lat: number; lng: number } | null;
  handleSuggestionSelect: (s: { formatted: string; lat: number; lng: number }) => void;
  handleMarkerDrag: (lat: number, lng: number) => void;
}

export function LocationSearch({
  loading,
  selectedProvinceId,
  searchQuery,
  setSearchQuery,
  selectedGeo,
  handleSuggestionSelect,
  handleMarkerDrag,
}: LocationSearchProps) {
  const [suggestionsLocal, setSuggestionsLocal] = useState<
    { formatted: string; lat: number; lng: number }[]
  >([]);
  const [showSuggestionsLocal, setShowSuggestionsLocal] = useState(false);
  const [isSearchingLocal, setIsSearchingLocal] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 3) return;
    const timeout = setTimeout(async () => {
      setIsSearchingLocal(true);
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name || '';
        const url = new URL('/api/geo/autocomplete', window.location.origin);
        url.searchParams.append('q', searchQuery);
        if (province) url.searchParams.append('province', province);
        const res = await fetch(url.toString());
        const json = await res.json();
        if (json.success) {
          setSuggestionsLocal(json.data);
          setShowSuggestionsLocal(true);
        }
      } catch (err) {
        console.error('Failed to search address', err);
      } finally {
        setIsSearchingLocal(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedProvinceId]);

  return (
    <div className="relative z-10 pt-2">
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
        Cari Alamat Cepat{' '}
        <span className="normal-case font-normal text-muted-foreground/60">(Opsional)</span>
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length < 3) setSuggestionsLocal([]);
          }}
          onFocus={() => {
            if (suggestionsLocal.length > 0) setShowSuggestionsLocal(true);
          }}
          disabled={loading || !selectedProvinceId}
          placeholder="Ketik nama jalan atau gedung untuk mencari..."
          className="pl-9 pr-9 bg-muted/20"
        />
        {isSearchingLocal && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>
      {showSuggestionsLocal && suggestionsLocal.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto bg-background border border-border rounded-md shadow-lg z-50">
          {suggestionsLocal.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
              onClick={() => handleSuggestionSelect(s)}
            >
              <MapPin className="inline-block h-3.5 w-3.5 mr-2 text-primary" />
              {s.formatted}
            </li>
          ))}
        </ul>
      )}
      {showSuggestionsLocal && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSuggestionsLocal(false)} />
      )}
      {selectedGeo && (
        <div className="mt-3">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Peta Lokasi
          </label>
          <div className="space-y-3 pt-4 border-t border-border">
            <PropertyMap
              lat={selectedGeo.lat}
              lng={selectedGeo.lng}
              name="Lokasi Pilihan"
              draggable={true}
              onLocationChange={handleMarkerDrag}
            />
          </div>
        </div>
      )}
    </div>
  );
}
