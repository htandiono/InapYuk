'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { useEffect, useRef } from 'react';
import { reverseGeocode, findProvinceId, matchCity } from './geocoding-utils';
import type { SetGeo, SetValue } from './geocoding-sync';
import { useAddressGeocoder } from './useAddressGeocoder';
import { useProvinceCityGeocoder } from './useProvinceCityGeocoder';

interface Props {
  addressValue: string;
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  watchedCity: string;
  setSelectedGeo: SetGeo;
  setValue: SetValue;
  /** Address that already has a saved pin, so it is not geocoded again on mount. */
  initialAddress?: string;
}

type Refs = ReturnType<typeof useGeoRefs>;
type Region = { formatted: string; province?: string; city?: string };

function useGeoRefs(key: string, initialAddress?: string) {
  const lastGeocodedAddressRef = useRef<string>(initialAddress ?? '');
  // Starts at the mounted key so opening a form does not count as a province/city change.
  const lastProvinceCityRef = useRef<string>(key);
  const isReverseGeocodingRef = useRef(false);
  return { lastGeocodedAddressRef, lastProvinceCityRef, isReverseGeocodingRef };
}

function useAddressReset(key: string, refs: Refs) {
  const { lastProvinceCityRef, lastGeocodedAddressRef } = refs;
  useEffect(() => {
    // Only the address is re-geocoded here; useProvinceCityGeocoder owns lastProvinceCityRef.
    if (key !== lastProvinceCityRef.current) lastGeocodedAddressRef.current = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

function applyRegion(data: Region, p: Props) {
  if (!data.province) return;
  const id = findProvinceId(data.province);
  if (id && id !== p.selectedProvinceId) {
    p.setSelectedProvinceId(id);
    p.setValue('state', PROVINCES.find((x) => x.id === id)?.name || '', { shouldValidate: true });
  }
  const city = data.city ? matchCity(p.selectedProvinceId, data.city) : undefined;
  if (city && city !== p.watchedCity) p.setValue('city', city, { shouldValidate: true });
}

async function fillFromPoint(
  lat: number,
  lng: number,
  suggested: string | undefined,
  p: Props,
  refs: Refs,
) {
  const data = await reverseGeocode(lat, lng);
  if (!data) return;
  if (!suggested) {
    p.setValue('address', data.formatted, { shouldValidate: true });
    refs.lastGeocodedAddressRef.current = data.formatted;
  }
  applyRegion(data, p);
}

function useMarkerDrag(p: Props, refs: Refs) {
  return (lat: number, lng: number, suggested?: string) => {
    p.setValue('latitude', lat);
    p.setValue('longitude', lng);
    p.setSelectedGeo({ lat, lng });
    if (suggested) p.setValue('address', suggested, { shouldValidate: true });
    if (suggested) refs.lastGeocodedAddressRef.current = suggested;
    refs.isReverseGeocodingRef.current = true;
    void fillFromPoint(lat, lng, suggested, p, refs).finally(() => {
      setTimeout(() => (refs.isReverseGeocodingRef.current = false), 100);
    });
  };
}

export function useGeocodingEffects(p: Props) {
  const key = `${p.selectedProvinceId}|${p.watchedCity}`;
  const refs = useGeoRefs(key, p.initialAddress);
  useAddressReset(key, refs);
  useAddressGeocoder({ ...p, ...refs });
  useProvinceCityGeocoder({ ...p, ...refs });
  const handleMarkerDrag = useMarkerDrag(p, refs);
  return { handleMarkerDrag, lastGeocodedAddressRef: refs.lastGeocodedAddressRef };
}
