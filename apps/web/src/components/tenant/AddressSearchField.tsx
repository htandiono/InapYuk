'use client';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Search } from 'lucide-react';

interface Props {
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  suggestions: { formatted: string; lat: number; lng: number }[];
  isSearching: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onSuggestionSelect: (s: { formatted: string; lat: number; lng: number }) => void;
}

export function AddressSearchField({
  loading,
  searchQuery,
  setSearchQuery,
  suggestions,
  isSearching,
  showSuggestions,
  setShowSuggestions,
  onSuggestionSelect,
}: Props) {
  return (
    <div className="relative z-10 pt-2">
      <SearchLabel />
      <SearchInput
        value={searchQuery}
        onQueryChange={setSearchQuery}
        onFocus={
          showSuggestions && suggestions.length > 0 ? () => setShowSuggestions(true) : undefined
        }
        isSearching={isSearching}
        disabled={loading}
        onQueryChangeCombined={(q) => {
          setSearchQuery(q);
          if (q.length < 3) setShowSuggestions(false);
        }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionList
          suggestions={suggestions}
          onSelect={onSuggestionSelect}
          onClickOutside={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}

function SearchLabel() {
  return (
    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
      Cari Alamat Cepat{' '}
      <span className="normal-case font-normal text-muted-foreground/60">(Opsional)</span>
    </label>
  );
}

function SearchInput({
  value,
  onQueryChange,
  onFocus,
  isSearching,
  disabled,
  onQueryChangeCombined,
}: {
  value: string;
  onQueryChange: (q: string) => void;
  onFocus?: () => void;
  isSearching: boolean;
  disabled: boolean;
  onQueryChangeCombined: (q: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onQueryChangeCombined(e.target.value)}
        onFocus={onFocus}
        disabled={disabled}
        placeholder="Ketik nama jalan atau gedung untuk mencari..."
        className="pl-9 pr-9 bg-muted/20"
      />
      {isSearching && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      )}
    </div>
  );
}

function SuggestionList({
  suggestions,
  onSelect,
  onClickOutside,
}: {
  suggestions: { formatted: string; lat: number; lng: number }[];
  onSelect: (s: { formatted: string; lat: number; lng: number }) => void;
  onClickOutside: () => void;
}) {
  return (
    <>
      <ul className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto bg-background border border-border rounded-md shadow-lg z-50">
        {suggestions.map((s, i) => (
          <li
            key={i}
            className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
            onClick={() => onSelect(s)}
          >
            <MapPin className="inline-block h-3.5 w-3.5 mr-2 text-primary" />
            {s.formatted}
          </li>
        ))}
      </ul>
      <div className="fixed inset-0 z-40" onClick={onClickOutside} />
    </>
  );
}
