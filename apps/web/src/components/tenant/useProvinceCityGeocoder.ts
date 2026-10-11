'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { autocompleteAddress } from './geocoding-utils';
import { PropertyFormValues } from './property-schema';

function logUI(msg: string, addDebugLog?: (m: string) => void) {
  try {
    addDebugLog?.('[GeoSync] ' + msg);
  } catch {}
}

export function useProvinceCityGeocoder({
  selectedProvinceId,
  watchedCity,
  setValue,
  setSelectedGeo,
  lastProvinceCityRef,
  isReverseGeocodingRef,
  addDebugLog,
}: {
  selectedProvinceId: string;
  watchedCity: string;
  setValue: UseFormSetValue<PropertyFormValues>;
  setSelectedGeo: (g: { lat: number; lng: number } | null) => void;
  lastProvinceCityRef: React.MutableRefObject<string>;
  isReverseGeocodingRef: React.MutableRefObject<boolean>;
  addDebugLog?: (msg: string) => void;
}) {
  useEffect(() => {
    const provinceCityKey = `${selectedProvinceId}|${watchedCity}`;
    if (provinceCityKey === lastProvinceCityRef.current) {
      logUI('PROV/CITY: no change detected, skipping', addDebugLog);
      return;
    }
    lastProvinceCityRef.current = provinceCityKey;
    if (isReverseGeocodingRef.current) {
      logUI('PROV/CITY: BLOCKED by reverse geocode in progress', addDebugLog);
      return;
    }
    logUI(
      `PROV/CITY EFFECT triggered: prov=${selectedProvinceId}, city=${watchedCity}`,
      addDebugLog,
    );

    const timer = setTimeout(async () => {
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name;
        // The API appends city, province and "Indonesia" to the query itself, so send only
        // the place name; repeating them makes Nominatim return nothing.
        const query = watchedCity || province || '';
        logUI(`PROV/CITY GEOCODER → Query: "${query}"`, addDebugLog);
        const data = await autocompleteAddress(query, watchedCity ? province : undefined);
        logUI(`PROV/CITY GEOCODER → Result: ${data?.length ?? 0} items`, addDebugLog);
        if (data && data.length > 0) {
          const first = data[0];
          setValue('latitude', first.lat);
          setValue('longitude', first.lng);
          setSelectedGeo({ lat: first.lat, lng: first.lng });
          logUI(
            `Map synced to lat=${first.lat.toFixed(4)}, lng=${first.lng.toFixed(4)}`,
            addDebugLog,
          );
        } else {
          logUI('No results from autocomplete', addDebugLog);
          addDebugLog?.('⚠ Geocoding returned no results');
        }
      } catch (err) {
        console.error('Failed to geocode province/city change', err);
        addDebugLog?.(`✗ ${err instanceof Error ? err.message : String(err)}`);
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceId, watchedCity, setValue, setSelectedGeo]);
}
