'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { useEffect, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { autocompleteAddress, reverseGeocode, findProvinceId, matchCity } from './geocoding-utils';
import { PropertyFormValues } from './property-schema';

interface Props {
  addressValue: string;
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  watchedCity: string;
  setSelectedGeo: (geo: { lat: number; lng: number } | null) => void;
  setValue: UseFormSetValue<PropertyFormValues>;
  addDebugLog?: (msg: string) => void;
}

// Module-level log helpers
function log(_msg: string, _data?: unknown) {
  // no-op — retained for future debugging
}

function logUI(msg: string, addDebugLog?: (m: string) => void) {
  try { addDebugLog?.('[GeoSync] ' + msg); } catch {}
}

export function useGeocodingEffects({
  addressValue,
  selectedProvinceId,
  setSelectedProvinceId,
  watchedCity,
  setSelectedGeo,
  setValue,
  addDebugLog,
}: Props) {
  const lastGeocodedAddressRef = useRef<string>('');
  const lastProvinceCityRef = useRef<string>('');
  const isReverseGeocodingRef = useRef(false);

  // Track province+city as a single key to detect changes
  const provinceCityKey = `${selectedProvinceId}|${watchedCity}`;

  useEffect(() => {
    if (provinceCityKey !== lastProvinceCityRef.current) {
      logUI(`State/City change: prov=${selectedProvinceId}, city=${watchedCity}`, addDebugLog);
      lastProvinceCityRef.current = provinceCityKey;
      // Clear address cache when province or city changes
      lastGeocodedAddressRef.current = '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCityKey]);

  // Geocode address when it changes
  useAddressGeocoder({
    addressValue,
    selectedProvinceId,
    watchedCity,
    setValue,
    setSelectedGeo,
    lastGeocodedAddressRef,
    addDebugLog,
  });

  // Geocode province+city independently (even without address)
  useProvinceCityGeocoder({
    selectedProvinceId,
    watchedCity,
    setValue,
    setSelectedGeo,
    lastGeocodedAddressRef,
    lastProvinceCityRef,
    isReverseGeocodingRef,
    addDebugLog,
  });

  return {
    handleMarkerDrag: (lat: number, lng: number, suggestedAddress?: string) => {
      logUI(`MAP DRAG → lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)} (suggested=${!!suggestedAddress})`, addDebugLog);
      setValue('latitude', lat);
      setValue('longitude', lng);
      setSelectedGeo({ lat, lng });

      if (suggestedAddress) {
        setValue('address', suggestedAddress, { shouldValidate: true });
        lastGeocodedAddressRef.current = suggestedAddress;
      }

      // Prevent cascade: mark that we're in reverse geocode mode
      isReverseGeocodingRef.current = true;
      logUI('Reverse geocode started — blocking other effects', addDebugLog);

      void reverseGeocode(lat, lng)
        .then(async (data) => {
          logUI(`Reverse geocode result: ${data ? JSON.stringify(data) : 'null'}`, addDebugLog);
          if (!data) {
            logUI('No reverse geocode data — map position preserved but no field updates', addDebugLog);
            addDebugLog?.('⚠ Reverse geocode returned no data');
            return;
          }

          // Only update address if no suggested address was provided
          if (!suggestedAddress) {
            setValue('address', data.formatted, { shouldValidate: true });
            lastGeocodedAddressRef.current = data.formatted;
            logUI(`Address updated: "${data.formatted}"`, addDebugLog);
          }

          if (data.province) {
            const matchedId = findProvinceId(data.province);
            logUI(`Province: "${data.province}" → matchedId=${matchedId} (current=${selectedProvinceId})`, addDebugLog);
            if (matchedId && matchedId !== selectedProvinceId) {
              setSelectedProvinceId(matchedId);
              const provinceName = PROVINCES.find((p) => p.id === matchedId)?.name;
              setValue('state', provinceName || '', { shouldValidate: true });
              logUI(`Province changed to: "${provinceName}" (id=${matchedId})`, addDebugLog);
              addDebugLog?.(`→ Province auto-detected: ${provinceName}`);
            }
            if (data.city) {
              const matchedCity = matchCity(selectedProvinceId, data.city);
              logUI(`City: "${data.city}" → matchedCity=${matchedCity} (current=${watchedCity})`, addDebugLog);
              if (matchedCity && matchedCity !== watchedCity) {
                setValue('city', matchedCity, { shouldValidate: true });
                logUI(`City changed to: "${matchedCity}"`, addDebugLog);
                addDebugLog?.(`→ City auto-detected: ${matchedCity}`);
              }
            }
          }
        })
        .catch((err) => {
          logUI(`Reverse geocode ERROR: ${err instanceof Error ? err.message : String(err)}`, addDebugLog);
          addDebugLog?.(`✗ Reverse geocode failed: ${err instanceof Error ? err.message : String(err)}`);
        })
        .finally(() => {
          // Reset after a tick to allow the cascade to complete
          setTimeout(() => {
            isReverseGeocodingRef.current = false;
            logUI('Reverse geocode done — effects unblocked', addDebugLog);
          }, 100);
        });
    },
    lastGeocodedAddressRef,
  };
}

// Geocodes when the typed address changes
function useAddressGeocoder({
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
      length: addressValue.length,
    });
    if (!addressValue || addressValue === lastGeocodedAddressRef.current || addressValue.length < 5)
      return;
    const timer = setTimeout(async () => {
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name;
        logUI(`ADDRESS GEOCODER → Query: "${addressValue}" (prov=${selectedProvinceId}, city=${watchedCity})`, addDebugLog);
        const data = await autocompleteAddress(addressValue, province, watchedCity);
        logUI(`ADDRESS GEOCODER → Result: ${data?.length ?? 0} items`, addDebugLog);
        if (data && data.length > 0) {
          const first = data[0];
          setValue('latitude', first.lat);
          setValue('longitude', first.lng);
          setSelectedGeo({ lat: first.lat, lng: first.lng });
          lastGeocodedAddressRef.current = addressValue;
          logUI(`Map synced to lat=${first.lat.toFixed(4)}, lng=${first.lng.toFixed(4)}`, addDebugLog);
        } else {
          logUI('No results from autocomplete — check query or API key', addDebugLog);
          addDebugLog?.('⚠ Address search returned no results');
        }
      } catch (err) {
        console.error('Failed to sync map to typed address', err);
        logUI(`ERROR: ${err instanceof Error ? err.message : String(err)}`, addDebugLog);
        addDebugLog?.(`✗ Address geocode error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [addressValue, selectedProvinceId, watchedCity, setValue, setSelectedGeo]);
}

// Geocodes when province or city dropdown changes — independent of address
function useProvinceCityGeocoder({
  selectedProvinceId,
  watchedCity,
  setValue,
  setSelectedGeo,
  lastGeocodedAddressRef,
  lastProvinceCityRef,
  isReverseGeocodingRef,
  addDebugLog,
}: {
  selectedProvinceId: string;
  watchedCity: string;
  setValue: UseFormSetValue<PropertyFormValues>;
  setSelectedGeo: (g: { lat: number; lng: number } | null) => void;
  lastGeocodedAddressRef: React.MutableRefObject<string>;
  lastProvinceCityRef: React.MutableRefObject<string>;
  isReverseGeocodingRef: React.MutableRefObject<boolean>;
  addDebugLog?: (msg: string) => void;
}) {
  useEffect(() => {
    // Skip if we're currently in reverse geocode mode (map drag)
    if (isReverseGeocodingRef.current) {
      logUI('PROV/CITY: BLOCKED by reverse geocode in progress', addDebugLog);
      return;
    }

    const provinceCityKey = `${selectedProvinceId}|${watchedCity}`;
    if (provinceCityKey === lastProvinceCityRef.current) {
      logUI('PROV/CITY: no change detected, skipping', addDebugLog);
      return;
    }
    lastProvinceCityRef.current = provinceCityKey;
    logUI(`PROV/CITY EFFECT triggered: prov=${selectedProvinceId}, city=${watchedCity}`, addDebugLog);

    const timer = setTimeout(async () => {
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name;
        // Build query from province + city, even if address is empty
        const query = watchedCity
          ? `${watchedCity}, ${province}, Indonesia`
          : `${province}, Indonesia`;
        logUI(`PROV/CITY GEOCODER → Query: "${query}"`, addDebugLog);
        const data = await autocompleteAddress(query, province, watchedCity);
        logUI(`PROV/CITY GEOCODER → Result: ${data?.length ?? 0} items`, addDebugLog);
        if (data && data.length > 0) {
          const first = data[0];
          setValue('latitude', first.lat);
          setValue('longitude', first.lng);
          setSelectedGeo({ lat: first.lat, lng: first.lng });
          logUI(`Map synced to lat=${first.lat.toFixed(4)}, lng=${first.lng.toFixed(4)}`, addDebugLog);
          // Only update address if we haven't already geocoded one
          if (!lastGeocodedAddressRef.current) {
            const formatted = `${watchedCity || province}, ${province}, Indonesia`;
            setValue('address', formatted, { shouldValidate: true });
            lastGeocodedAddressRef.current = formatted;
            logUI(`Set address: "${formatted}"`, addDebugLog);
          } else {
            logUI('Address already geocoded, skipping', addDebugLog);
          }
        } else {
          logUI('No results from autocomplete — check API key or network', addDebugLog);
          addDebugLog?.('⚠ Geocoding returned no results');
        }
      } catch (err) {
        console.error('Failed to geocode province/city change', err);
        logUI(`ERROR: ${err instanceof Error ? err.message : String(err)}`, addDebugLog);
        addDebugLog?.(`✗ ${err instanceof Error ? err.message : String(err)}`);
      }
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceId, watchedCity, setValue, setSelectedGeo]);
}
