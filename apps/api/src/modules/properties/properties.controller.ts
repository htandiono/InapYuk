import { Request, Response, NextFunction } from 'express';
import { sendPaginated, sendSuccess, sendError } from '../../utils/api-response';
import {
  getUniqueCities,
  searchProperties,
  getPropertyBySlug,
} from './services/properties.queries';
import { getPropertiesQuerySchema, getPropertyPricingSchema } from './properties.schema';
import { resolveRoomPricing } from '../../services/pricing.service';
import { dayjs } from '../../utils/date';

export async function getCities(req: Request, res: Response, next: NextFunction) {
  try {
    const cities = await getUniqueCities();
    sendSuccess(res, cities, 'Success fetching cities');
  } catch (error) {
    next(error);
  }
}

export async function getProperties(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getPropertiesQuerySchema.parse(req.query);
    const { items, meta } = await searchProperties(query);
    sendPaginated(res, items, meta, 'Success fetching properties');
  } catch (error) {
    next(error);
  }
}

export async function getPropertyDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const property = await getPropertyBySlug(req.params.slug as string);
    if (!property) return sendError(res, 404, 'Property tidak ditemukan');
    sendSuccess(res, property, 'Success fetching property detail');
  } catch (error) {
    next(error);
  }
}

function buildMonthDateRange(year: number, month: number) {
  const start = dayjs
    .utc()
    .year(year)
    .month(month - 1)
    .date(1);
  return {
    checkIn: start.format('YYYY-MM-DD'),
    checkOut: start.add(1, 'month').format('YYYY-MM-DD'),
  };
}

import { prisma } from '../../libs/prisma';

export async function getPropertyCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getPropertyPricingSchema.parse(req.query);
    const room = await prisma.room.findFirst({
      where: { id: query.roomId, property: { slug: req.params.slug as string } },
    });
    if (!room) return sendError(res, 404, 'Room not found for this property');

    const { checkIn, checkOut } = buildMonthDateRange(query.year, query.month);
    const pricing = await resolveRoomPricing({ roomId: query.roomId, checkIn, checkOut });
    sendSuccess(res, pricing.nights, 'Success fetching room pricing');
  } catch (error) {
    next(error);
  }
}

import { getTenantProperties } from './services/properties.queries';
import { createProperty, updateProperty, deleteProperty } from './services/properties.mutations';
import { CreatePropertySchema, UpdatePropertySchema } from './properties.schema';
import { forbidden, badRequest } from '../../utils/app-error';

export class TenantPropertiesController {
  static async getTenantPropertiesList(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await getTenantProperties(req.tenantId, page, limit);
      sendPaginated(res, result.data, result.meta, 'Success fetching tenant properties');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const { id } = req.params;
      const property = await prisma.property.findFirst({
        where: { id: id as string, tenantId: req.tenantId, deletedAt: null },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          rooms: { where: { deletedAt: null }, select: { name: true, basePrice: true } },
        },
      });
      if (!property) throw forbidden('Properti tidak ditemukan');
      sendSuccess(res, property, 'Success fetching property');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const data = CreatePropertySchema.parse(req.body);
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) throw badRequest('Minimal 1 gambar diperlukan');
      if (files.length > 10) throw badRequest('Maksimal 10 gambar');

      const property = await createProperty(req.tenantId, data, files);
      sendSuccess(res, property, 'Properti berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const data = UpdatePropertySchema.parse(req.body);
      const files = (req.files as Express.Multer.File[]) || [];
      const { id } = req.params;

      const property = await updateProperty(req.tenantId, id as string, data, files);
      sendSuccess(res, property, 'Properti berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  static async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const { id } = req.params;
      const property = await deleteProperty(req.tenantId, id as string);
      sendSuccess(res, property, 'Properti berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }
}
