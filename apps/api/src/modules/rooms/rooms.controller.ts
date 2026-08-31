import { Request, Response, NextFunction } from 'express';
import { sendPaginated, sendSuccess } from '../../utils/api-response';
import { getRooms, createRoom, updateRoom, deleteRoom } from './rooms.service';
import { CreateRoomSchema, UpdateRoomSchema } from './rooms.schema';
import { forbidden, badRequest } from '../../utils/app-error';

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
}
