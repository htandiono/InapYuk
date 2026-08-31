'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PROVINCES, getCitiesByProvinceId, getProvinceIdByName } from '@/data/indonesia-regions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MapPin, Plus, Search, Star, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const PropertyMap = dynamic(() => import('../properties/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-32 w-full rounded-lg bg-muted animate-pulse" />,
});

export type PropertyFormInitData = {
  id?: string;
  name?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number | null;
  longitude?: number | null;
  images?: { id: string; url: string }[];
};

const propertySchema = z.object({
  name: z
    .string()
    .min(3, 'Nama properti harus terdiri dari minimal 3 karakter.')
    .max(100, 'Nama properti tidak boleh lebih dari 100 karakter.')
    .regex(
      /^[a-zA-Z0-9\s.,&'-]+$/,
      'Nama properti hanya boleh mengandung huruf, angka, spasi, koma, titik, ampersand (&), dan tanda hubung (-).',
    ),
  categoryId: z.string().min(1, 'Silakan pilih kategori properti terlebih dahulu.'),
  description: z
    .string()
    .min(10, 'Deskripsi properti harus terdiri dari minimal 10 karakter.')
    .max(1000, 'Deskripsi properti tidak boleh lebih dari 1000 karakter.'),
  city: z.string().min(1, 'Kota / Kabupaten harus dipilih.'),
  state: z.string().min(1, 'Provinsi harus dipilih.'),
  address: z
    .string()
    .min(5, 'Alamat lengkap harus terdiri dari minimal 5 karakter.')
    .max(150, 'Alamat lengkap tidak boleh lebih dari 150 karakter.'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

type Category = { id: string; name: string };

function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetch('/api/categories/tenant/categories?limit=100')
      .then((res) => res.json())
      .then((json) => setCategories(json.data?.items || json.data || []))
      .catch(() => toast.error('Gagal memuat kategori'));
  }, []);
  return categories;
}

export default function PropertyForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: PropertyFormInitData;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const categories = useCategories();
  const [files, setFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(
    initialData?.images?.[0]?.id || null,
  );
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Cascading dropdowns state — resolve initial province id from name
  const initialProvinceId = initialData?.province
    ? (getProvinceIdByName(initialData.province) ?? '')
    : '';
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(initialProvinceId);
  const availableCities = getCitiesByProvinceId(selectedProvinceId);

  // Geosearch autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ formatted: string; lat: number; lng: number }[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState<{ lat: number; lng: number } | null>(
    initialData?.latitude && initialData?.longitude
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null,
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: initialData?.name || '',
      categoryId: initialData?.categoryId || initialData?.category?.id || '',
      description: initialData?.description || '',
      city: initialData?.city || '',
      state: initialData?.province || '',
      address: initialData?.address || '',
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
    },
  });

  const descriptionValue = useWatch({
    control,
    name: 'description',
    defaultValue: initialData?.description || '',
  });

  const nameValue = useWatch({
    control,
    name: 'name',
    defaultValue: initialData?.name || '',
  });

  const addressValue = useWatch({
    control,
    name: 'address',
    defaultValue: initialData?.address || '',
  });

  const watchedCity = useWatch({
    control,
    name: 'city',
    defaultValue: initialData?.city || '',
  });

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { width, height } = img;
        const MIN_WIDTH = 800;
        const MIN_HEIGHT = 600;
        if (width < MIN_WIDTH || height < MIN_HEIGHT) {
          toast.error(
            `${file.name}: Resolusi terlalu kecil (${width}×${height}px). Minimal ${MIN_WIDTH}×${MIN_HEIGHT}px.`,
            { duration: 5000 },
          );
          resolve(false);
          return;
        }
        if (width < height) {
          toast.warning(
            `${file.name}: Foto portrait kurang optimal. Gunakan foto landscape (horizontal) untuk tampilan terbaik.`,
            { duration: 5000 },
          );
        }
        resolve(true);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error(`${file.name}: File gambar tidak valid.`);
        resolve(false);
      };
      img.src = url;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    // Reset input value so same file can be re-selected after error
    e.target.value = '';

    const MIN_SIZE_BYTES = 50 * 1024; // 50KB — enforces meaningful quality (Airbnb standard)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — generous but prevents huge uploads
    const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

    // Step 1: Synchronous validations (type + file size)
    const sizeAndTypeValid = newFiles.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Format tidak didukung. Gunakan .jpg atau .png.`);
        return false;
      }
      if (file.size < MIN_SIZE_BYTES) {
        toast.error(
          `${file.name}: Ukuran file terlalu kecil (min. 50KB). Gunakan foto berkualitas tinggi.`,
          { duration: 5000 },
        );
        return false;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`${file.name}: Ukuran file terlalu besar (maks. 5MB).`);
        return false;
      }
      return true;
    });

    if (sizeAndTypeValid.length === 0) return;

    // Step 2: Async dimension validation (requires loading image in browser)
    const dimensionResults = await Promise.all(
      sizeAndTypeValid.map((file) => validateImageDimensions(file)),
    );
    const validFiles = sizeAndTypeValid.filter((_, i) => dimensionResults[i]);

    if (validFiles.length === 0) return;

    // Step 3: Check max 10 images total
    const totalImages =
      (initialData?.images?.length || 0) - deletedImages.length + files.length + validFiles.length;
    if (totalImages > 10) {
      toast.error('Maksimal 10 gambar diperbolehkan');
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeNewFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (mainImageIndex === index) {
      setMainImageIndex(null);
    } else if (mainImageIndex !== null && mainImageIndex > index) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  useEffect(() => {
    if (searchQuery.length < 3) {
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const province = PROVINCES.find((p) => p.id === selectedProvinceId)?.name || '';
        const url = new URL('/api/geo/autocomplete', window.location.origin);
        url.searchParams.append('q', searchQuery);
        if (province) url.searchParams.append('province', province);
        if (watchedCity) url.searchParams.append('city', watchedCity);

        const res = await fetch(url.toString());
        const json = await res.json();
        if (json.success) {
          setSuggestions(json.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Failed to search address', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedProvinceId, watchedCity]);

  const handleSuggestionSelect = (suggestion: { formatted: string; lat: number; lng: number }) => {
    setValue('address', suggestion.formatted, { shouldValidate: true });
    setValue('latitude', suggestion.lat);
    setValue('longitude', suggestion.lng);
    setSelectedGeo({ lat: suggestion.lat, lng: suggestion.lng });
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleMarkerDrag = async (lat: number, lng: number) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
    setSelectedGeo({ lat, lng });

    try {
      const url = new URL('/api/geo/reverse', window.location.origin);
      url.searchParams.append('lat', lat.toString());
      url.searchParams.append('lng', lng.toString());
      
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success && json.data) {
        setValue('address', json.data, { shouldValidate: true });
      }
    } catch (err) {
      console.error('Failed to reverse geocode', err);
    }
  };

  const onSubmit = async (values: PropertyFormValues) => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined) data.append(k, String(v));
      });
      files.forEach((f) => data.append('images', f));
      if (initialData && deletedImages.length > 0) {
        data.append('deletedImages', JSON.stringify(deletedImages));
      }
      if (mainImageId) data.append('mainImageId', mainImageId);
      if (mainImageIndex !== null) data.append('mainImageIndex', mainImageIndex.toString());

      const url = initialData
        ? `/api/properties/tenant/properties/${initialData.id}`
        : '/api/properties/tenant/properties';
      const res = await fetch(url, { method: initialData ? 'PATCH' : 'POST', body: data });
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || 'Terjadi kesalahan');

      toast.success(initialData ? 'Properti diperbarui' : 'Properti ditambahkan');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Nama Properti</label>
        <Input
          {...register('name')}
          maxLength={100}
          disabled={loading}
          className={errors.name ? 'border-destructive' : ''}
        />
        <div className="flex justify-between text-xs mt-1">
          {errors.name ? (
            <span className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium">
              <span>⚠</span> {errors.name.message}
            </span>
          ) : (
            <span className="text-muted-foreground">Minimal 3 karakter, tanpa karakter khusus.</span>
          )}
          <span
            className={`text-muted-foreground ${nameValue.length > 100 ? 'text-destructive font-medium' : ''}`}
          >
            {nameValue.length} / 100
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Kategori</label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              disabled={loading}
              className={`w-full h-9 rounded border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.categoryId ? 'border-destructive' : ''}`}
            >
              <option value="">Pilih...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        />
        {errors.categoryId && (
          <p className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium">
            <span>⚠</span> {errors.categoryId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Deskripsi</label>
        <textarea
          {...register('description')}
          maxLength={1000}
          disabled={loading}
          className={`w-full min-h-20 rounded border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.description ? 'border-destructive' : ''}`}
        />
        <div className="flex justify-between text-xs mt-1">
          {errors.description ? (
            <span className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium">
              <span>⚠</span> {errors.description.message}
            </span>
          ) : (
            <span className="text-muted-foreground">Jelaskan fasilitas dan keunggulan.</span>
          )}
          <span
            className={`text-muted-foreground ${descriptionValue.length > 1000 ? 'text-destructive font-medium' : ''}`}
          >
            {descriptionValue.length} / 1000
          </span>
        </div>
      </div>

      {/* Location section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium">Lokasi Properti</label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Province */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Provinsi <span className="text-destructive">*</span>
            </label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <select
                  value={selectedProvinceId}
                  disabled={loading}
                  onChange={(e) => {
                    const province = PROVINCES.find((p) => p.id === e.target.value);
                    setSelectedProvinceId(e.target.value);
                    field.onChange(province?.name ?? '');
                    setValue('city', '');
                  }}
                  className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${errors.state ? 'border-destructive ring-1 ring-destructive' : 'border-input hover:border-primary/50'}`}
                >
                  <option value="">Pilih Provinsi...</option>
                  {PROVINCES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.state && (
              <p className="flex items-center gap-1 text-destructive text-xs mt-1.5">
                <span>⚠</span> {errors.state.message}
              </p>
            )}
          </div>

          {/* City — disabled until province is selected */}
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 uppercase tracking-wide ${
                selectedProvinceId ? 'text-muted-foreground' : 'text-muted-foreground/50'
              }`}
            >
              Kota / Kabupaten <span className="text-destructive">*</span>
            </label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <select
                    {...field}
                    disabled={loading || !selectedProvinceId}
                    className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors
                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
                      disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/30
                      ${errors.city ? 'border-destructive ring-1 ring-destructive' : 'border-input hover:border-primary/50'}
                      ${!selectedProvinceId ? 'border-dashed' : ''}`}
                  >
                    <option value="">
                      {selectedProvinceId
                        ? 'Pilih Kota / Kabupaten...'
                        : '← Pilih provinsi terlebih dahulu'}
                    </option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {!selectedProvinceId && (
                    <div
                      className="absolute inset-0 rounded-md cursor-not-allowed"
                      title="Pilih provinsi terlebih dahulu"
                    />
                  )}
                </div>
              )}
            />
            {errors.city && (
              <p className="flex items-center gap-1 text-destructive text-xs mt-1.5">
                <span>⚠</span> {errors.city.message}
              </p>
            )}
            {!selectedProvinceId && !errors.city && (
              <p className="text-xs text-muted-foreground/70 mt-1.5">
                Pilih provinsi untuk mengaktifkan pilihan kota.
              </p>
            )}
          </div>
        </div>

        {/* Geocoding Search */}
        <div className="relative z-10 pt-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Cari Alamat Cepat{' '}
            <span className="normal-case font-normal text-muted-foreground/60">(Opsional)</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length < 3) setSuggestions([]);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              disabled={loading || !selectedProvinceId}
              placeholder="Ketik nama jalan atau gedung untuk mencari..."
              className="pl-9 pr-9 bg-muted/20"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto bg-background border border-border rounded-md shadow-lg z-50">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => handleSuggestionSelect(s)}
                >
                  <MapPin className="inline-block h-3.5 w-3.5 mr-2 text-primary" />
                  {s.formatted}
                </li>
              ))}
            </ul>
          )}

          {/* Backdrop for closing suggestions */}
          {showSuggestions && (
            <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
          )}
        </div>

        {/* Street address */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Alamat Lengkap <span className="text-destructive">*</span>
          </label>
          <Input
            {...register('address')}
            maxLength={150}
            disabled={loading}
            placeholder="Nama jalan, nomor, gedung..."
            className={errors.address ? 'border-destructive' : ''}
          />
          <div className="flex justify-between text-xs mt-1">
            {errors.address ? (
              <span className="flex items-center gap-1 text-destructive text-xs mt-1.5">
                <span>⚠</span> {errors.address.message}
              </span>
            ) : (
              <span className="text-muted-foreground">Gunakan alamat lengkap properti Anda.</span>
            )}
            <span
              className={`text-muted-foreground ${addressValue.length > 150 ? 'text-destructive font-medium' : ''}`}
            >
              {addressValue.length} / 150
            </span>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Peta Lokasi
            </label>
            <div className="space-y-3 pt-4 border-t border-border">
              <PropertyMap 
                lat={selectedGeo?.lat ?? -6.2088} 
                lng={selectedGeo?.lng ?? 106.8456} 
                name={selectedGeo ? "Lokasi Pilihan" : "Geser pin ke lokasi Anda"} 
                draggable={true}
                onLocationChange={handleMarkerDrag}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium">Foto Properti</label>
        <p className="text-xs text-muted-foreground mb-3">
          Format: JPG/PNG · Ukuran: 50KB – 5MB per foto · Resolusi minimal: 800×600px · Orientasi
          landscape direkomendasikan · Maks. 10 foto
        </p>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 mb-2">
          {initialData?.images?.map(
            (img) =>
              !deletedImages.includes(img.id) && (
                <div
                  key={img.id}
                  className={`relative aspect-square border rounded-lg overflow-hidden group ${mainImageId === img.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt="prop"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {mainImageId !== img.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setMainImageId(img.id);
                          setMainImageIndex(null);
                        }}
                        className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-sm transition-colors"
                        title="Jadikan Utama"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setDeletedImages([...deletedImages, img.id]);
                        if (mainImageId === img.id) setMainImageId(null);
                      }}
                      className="bg-destructive/90 hover:bg-destructive text-white p-1.5 rounded-full shadow-sm transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {mainImageId === img.id && (
                    <div
                      className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground p-1 rounded-md shadow-md"
                      title="Foto Utama"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                  )}
                </div>
              ),
          )}

          {files.map((file, i) => {
            const isMain = mainImageIndex === i;
            const objectUrl = URL.createObjectURL(file);
            return (
              <div
                key={i}
                className={`relative aspect-square border rounded-lg overflow-hidden group ${isMain ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={objectUrl}
                  alt="preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onLoad={() => URL.revokeObjectURL(objectUrl)}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!isMain && (
                    <button
                      type="button"
                      onClick={() => {
                        setMainImageIndex(i);
                        setMainImageId(null);
                      }}
                      className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-sm transition-colors"
                      title="Jadikan Utama"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="bg-destructive/90 hover:bg-destructive text-white p-1.5 rounded-full shadow-sm transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {isMain && (
                  <div
                    className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground p-1 rounded-md shadow-md"
                    title="Foto Utama"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Upload Slot */}
          {(initialData?.images?.length || 0) - deletedImages.length + files.length < 10 && (
            <label className="relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors text-muted-foreground group">
              <div className="bg-muted group-hover:bg-primary/10 p-2 rounded-full mb-1 transition-colors">
                <Plus className="w-5 h-5 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider group-hover:text-primary transition-colors">
                Tambah
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
