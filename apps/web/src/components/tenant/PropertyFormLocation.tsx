'use client';

import { PROVINCES, getCitiesByProvinceId, getProvinceIdByName } from '@/data/indonesia-regions';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import type { PropertyFormValues } from './PropertyFormNew';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('../properties/PropertyMap'), { ssr: false, loading: () => <div className="h-32 w-full rounded-lg bg-muted animate-pulse" /> });

interface Props {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  initialData?: { province?: string; latitude?: number | null; longitude?: number | null };
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  selectedGeo: { lat: number; lng: number } | null;
  handleSuggestionSelect: (s: { formatted: string; lat: number; lng: number }) => void;
  handleMarkerDrag: (lat: number, lng: number) => void;
}

export function PropertyFormLocation({
  control, errors, loading, initialData,
  searchQuery, setSearchQuery, selectedGeo, handleSuggestionSelect, handleMarkerDrag,
}: Props) {
  const initialProvinceId = initialData?.province ? (getProvinceIdByName(initialData.province) ?? '') : '';
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(initialProvinceId);
  const availableCities = getCitiesByProvinceId(selectedProvinceId);

  const [suggestionsLocal, setSuggestionsLocal] = useState<{ formatted: string; lat: number; lng: number }[]>([]);
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
    <div className="space-y-3">
      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><label className="text-sm font-medium">Lokasi Properti</label></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Provinsi <span className="text-destructive">*</span></label>
          <Controller name="state" control={control} render={({ field }) => (
            <select value={selectedProvinceId} disabled={loading} onChange={(e) => { const province = PROVINCES.find((p) => p.id === e.target.value); setSelectedProvinceId(e.target.value); field.onChange(province?.name ?? ''); }} className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${errors.state ? 'border-destructive ring-1 ring-destructive' : 'border-input hover:border-primary/50'}`}>
              <option value="">Pilih Provinsi...</option>
              {PROVINCES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )} />
          {errors.state && <p className="flex items-center gap-1 text-destructive text-xs mt-1.5"><span>⚠</span> {errors.state.message}</p>}
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wide ${selectedProvinceId ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>Kota / Kabupaten <span className="text-destructive">*</span></label>
          <Controller name="city" control={control} render={({ field }) => (
            <div className="relative">
              <select {...field} disabled={loading || !selectedProvinceId} className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/30 ${errors.city ? 'border-destructive ring-1 ring-destructive' : 'border-input hover:border-primary/50'} ${!selectedProvinceId ? 'border-dashed' : ''}`}>
                <option value="">{selectedProvinceId ? 'Pilih Kota / Kabupaten...' : '← Pilih provinsi terlebih dahulu'}</option>
                {availableCities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              {!selectedProvinceId && <div className="absolute inset-0 rounded-md cursor-not-allowed" title="Pilih provinsi terlebih dahulu" />}
            </div>
          )} />
          {errors.city && <p className="flex items-center gap-1 text-destructive text-xs mt-1.5"><span>⚠</span> {errors.city.message}</p>}
          {!selectedProvinceId && !errors.city && <p className="text-xs text-muted-foreground/70 mt-1.5">Pilih provinsi untuk mengaktifkan pilihan kota.</p>}
        </div>
      </div>
      <div className="relative z-10 pt-2">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Cari Alamat Cepat <span className="normal-case font-normal text-muted-foreground/60">(Opsional)</span></label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value.length < 3) setSuggestionsLocal([]); }} onFocus={() => { if (suggestionsLocal.length > 0) setShowSuggestionsLocal(true); }} disabled={loading || !selectedProvinceId} placeholder="Ketik nama jalan atau gedung untuk mencari..." className="pl-9 pr-9 bg-muted/20" />
          {isSearchingLocal && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
        </div>
        {showSuggestionsLocal && suggestionsLocal.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto bg-background border border-border rounded-md shadow-lg z-50">
            {suggestionsLocal.map((s, i) => <li key={i} className="px-4 py-2 hover:bg-muted cursor-pointer text-sm" onClick={() => handleSuggestionSelect(s)}><MapPin className="inline-block h-3.5 w-3.5 mr-2 text-primary" />{s.formatted}</li>)}
          </ul>
        )}
        {showSuggestionsLocal && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestionsLocal(false)} />}
      </div>
      <div className="pt-2">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Alamat Lengkap <span className="text-destructive">*</span></label>
        <Controller name="address" control={control} render={({ field }) => <Input {...field} maxLength={150} disabled={loading} placeholder="Nama jalan, nomor, gedung..." className={errors.address ? 'border-destructive' : ''} />} />
        {errors.address && <p className="flex items-center gap-1 text-destructive text-xs mt-1.5"><span>⚠</span> {errors.address.message}</p>}
        {selectedGeo && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Peta Lokasi</label>
            <div className="space-y-3 pt-4 border-t border-border">
              <PropertyMap lat={selectedGeo.lat} lng={selectedGeo.lng} name="Lokasi Pilihan" draggable={true} onLocationChange={handleMarkerDrag} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
