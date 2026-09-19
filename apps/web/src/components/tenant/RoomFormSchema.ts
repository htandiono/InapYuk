import { z } from 'zod';
import { RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const RoomFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Minimal 3 karakter.')
    .max(100, 'Maksimal 100 karakter.')
    .regex(/^[a-zA-Z0-9\s.,&'-]+$/, 'Karakter tidak valid.'),
  description: z.string().min(10, 'Minimal 10 karakter.').max(1000, 'Maksimal 1000 karakter.'),
  basePrice: z.number().min(50000, 'Minimal Rp 50.000').max(100000000, 'Maksimal Rp 100.000.000'),
  capacity: z.number().min(1, 'Minimal 1 orang').max(20, 'Maksimal 20 orang'),
  totalUnits: z.number().min(1, 'Minimal 1').max(100, 'Maksimal 100'),
});

export type RoomFormData = z.infer<typeof RoomFormSchema>;

export type RoomFormInitData = RoomFormData & {
  id?: string;
  images?: { id: string; url: string }[];
};

export type RoomFormState = {
  form: UseFormReturn<RoomFormData>;
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  deleted: string[];
  setDeleted: React.Dispatch<React.SetStateAction<string[]>>;
  mainId: string | null;
  setMainId: React.Dispatch<React.SetStateAction<string | null>>;
  mainIdx: number | null;
  setMainIdx: React.Dispatch<React.SetStateAction<number | null>>;
  ref: RefObject<HTMLInputElement>;
  propertyId: string;
  initialData?: RoomFormInitData;
  onSuccess?: () => void;
};
