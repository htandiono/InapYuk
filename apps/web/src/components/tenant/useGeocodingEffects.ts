'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { useEffect, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { reverseGeocode, findProvinceId, matchCity } from './geocoding-utils';
import { PropertyFormValues } from './property-schema';
import { useAddressGeocoder } from './useAddressGeocoder';
import { useProvinceCityGeocoder } from './useProvinceCityGeocoder';

interface Props {
  addressValue: string;
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  watchedCity: string;
  setSelectedGeo: (geo: { lat: number; lng: number } | null) => void;
  setValue: UseFormSetValue<PropertyFormValues>;
  addDebugLog?: (msg: string) => void;
  /** Address that already has a saved pin, so it is not geocoded again on mount. */
  initialAddress?: string;
}

function logUI(msg: string, addDebugLog?: (m: string) => void) {
  try {
    addDebugLog?.('[GeoSync] ' + msg);
  } catch {}
}

export function useGeocodingEffects({
  addressValue,
  selectedProvinceId,
  setSelectedProvinceId,
  watchedCity,
  setSelectedGeo,
  setValue,
  addDebugLog,
  initialAddress,
}: Props) {
  const provinceCityKey = `${selectedProvinceId}|${watchedCity}`;
  const lastGeocodedAddressRef = useRef<string>(initialAddress ?? '');
  // Starts at the mounted key so opening a form does not count as a province/city change.
  const lastProvinceCityRef = useRef<string>(provinceCityKey);
  const isReverseGeocodingRef = useRef(false);

  useEffect(() => {
    if (provinceCityKey !== lastProvinceCityRef.current) {
      logUI(`State/City change: prov=${selectedProvinceId}, city=${watchedCity}`, addDebugLog);
      // Only the address is re-geocoded here; useProvinceCityGeocoder owns lastProvinceCityRef.
      lastGeocodedAddressRef.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCityKey]);

  useAddressGeocoder({
    addressValue,
    selectedProvinceId,
    watchedCity,
    setValue,
    setSelectedGeo,
    lastGeocodedAddressRef,
    addDebugLog,
  });

  useProvinceCityGeocoder({
    selectedProvinceId,
    watchedCity,
    setValue,
    setSelectedGeo,
    lastProvinceCityRef,
    isReverseGeocodingRef,
    addDebugLog,
  });

  return {
    handleMarkerDrag: (lat: number, lng: number, suggestedAddress?: string) => {
      logUI(`MAP DRAG → lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)}`, addDebugLog);
      setValue('latitude', lat);
      setValue('longitude', lng);
      setSelectedGeo({ lat, lng });
      if (suggestedAddress) {
        setValue('address', suggestedAddress, { shouldValidate: true });
        lastGeocodedAddressRef.current = suggestedAddress;
      }
      isReverseGeocodingRef.current = true;
      void reverseGeocode(lat, lng)
        .then(async (data) => {
          if (!data) return;
          if (!suggestedAddress) {
            setValue('address', data.formatted, { shouldValidate: true });
            lastGeocodedAddressRef.current = data.formatted;
          }
          if (data.province) {
            const matchedId = findProvinceId(data.province);
            if (matchedId && matchedId !== selectedProvinceId) {
              setSelectedProvinceId(matchedId);
              const provinceName = PROVINCES.find((p) => p.id === matchedId)?.name;
              setValue('state', provinceName || '', { shouldValidate: true });
            }
            if (data.city) {
              const matchedCity = matchCity(selectedProvinceId, data.city);
              if (matchedCity && matchedCity !== watchedCity) {
                setValue('city', matchedCity, { shouldValidate: true });
              }
            }
          }
        })
        .catch((err) => {
          logUI(
            `Reverse geocode ERROR: ${err instanceof Error ? err.message : String(err)}`,
            addDebugLog,
          );
        })
        .finally(() => {
          setTimeout(() => {
            isReverseGeocodingRef.current = false;
          }, 100);
        });
    },
    lastGeocodedAddressRef,
  };
}
