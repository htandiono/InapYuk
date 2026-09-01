'use client';
import { getCitiesByProvinceId } from '@/data/indonesia-regions';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { PropertyFormValues } from './property-schema';
import { ProvinceField } from './ProvinceField';
import { CityField } from './CityField';
import { AddressSearchField } from './AddressSearchField';
import { StreetAddressField } from './StreetAddressField';

const PropertyMap = dynamic(() => import('../properties/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-32 w-full rounded-lg bg-muted animate-pulse" />,
});

interface Props {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  addressValue: string;
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  selectedGeo: { lat: number; lng: number } | null;
  setSelectedGeo: (geo: { lat: number; lng: number } | null) => void;
  setValue: UseFormSetValue<PropertyFormValues>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  suggestions: { formatted: string; lat: number; lng: number }[];
  isSearching: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onSuggestionSelect: (s: { formatted: string; lat: number; lng: number }) => void;
  onMarkerDrag: (lat: number, lng: number, address?: string) => void;
}

interface ProvinceProps {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  setValue: UseFormSetValue<PropertyFormValues>;
}

interface CityProps {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  selectedProvinceId: string;
  availableCities: string[];
  setSelectedGeo: (geo: { lat: number; lng: number } | null) => void;
  setValue: UseFormSetValue<PropertyFormValues>;
}

export function PropertyLocationFields({
  control,
  errors,
  loading,
  addressValue,
  selectedProvinceId,
  setSelectedProvinceId,
  selectedGeo,
  setSelectedGeo,
  setValue,
  searchQuery,
  setSearchQuery,
  suggestions,
  isSearching,
  showSuggestions,
  setShowSuggestions,
  onSuggestionSelect,
  onMarkerDrag,
}: Props) {
  const availableCities = getCitiesByProvinceId(selectedProvinceId);
  return (
    <div className="space-y-3">
      <LocationHeader />
      <ProvinceCityRow
        provinceProps={{
          control,
          errors,
          loading,
          selectedProvinceId,
          setSelectedProvinceId,
          setValue,
        }}
        cityProps={{
          control,
          errors,
          loading,
          selectedProvinceId,
          availableCities,
          setSelectedGeo,
          setValue,
        }}
      />
      <AddressSearchField
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        suggestions={suggestions}
        isSearching={isSearching}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        onSuggestionSelect={onSuggestionSelect}
      />
      <StreetAddressField
        control={control}
        errors={errors}
        loading={loading}
        addressValue={addressValue}
      />
      <LocationMap selectedGeo={selectedGeo} onMarkerDrag={onMarkerDrag} />
    </div>
  );
}

function LocationHeader() {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-primary" />
      <label className="text-sm font-medium">Lokasi Properti</label>
    </div>
  );
}

function ProvinceCityRow({
  provinceProps,
  cityProps,
}: {
  provinceProps: ProvinceProps;
  cityProps: CityProps;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ProvinceField {...provinceProps} />
      <CityField {...cityProps} />
    </div>
  );
}

function LocationMap({
  selectedGeo,
  onMarkerDrag,
}: {
  selectedGeo: { lat: number; lng: number } | null;
  onMarkerDrag: (lat: number, lng: number, address?: string) => void;
}) {
  return (
    <div className="mt-3">
      <MapSectionLabel />
      <div className="space-y-3 pt-4 border-t border-border">
        <PropertyMap
          lat={selectedGeo?.lat ?? -6.2088}
          lng={selectedGeo?.lng ?? 106.8456}
          name={selectedGeo ? 'Lokasi Pilihan' : 'Geser pin ke lokasi Anda'}
          draggable
          onLocationChange={(lat, lng) => onMarkerDrag(lat, lng)}
        />
      </div>
    </div>
  );
}

function MapSectionLabel() {
  return (
    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
      Peta Lokasi
    </label>
  );
}
