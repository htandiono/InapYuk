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
  const lastProvinceCityRef = useRef<string>('');
  const isReverseGeocodingRef = useRef(false);

  // Track province+city as a single key to detect changes
  const provinceCityKey = `${selectedProvinceId}|${watchedCity}`;

  useEffect(() => {
    if (provinceCityKey !== lastProvinceCityRef.current) {
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

      // Prevent cascade: mark that we're in reverse geocode mode
      isReverseGeocodingRef.current = true;

      void reverseGeocode(lat, lng)
        .then(async (data) => {
          if (!data) return;

          // Only update address if no suggested address was provided
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
        .catch(console.error)
        .finally(() => {
          // Reset after a tick to allow the cascade to complete
          setTimeout(() => {
            isReverseGeocodingRef.current = false;
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

// Geocodes when province or city dropdown changes — independent of address
function useProvinceCityGeocoder({
  selectedProvinceId,
  watchedCity,
  setValue,
  setSelectedGeo,
  lastGeocodedAddressRef,
  lastProvinceCityRef,
  isReverseGeocodingRef,
}: {
  selectedProvinceId: string;
  watchedCity: string;
  setValue: UseFormSetValue<PropertyFormValues>;
  setSelectedGeo: (g: { lat: number; lng: number } | null) => void;
  lastGeocodedAddressRef: React.MutableRefObject<string>;
  lastProvinceCityRef: React.MutableRefObject<string>;
  isReverseGeocodingRef: React.MutableRefObject<boolean>;
}) {
  useEffect(() => {
    // Skip if we're currently in reverse geocode mode (map drag)
    if (isReverseGeocodingRef.current) return;

    const provinceCityKey = `${selectedProvinceId}|${watchedCity}`;
    if (provinceCityKey === lastProvinceCityRef.current) return;
    lastProvinceCityRef.current = provinceCityKey;

    const timer = setTimeout(async () => {
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name;
        // Build query from province + city, even if address is empty
        const query = watchedCity
          ? `${watchedCity}, ${province}, Indonesia`
          : `${province}, Indonesia`;
        const data = await autocompleteAddress(query, province, watchedCity);
        if (data && data.length > 0) {
          const first = data[0];
          setValue('latitude', first.lat);
          setValue('longitude', first.lng);
          setSelectedGeo({ lat: first.lat, lng: first.lng });
          // Only update address if we haven't already geocoded one
          if (!lastGeocodedAddressRef.current) {
            const formatted = `${watchedCity || province}, ${province}, Indonesia`;
            setValue('address', formatted, { shouldValidate: true });
            lastGeocodedAddressRef.current = formatted;
          }
        }
      } catch (err) {
        console.error('Failed to geocode province/city change', err);
      }
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceId, watchedCity, setValue, setSelectedGeo]);
}
