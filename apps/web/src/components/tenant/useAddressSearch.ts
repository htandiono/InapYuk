'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { useEffect, useState } from 'react';
import { autocompleteAddress } from './geocoding-utils';

interface Props {
  selectedProvinceId: string;
  watchedCity: string;
}

export function useAddressSearch({ selectedProvinceId, watchedCity }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ formatted: string; lat: number; lng: number }[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useDebounceSearch({
    searchQuery,
    setSuggestions,
    setShowSuggestions,
    setIsSearching,
    selectedProvinceId,
    watchedCity,
  });

  return {
    searchQuery,
    setSearchQuery,
    suggestions,
    setSuggestions,
    isSearching,
    showSuggestions,
    setShowSuggestions,
  };
}

function useDebounceSearch({
  searchQuery,
  setSuggestions,
  setShowSuggestions,
  setIsSearching,
  selectedProvinceId,
  watchedCity,
}: {
  searchQuery: string;
  setSuggestions: React.Dispatch<
    React.SetStateAction<{ formatted: string; lat: number; lng: number }[]>
  >;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProvinceId: string;
  watchedCity: string;
}) {
  useEffect(() => {
    if (searchQuery.length < 3) return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name || '';
        const data = await autocompleteAddress(searchQuery, province, watchedCity);
        if (data) {
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Failed to search address', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedProvinceId, watchedCity]);
}
