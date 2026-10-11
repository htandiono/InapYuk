'use client';

import { getCitiesByProvinceId } from '@/data/indonesia-regions';
import { MapPin } from 'lucide-react';
import { Control, FieldErrors, useWatch } from 'react-hook-form';
import type { PropertyFormValues } from './property-schema';
import { LocationSearch } from './PropertyFormLocationSearch';
import { ProvinceSelect } from './PropertyFormLocationProvince';
import { CitySelect } from './PropertyFormLocationCity';
import { StreetAddressField } from './StreetAddressField';

interface LocationSelectsProps {
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  availableCities: string[];
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
}

interface Props {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
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

function LocationSelects(p: LocationSelectsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ProvinceSelect {...p} />
      <CitySelect {...p} />
    </div>
  );
}

export function PropertyFormLocation(p: Props) {
  const availableCities = getCitiesByProvinceId(p.selectedProvinceId);
  const addressValue = useWatch({ control: p.control, name: 'address' }) || '';
  return (
    <div className="space-y-3">
      <LocationHeader />
      <LocationSelects {...p} availableCities={availableCities} />
      <LocationSearch {...p} />
      <StreetAddressField {...p} addressValue={addressValue} />
    </div>
  );
}
