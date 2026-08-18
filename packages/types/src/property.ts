import type { PaginationQuery, SortOrder } from './api';
import type { PriceAdjustmentType } from './enums';

/** Owner: Feature 1 (awanstywn). Consumed by Feature 2 for checkout and reports. */

export interface PropertyCategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface PropertyImageDto {
  id: string;
  url: string;
  sortOrder: number;
}

export interface RoomDto {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  totalUnits: number;
  imageUrl: string | null;
}

export interface PropertyListItemDto {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  category: PropertyCategoryDto;
  coverImageUrl: string | null;
  /** Lowest available room price for the searched date range. */
  startingPrice: number;
  averageRating: number | null;
  reviewCount: number;
}

export interface PropertyDetailDto extends PropertyListItemDto {
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  images: PropertyImageDto[];
  rooms: RoomDto[];
  tenant: { id: string; companyName: string };
}

export interface PropertySearchQuery extends PaginationQuery {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price';
  sortOrder?: SortOrder;
}

/** One calendar cell on the property detail price calendar. */
export interface RoomPriceCalendarDay {
  date: string;
  basePrice: number;
  finalPrice: number;
  isAvailable: boolean;
  availableUnits: number;
  adjustment: {
    type: PriceAdjustmentType;
    value: number;
    label: string;
  } | null;
}

export interface RoomPriceCalendarResponse {
  roomId: string;
  month: string;
  days: RoomPriceCalendarDay[];
}

export interface UpsertPropertyRequest {
  name: string;
  categoryId: string;
  description: string;
  city: string;
  province: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface UpsertRoomRequest {
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  totalUnits: number;
}

export interface UpsertPeakSeasonRateRequest {
  roomId: string;
  name: string;
  startDate: string;
  endDate: string;
  adjustmentType: PriceAdjustmentType;
  adjustmentValue: number;
}

export interface SetRoomAvailabilityRequest {
  roomId: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  availableUnits?: number;
}
