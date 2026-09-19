import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RoomFormInitData, RoomFormData, RoomFormSchema, RoomFormState } from './RoomFormSchema';

export function useRoomForm(
  propertyId: string,
  initialData?: RoomFormInitData,
  onSuccess?: () => void,
): RoomFormState {
  const [images, setImages] = useState<File[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [mainId, setMainId] = useState<string | null>(initialData?.images?.[0]?.id || null);
  const [mainIdx, setMainIdx] = useState<number | null>(null);
  const ref = useRef<HTMLInputElement>(null!);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(RoomFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      basePrice: initialData?.basePrice || 0,
      capacity: initialData?.capacity || 1,
      totalUnits: initialData?.totalUnits || 1,
    },
  });

  return {
    form,
    images,
    setImages,
    deleted,
    setDeleted,
    mainId,
    setMainId,
    mainIdx,
    setMainIdx,
    ref,
    propertyId,
    initialData,
    onSuccess,
  };
}

export function handleImageFiles(
  e: React.ChangeEvent<HTMLInputElement>,
  state: RoomFormState,
  previewsCount: number,
) {
  if (!e.target.files) return;
  const files = Array.from(e.target.files);
  if (files.length + state.images.length + previewsCount - state.deleted.length > 5)
    return toast.error('Maksimal 5 foto kamar diperbolehkan');
  const validFiles = filterValidFiles(files);
  if (validFiles.length > 0) {
    state.setImages((p: File[]) => [...p, ...validFiles]);
    if (!state.mainId && state.mainIdx === null && previewsCount - state.deleted.length === 0)
      state.setMainIdx(0);
  }
  if (state.ref.current) state.ref.current.value = '';
}

function filterValidFiles(files: File[]) {
  const valid: File[] = [];
  for (const f of files) {
    if (!['image/jpeg', 'image/png'].includes(f.type))
      toast.error(`${f.name}: Format tidak didukung.`);
    else if (f.size < 50 * 1024) toast.error(`${f.name}: Terlalu kecil (min. 50KB).`);
    else if (f.size > 5 * 1024 * 1024) toast.error(`${f.name}: Terlalu besar (maks. 5MB).`);
    else valid.push(f);
  }
  return valid;
}

export function removeNewFile(index: number, state: RoomFormState) {
  state.setImages((p: File[]) => p.filter((_: File, i: number) => i !== index));
  if (state.mainIdx === index) state.setMainIdx(null);
  else if (state.mainIdx !== null && state.mainIdx > index) state.setMainIdx(state.mainIdx - 1);
}

export async function submitForm(data: RoomFormData, state: RoomFormState) {
  try {
    const url = state.initialData?.id
      ? `/api/rooms/tenant/rooms/${state.initialData.id}`
      : `/api/rooms/tenant/properties/${state.propertyId}/rooms`;
    const form = buildFormData(data, state);
    const res = await fetch(url, { method: state.initialData?.id ? 'PATCH' : 'POST', body: form });
    if (!res.ok) throw new Error((await res.json()).message || 'Terjadi kesalahan');
    toast.success(
      state.initialData?.id ? 'Kamar berhasil diperbarui' : 'Kamar berhasil ditambahkan',
    );
    if (state.onSuccess) state.onSuccess();
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : String(err));
  }
}

function buildFormData(data: RoomFormData, state: RoomFormState) {
  const fd = new FormData();
  fd.append('name', data.name);
  fd.append('description', data.description);
  fd.append('basePrice', data.basePrice.toString());
  fd.append('capacity', data.capacity.toString());
  fd.append('totalUnits', data.totalUnits.toString());
  state.images.forEach((f: File) => fd.append('images', f));
  if (state.deleted.length > 0) fd.append('deletedImages', JSON.stringify(state.deleted));
  if (state.mainId) fd.append('mainImageId', state.mainId);
  else if (state.mainIdx !== null) fd.append('mainImageIndex', state.mainIdx.toString());
  return fd;
}
