'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { useEffect } from 'react';
import { autocompleteAddress } from './geocoding-utils';
import { applyGeo, type SetGeo, type SetValue } from './geocoding-sync';

interface Params {
  selectedProvinceId: string;
  watchedCity: string;
  setValue: SetValue;
  setSelectedGeo: SetGeo;
  lastProvinceCityRef: React.MutableRefObject<string>;
  isReverseGeocodingRef: React.MutableRefObject<boolean>;
}

async function syncPlace(p: Params) {
  try {
    const province = PROVINCES.find((x) => x.id === p.selectedProvinceId)?.name;
    // The API appends city, province and "Indonesia" itself, so send only the place name.
    const query = p.watchedCity || province || '';
    const data = await autocompleteAddress(query, p.watchedCity ? province : undefined);
    if (data && data.length > 0) applyGeo(p.setValue, p.setSelectedGeo, data[0]);
  } catch (err) {
    console.error('Failed to geocode province/city change', err);
  }
}

export function useProvinceCityGeocoder(p: Params) {
  const { lastProvinceCityRef, isReverseGeocodingRef } = p;
  const key = `${p.selectedProvinceId}|${p.watchedCity}`;
  useEffect(() => {
    if (key === lastProvinceCityRef.current) return;
    lastProvinceCityRef.current = key;
    if (isReverseGeocodingRef.current) return;
    const timer = setTimeout(() => syncPlace(p), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, p.setValue, p.setSelectedGeo]);
}
