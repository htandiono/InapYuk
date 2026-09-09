export interface PeakRate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE';
  adjustmentValue: string | number;
}
