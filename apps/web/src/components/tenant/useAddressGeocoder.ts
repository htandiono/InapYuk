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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function log(..._args: unknown[]) {
  /* no-op */
}

export function useAddressGeocoder({
  addressValue,
  selectedProvinceId,
  watchedCity,
  setValue,
  setSelectedGeo,
  lastGeocodedAddressRef,
  addDebugLog,
}: {
  addressValue: string;
  selectedProvinceId: string;
  watchedCity: string;
  setValue: UseFormSetValue<PropertyFormValues>;
  setSelectedGeo: (g: { lat: number; lng: number } | null) => void;
  lastGeocodedAddressRef: React.MutableRefObject<string>;
  addDebugLog?: (msg: string) => void;
}) {
  useEffect(() => {
    log('ADDRESS_CHANGE:', {
      addressValue,
      lastGeocodedAddressRef: lastGeocodedAddressRef.current,
    });
    if (!addressValue || addressValue === lastGeocodedAddressRef.current || addressValue.length < 5)
      return;
    const timer = setTimeout(async () => {
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name;
        logUI(`ADDRESS GEOCODER → Query: "${addressValue}"`, addDebugLog);
        const data = await autocompleteAddress(addressValue, province, watchedCity);
        logUI(`ADDRESS GEOCODER → Result: ${data?.length ?? 0} items`, addDebugLog);
        if (data && data.length > 0) {
          const first = data[0];
          setValue('latitude', first.lat);
          setValue('longitude', first.lng);
          setSelectedGeo({ lat: first.lat, lng: first.lng });
          lastGeocodedAddressRef.current = addressValue;
          logUI(
            `Map synced to lat=${first.lat.toFixed(4)}, lng=${first.lng.toFixed(4)}`,
            addDebugLog,
          );
        } else {
          logUI('No results from autocomplete', addDebugLog);
          addDebugLog?.('⚠ Address search returned no results');
        }
      } catch (err) {
        console.error('Failed to sync map to typed address', err);
        addDebugLog?.(
          `✗ Address geocode error: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressValue, selectedProvinceId, watchedCity, setValue, setSelectedGeo]);
}
