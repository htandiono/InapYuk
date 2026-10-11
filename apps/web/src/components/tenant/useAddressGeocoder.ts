'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { useEffect } from 'react';
import { geocodeWithFallback } from './geocoding-utils';
import { applyGeo, type SetGeo, type SetValue } from './geocoding-sync';

interface Params {
  addressValue: string;
  selectedProvinceId: string;
  watchedCity: string;
  setValue: SetValue;
  setSelectedGeo: SetGeo;
  lastGeocodedAddressRef: React.MutableRefObject<string>;
}

async function syncAddress(p: Params) {
  try {
    const province = PROVINCES.find((x) => x.id === p.selectedProvinceId)?.name;
    const data = await geocodeWithFallback(p.addressValue, province, p.watchedCity);
    if (!data || data.length === 0) return;
    applyGeo(p.setValue, p.setSelectedGeo, data[0]);
    p.lastGeocodedAddressRef.current = p.addressValue;
  } catch (err) {
    console.error('Failed to sync map to typed address', err);
  }
}

export function useAddressGeocoder(p: Params) {
  const { addressValue, lastGeocodedAddressRef } = p;
  useEffect(() => {
    if (!addressValue || addressValue === lastGeocodedAddressRef.current) return;
    if (addressValue.length < 5) return;
    const timer = setTimeout(() => syncAddress(p), 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressValue, p.selectedProvinceId, p.watchedCity, p.setValue, p.setSelectedGeo]);
}
