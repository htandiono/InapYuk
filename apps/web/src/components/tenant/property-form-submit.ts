import type { PropertyFormInitData, PropertyFormValues } from './property-schema';

interface ImageState {
  files: File[];
  deletedImages: string[];
  mainImageId: string | null;
  mainImageIndex: number | null;
}

function appendImages(data: FormData, images: ImageState, isEdit: boolean) {
  images.files.forEach((f) => data.append('images', f));
  if (isEdit && images.deletedImages.length > 0)
    data.append('deletedImages', JSON.stringify(images.deletedImages));
  if (images.mainImageId) data.append('mainImageId', images.mainImageId);
  if (images.mainImageIndex !== null)
    data.append('mainImageIndex', images.mainImageIndex.toString());
}

export function buildFormData(
  values: PropertyFormValues,
  images: ImageState,
  initialData?: PropertyFormInitData,
) {
  const data = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined) data.append(k, String(v));
  });
  appendImages(data, images, Boolean(initialData));
  return data;
}

export async function submitPropertyForm(data: FormData, initialData?: PropertyFormInitData) {
  const url = initialData
    ? `/api/properties/tenant/properties/${initialData.id}`
    : '/api/properties/tenant/properties';
  const res = await fetch(url, { method: initialData ? 'PATCH' : 'POST', body: data });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Terjadi kesalahan');
  return json;
}
