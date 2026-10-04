import type { PropertyReportQuery, SalesReportQuery } from '@inapyuk/types';
import { asyncHandler } from '../../utils/async-handler';
import { sendSuccess } from '../../utils/api-response';
import { unauthorized } from '../../utils/app-error';
import { occupancyReport } from './reports.occupancy';
import { salesReport } from './reports.sales';

export const getSalesReport = asyncHandler(async (req, res) => {
  if (!req.tenantId) throw unauthorized();
  const data = await salesReport(req.tenantId, req.query as unknown as SalesReportQuery);
  sendSuccess(res, data, 'Laporan penjualan');
});

export const getOccupancyReport = asyncHandler(async (req, res) => {
  if (!req.tenantId) throw unauthorized();
  const data = await occupancyReport(req.tenantId, req.query as unknown as PropertyReportQuery);
  sendSuccess(res, data, 'Kalender ketersediaan');
});
