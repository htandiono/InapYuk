import { Request, Response, NextFunction } from 'express';
import { sendPaginated, sendSuccess } from '../../utils/api-response';
import { getRooms, createRoom, updateRoom, deleteRoom } from './rooms.service';
import { CreateRoomSchema, UpdateRoomSchema, UpdateAvailabilitySchema, CreatePeakSeasonSchema, UpdatePeakSeasonSchema } from './rooms.schema';
import { forbidden, badRequest } from '../../utils/app-error';
import { upsertAvailability } from './services/rooms.availability.service';
import { getPeakSeasons, createPeakSeason, updatePeakSeason, deletePeakSeason } from './services/rooms.peak-season.service';
export class RoomsController {
  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const { propertyId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await getRooms(req.tenantId, propertyId as string, page, limit);
      sendPaginated(res, result.data, result.meta, 'Berhasil mengambil daftar kamar');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const data = CreateRoomSchema.parse(req.body);
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) throw badRequest('Minimal 1 foto kamar diperlukan');
      if (files.length > 5) throw badRequest('Maksimal 5 foto kamar');
      const room = await createRoom(req.tenantId, req.params.propertyId as string, data, files);
      sendSuccess(res, room, 'Kamar berhasil dibuat', 201);
    } catch (e) { next(e); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const data = UpdateRoomSchema.parse(req.body);
      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length > 5) throw badRequest('Maksimal 5 foto kamar');
      const room = await updateRoom(req.tenantId, req.params.id as string, data, files);
      sendSuccess(res, room, 'Kamar berhasil diperbarui');
    } catch (e) { next(e); }
  }

  static async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const { id } = req.params;
      const room = await deleteRoom(req.tenantId, id as string);
      sendSuccess(res, room, 'Kamar berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }

  static async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const data = UpdateAvailabilitySchema.parse(req.body);
      const result = await upsertAvailability(req.tenantId, req.params.id as string, data);
      sendSuccess(res, null, result.message);
    } catch (e) { next(e); }
  }

  static async getPeakSeasons(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const rates = await getPeakSeasons(req.tenantId, req.params.id as string);
      sendSuccess(res, rates, 'Berhasil mengambil harga musiman');
    } catch (e) { next(e); }
  }

  static async createPeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const data = CreatePeakSeasonSchema.parse(req.body);
      const rate = await createPeakSeason(req.tenantId, req.params.id as string, data);
      sendSuccess(res, rate, 'Harga musiman berhasil dibuat', 201);
    } catch (e) { next(e); }
  }

  static async updatePeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const data = UpdatePeakSeasonSchema.parse(req.body);
      const rate = await updatePeakSeason(req.tenantId, req.params.id as string, data);
      sendSuccess(res, rate, 'Harga musiman berhasil diperbarui');
    } catch (e) { next(e); }
  }

  static async deletePeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw forbidden('Akses ditolak');
      const result = await deletePeakSeason(req.tenantId, req.params.id as string);
      sendSuccess(res, null, result.message);
    } catch (e) { next(e); }
  }
}
