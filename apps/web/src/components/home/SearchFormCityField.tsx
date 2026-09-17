interface City {
  city: string;
  province: string;
}

export function CityDropdownItem({ c, onSelect }: { c: City; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground/70"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <div>
        <span className="font-semibold">{c.city}</span>
        <span className="text-muted-foreground text-xs ml-1">, {c.province}</span>
      </div>
    </button>
  );
}

export function CityDropdown({
  isOpen,
  filtered,
  onSelect,
}: {
  isOpen: boolean;
  filtered: City[];
  onSelect: (city: string) => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border bg-background/95 backdrop-blur-xl shadow-xl z-50 p-1.5">
      {filtered.length === 0 ? (
        <div className="p-3 text-sm text-muted-foreground text-center">Kota tidak ditemukan</div>
      ) : (
        filtered.map((c, i) => <CityDropdownItem key={i} c={c} onSelect={() => onSelect(c.city)} />)
      )}
    </div>
  );
}

export function CityInput({
  term,
  setTerm,
  setCity,
  setIsOpen,
  loading,
  isOpen,
  filtered,
}: {
  term: string;
  setTerm: (v: string) => void;
  setCity: (v: string) => void;
  setIsOpen: (v: boolean) => void;
  loading: boolean;
  isOpen: boolean;
  filtered: City[];
}) {
  return (
    <div className="flex-1 w-full relative">
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
        Kota
      </label>
      <div className="relative">
        <input
          required
          placeholder={loading ? 'Memuat...' : 'Ketik kota'}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setCity(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full rounded-lg bg-muted/30 px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary outline-none"
        />
        <CityDropdown
          isOpen={isOpen}
          filtered={filtered}
          onSelect={(c: string) => {
            setCity(c);
            setTerm(c);
            setIsOpen(false);
          }}
        />
      </div>
    </div>
  );
}
