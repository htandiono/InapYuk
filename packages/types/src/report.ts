import type { SortOrder } from './api';

/** Owner: Feature 2 (htandiono). */

export type SalesReportGroupBy = 'property' | 'transaction' | 'user';

export interface SalesReportQuery {
  groupBy: SalesReportGroupBy;
  dateFrom?: string;
  dateTo?: string;
  propertyId?: string;
  sortBy?: 'date' | 'total';
  sortOrder?: SortOrder;
}

export interface SalesReportRow {
  key: string;
  label: string;
  bookingCount: number;
  nightCount: number;
  totalRevenue: number;
  lastTransactionAt: string | null;
}

export interface SalesReportResponse {
  groupBy: SalesReportGroupBy;
  rows: SalesReportRow[];
  summary: {
    totalRevenue: number;
    totalBookings: number;
    averageBookingValue: number;
  };
}

export interface PropertyReportQuery {
  propertyId?: string;
  month: string;
}

export interface PropertyReportDay {
  date: string;
  totalUnits: number;
  bookedUnits: number;
  availableUnits: number;
  isBlocked: boolean;
}

export interface PropertyReportRoom {
  roomId: string;
  roomName: string;
  days: PropertyReportDay[];
}

export interface PropertyReportResponse {
  propertyId: string;
  propertyName: string;
  month: string;
  rooms: PropertyReportRoom[];
}
