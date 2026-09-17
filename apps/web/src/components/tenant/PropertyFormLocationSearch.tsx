'use client';

import { Search, Loader2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PROVINCES } from '@/data/indonesia-regions';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('../properties/PropertyMap'), {
  ssr: false, loading: () => <div className="h-32 w-full rounded-lg bg-muted animate-pulse" />,
});

interface LocationSearchProps {
  loading: boolean; selectedProvinceId: string; searchQuery: string; setSearchQuery: (q: string) => void;
  showSuggestions: boolean; setShowSuggestions: (v: boolean) => void;
  selectedGeo: { lat: number; lng: number } | null;
  handleSuggestionSelect: (s: { formatted: string; lat: number; lng: number }) => void;
  handleMarkerDrag: (lat: number, lng: number) => void;
}

async function fetchSuggestions(query: string, provinceId: string) {
  const p = PROVINCES.find((x) => x.id === provinceId)?.name || '';
  const url = new URL('/api/geo/autocomplete', window.location.origin);
  url.searchParams.append('q', query); if (p) url.searchParams.append('province', p);
  const res = await fetch(url.toString()); const json = await res.json();
  return json.success ? json.data : null;
}

function useSuggestionsLocal(searchQuery: string, selectedProvinceId: string) {
  const [suggestionsLocal, setSuggestionsLocal] = useState<{ formatted: string; lat: number; lng: number }[]>([]);
  const [showSuggestionsLocal, setShowSuggestionsLocal] = useState(false), [isSearchingLocal, setIsSearchingLocal] = useState(false);
  useEffect(() => {
    if (searchQuery.length < 3) return;
    const t = setTimeout(() => {
      setIsSearchingLocal(true);
      fetchSuggestions(searchQuery, selectedProvinceId).then((data) => {
        if (data) { setSuggestionsLocal(data); setShowSuggestionsLocal(true); }
      }).catch(() => {}).finally(() => setIsSearchingLocal(false));
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, selectedProvinceId]);
  return { suggestionsLocal, setSuggestionsLocal, showSuggestionsLocal, setShowSuggestionsLocal, isSearchingLocal };
}

function SearchInputSection({ searchQuery, setSearchQuery, setSuggestionsLocal, setShowSuggestionsLocal, loading, selectedProvinceId, isSearchingLocal, suggestionsLocal }: { searchQuery: string; setSearchQuery: (q: string) => void; setSuggestionsLocal: (s: { formatted: string; lat: number; lng: number }[]) => void; setShowSuggestionsLocal: (v: boolean) => void; loading: boolean; selectedProvinceId: string; isSearchingLocal: boolean; suggestionsLocal: { formatted: string; lat: number; lng: number }[]; }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input value={searchQuery} disabled={loading || !selectedProvinceId} placeholder="Ketik nama jalan atau gedung untuk mencari..." className="pl-9 pr-9 bg-muted/20"
        onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value.length < 3) setSuggestionsLocal([]); }}
        onFocus={() => { if (suggestionsLocal.length > 0) setShowSuggestionsLocal(true); }}
      />
      {isSearchingLocal && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
    </div>
  );
}

function SuggestionsList({ suggestionsLocal, handleSuggestionSelect }: { suggestionsLocal: { formatted: string; lat: number; lng: number }[]; handleSuggestionSelect: (s: { formatted: string; lat: number; lng: number }) => void; }) {
  return (
    <ul className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto bg-background border border-border rounded-md shadow-lg z-50">
      {suggestionsLocal.map((s: { formatted: string; lat: number; lng: number }, i: number) => (
        <li key={i} className="px-4 py-2 hover:bg-muted cursor-pointer text-sm" onClick={() => handleSuggestionSelect(s)}>
          <MapPin className="inline-block h-3.5 w-3.5 mr-2 text-primary" />{s.formatted}
        </li>
      ))}
    </ul>
  );
}

function MapSection({ selectedGeo, handleMarkerDrag }: { selectedGeo: { lat: number; lng: number }; handleMarkerDrag: (lat: number, lng: number) => void; }) {
  return (
    <div className="mt-3">
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Peta Lokasi</label>
      <div className="space-y-3 pt-4 border-t border-border">
        <PropertyMap lat={selectedGeo.lat} lng={selectedGeo.lng} name="Lokasi Pilihan" draggable={true} onLocationChange={handleMarkerDrag} />
      </div>
    </div>
  );
}

export function LocationSearch({ loading, selectedProvinceId, searchQuery, setSearchQuery, selectedGeo, handleSuggestionSelect, handleMarkerDrag }: LocationSearchProps) {
  const { suggestionsLocal, setSuggestionsLocal, showSuggestionsLocal, setShowSuggestionsLocal, isSearchingLocal } = useSuggestionsLocal(searchQuery, selectedProvinceId);
  return (
    <div className="relative z-10 pt-2">
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Cari Alamat Cepat <span className="normal-case font-normal text-muted-foreground/60">(Opsional)</span></label>
      <SearchInputSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSuggestionsLocal={setSuggestionsLocal} setShowSuggestionsLocal={setShowSuggestionsLocal} loading={loading} selectedProvinceId={selectedProvinceId} isSearchingLocal={isSearchingLocal} suggestionsLocal={suggestionsLocal} />
      {showSuggestionsLocal && suggestionsLocal.length > 0 && <SuggestionsList suggestionsLocal={suggestionsLocal} handleSuggestionSelect={handleSuggestionSelect} />}
      {showSuggestionsLocal && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestionsLocal(false)} />}
      {selectedGeo && <MapSection selectedGeo={selectedGeo} handleMarkerDrag={handleMarkerDrag} />}
    </div>
  );
}
