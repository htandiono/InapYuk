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
}

export function useGeocodingEffects({
  addressValue,
  selectedProvinceId,
  setSelectedProvinceId,
  watchedCity,
  setSelectedGeo,
  setValue,
}: Props) {
  const lastGeocodedAddressRef = useRef<string>('');
  const lastProvinceIdRef = useRef<string>('');
  const lastCityRef = useRef<string>('');

  // On mount / init: sync map from initial data if lat/lng are available
  useEffect(() => {
    if (selectedProvinceId && !lastProvinceIdRef.current) {
      lastProvinceIdRef.current = selectedProvinceId;
      lastCityRef.current = watchedCity;
      if (addressValue && addressValue.length >= 5) {
        lastGeocodedAddressRef.current = addressValue;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reverse-geocode when address changes (typing or programmatic)
  useAddressGeocoder({
    addressValue,
    selectedProvinceId,
    watchedCity,
    setValue,
    setSelectedGeo,
    lastGeocodedAddressRef,
  });

  // Sync province + city from selectedProvinceId / watchedCity when they change
  useProvinceCityGeocoder({
    selectedProvinceId,
    watchedCity,
    addressValue,
    setValue,
    setSelectedGeo,
    lastGeocodedAddressRef,
    lastProvinceIdRef,
    lastCityRef,
    setSelectedProvinceId,
  });

  return {
    handleMarkerDrag: (lat: number, lng: number, suggestedAddress?: string) => {
      setValue('latitude', lat);
      setValue('longitude', lng);
      setSelectedGeo({ lat, lng });

      if (suggestedAddress) {
        setValue('address', suggestedAddress, { shouldValidate: true });
        lastGeocodedAddressRef.current = suggestedAddress;
      }

      void reverseGeocode(lat, lng)
        .then(async (data) => {
          if (!data) return;
          if (!suggestedAddress) {
            setValue('address', data.formatted, { shouldValidate: true });
            lastGeocodedAddressRef.current = data.formatted;
          }
          if (data.province) {
            const matchedId = findProvinceId(data.province);
            if (matchedId) {
              setSelectedProvinceId(matchedId);
              const provinceName = PROVINCES.find((p) => p.id === matchedId)?.name;
              setValue('state', provinceName || '', { shouldValidate: true });
              if (data.city) {
                const matchedCity = matchCity(matchedId, data.city);
                if (matchedCity) setValue('city', matchedCity, { shouldValidate: true });
              }
            }
          }
        })
        .catch(console.error);
    },
    lastGeocodedAddressRef,
  };
}

// Reverse-geocodes addressValue → updates lat/lng + geo on the map
function useAddressGeocoder({
  addressValue,
  selectedProvinceId,
  watchedCity,
  setValue,
  setSelectedGeo,
  lastGeocodedAddressRef,
}: {
  addressValue: string;
  selectedProvinceId: string;
  watchedCity: string;
  setValue: UseFormSetValue<PropertyFormValues>;
  setSelectedGeo: (g: { lat: number; lng: number } | null) => void;
  lastGeocodedAddressRef: React.MutableRefObject<string>;
}) {
  useEffect(() => {
    if (!addressValue || addressValue === lastGeocodedAddressRef.current || addressValue.length < 5)
      return;
    const timer = setTimeout(async () => {
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name;
        const data = await autocompleteAddress(addressValue, province, watchedCity);
        if (data && data.length > 0) {
          const first = data[0];
          setValue('latitude', first.lat);
          setValue('longitude', first.lng);
          setSelectedGeo({ lat: first.lat, lng: first.lng });
          lastGeocodedAddressRef.current = addressValue;
        }
      } catch (err) {
        console.error('Failed to sync map to typed address', err);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [addressValue, selectedProvinceId, watchedCity, setValue, setSelectedGeo]);
}

// Syncs the map when province or city is changed via dropdown
// Derives approximate center from province + city and updates the pin
function useProvinceCityGeocoder({
  selectedProvinceId,
  watchedCity,
  addressValue,
  setValue,
  setSelectedGeo,
  lastGeocodedAddressRef,
  lastProvinceIdRef,
  lastCityRef,
  setSelectedProvinceId,
}: {
  selectedProvinceId: string;
  watchedCity: string;
  addressValue: string;
  setValue: UseFormSetValue<PropertyFormValues>;
  setSelectedGeo: (g: { lat: number; lng: number } | null) => void;
  lastGeocodedAddressRef: React.MutableRefObject<string>;
  lastProvinceIdRef: React.MutableRefObject<string>;
  lastCityRef: React.MutableRefObject<string>;
  setSelectedProvinceId: (id: string) => void;
}) {
  useEffect(() => {
    const provChanged = selectedProvinceId !== lastProvinceIdRef.current;
    const cityChanged = watchedCity !== lastCityRef.current;
    if (!provChanged && !cityChanged) return;

    lastProvinceIdRef.current = selectedProvinceId;
    lastCityRef.current = watchedCity;

    // If address was previously geocoded, keep it — don't override
    if (!addressValue || addressValue.length < 5) return;

    const timer = setTimeout(async () => {
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name;
        const query = watchedCity
          ? `${watchedCity}, ${province}, Indonesia`
          : `${province}, Indonesia`;
        const data = await autocompleteAddress(query, province, watchedCity);
        if (data && data.length > 0) {
          const first = data[0];
          setValue('latitude', first.lat);
          setValue('longitude', first.lng);
          setSelectedGeo({ lat: first.lat, lng: first.lng });
          // Update address to match the province/city context
          const formatted = `${watchedCity || province}, ${province}, Indonesia`;
          setValue('address', formatted, { shouldValidate: true });
          lastGeocodedAddressRef.current = formatted;
        }
      } catch (err) {
        console.error('Failed to geocode province/city change', err);
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceId, watchedCity, addressValue, setValue, setSelectedGeo]);
}
