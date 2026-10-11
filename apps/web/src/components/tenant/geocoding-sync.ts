import type { UseFormSetValue } from 'react-hook-form';
import type { PropertyFormValues } from './property-schema';

export type Geo = { lat: number; lng: number };
export type SetValue = UseFormSetValue<PropertyFormValues>;
export type SetGeo = (geo: Geo | null) => void;

/** Writes a geocoded point into the form fields and the map state. */
export function applyGeo(setValue: SetValue, setSelectedGeo: SetGeo, point: Geo) {
  setValue('latitude', point.lat);
  setValue('longitude', point.lng);
  setSelectedGeo({ lat: point.lat, lng: point.lng });
}
