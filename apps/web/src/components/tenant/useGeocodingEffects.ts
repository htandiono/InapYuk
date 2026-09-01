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

  useAddressGeocoder({
    addressValue,
    selectedProvinceId,
    watchedCity,
    setValue,
    setSelectedGeo,
    lastGeocodedAddressRef,
  });

  return {
    handleMarkerDrag: (lat: number, lng: number, suggestedAddress?: string) => {
      setValue('latitude', lat);
      setValue('longitude', lng);
      setSelectedGeo({ lat, lng });
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
