'use client';

import { getCitiesByProvinceId, getProvinceIdByName } from '@/data/indonesia-regions';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { Control, FieldErrors } from 'react-hook-form';
import type { PropertyFormValues } from './PropertyFormNew';
import { LocationSearch } from './PropertyFormLocationSearch';
import { ProvinceSelect } from './PropertyFormLocationProvince';
import { CitySelect } from './PropertyFormLocationCity';

interface LocationSelectsProps {
  selectedProvinceId: string; setSelectedProvinceId: (id: string) => void;
  availableCities: string[]; control: Control<PropertyFormValues>; errors: FieldErrors<PropertyFormValues>; loading: boolean;
}

interface Props {
  control: Control<PropertyFormValues>; errors: FieldErrors<PropertyFormValues>; loading: boolean;
  initialData?: { province?: string; latitude?: number | null; longitude?: number | null };
  searchQuery: string; setSearchQuery: (q: string) => void;
  showSuggestions: boolean; setShowSuggestions: (v: boolean) => void;
  selectedGeo: { lat: number; lng: number } | null;
  handleSuggestionSelect: (s: { formatted: string; lat: number; lng: number }) => void;
  handleMarkerDrag: (lat: number, lng: number) => void;
}

function LocationHeader() {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-primary" />
      <label className="text-sm font-medium">Lokasi Properti</label>
    </div>
  );
}

function LocationSelects({ selectedProvinceId, setSelectedProvinceId, availableCities, control, errors, loading }: LocationSelectsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ProvinceSelect selectedProvinceId={selectedProvinceId} setSelectedProvinceId={setSelectedProvinceId} control={control} errors={errors} loading={loading} />
      <CitySelect selectedProvinceId={selectedProvinceId} availableCities={availableCities} control={control} errors={errors} loading={loading} />
    </div>
  );
}

export function PropertyFormLocation(props: Props) {
  const initialProvinceId = props.initialData?.province ? (getProvinceIdByName(props.initialData.province) ?? '') : '';
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(initialProvinceId);
  const availableCities = getCitiesByProvinceId(selectedProvinceId);
  return (
    <div className="space-y-3">
      <LocationHeader />
      <LocationSelects selectedProvinceId={selectedProvinceId} setSelectedProvinceId={setSelectedProvinceId} availableCities={availableCities} control={props.control} errors={props.errors} loading={props.loading} />
      <LocationSearch loading={props.loading} selectedProvinceId={selectedProvinceId} searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery} showSuggestions={props.showSuggestions} setShowSuggestions={props.setShowSuggestions} selectedGeo={props.selectedGeo} handleSuggestionSelect={props.handleSuggestionSelect} handleMarkerDrag={props.handleMarkerDrag} />
    </div>
  );
}
