import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../../utils/api-response';
import { CategoriesService } from './categories.service';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema';
import { forbidden } from '../../utils/app-error';

export class CategoriesController {
  static async create(req: Request, res: Response) {
    if (!req.tenantId) throw forbidden('Akses ditolak');
    const data = req.body as CreateCategoryInput;
    const category = await CategoriesService.createCategory(req.tenantId, data);
    sendSuccess(res, category, 'Kategori berhasil dibuat', 201);
  }

  static async getTenantCategories(req: Request, res: Response) {
    if (!req.tenantId) throw forbidden('Akses ditolak');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await CategoriesService.getCategories(req.tenantId, page, limit);
    sendPaginated(res, result.data, result.meta, 'Berhasil mengambil daftar kategori');
  }

  static async update(req: Request, res: Response) {
    if (!req.tenantId) throw forbidden('Akses ditolak');
    const data = req.body as UpdateCategoryInput;
    const { id } = req.params;
    const category = await CategoriesService.updateCategory(req.tenantId, id as string, data);
    sendSuccess(res, category, 'Kategori berhasil diperbarui');
  }

  static async softDelete(req: Request, res: Response) {
    if (!req.tenantId) throw forbidden('Akses ditolak');
    const { id } = req.params;
    const category = await CategoriesService.deleteCategory(req.tenantId, id as string);
    sendSuccess(res, category, 'Kategori berhasil dihapus');
  }
}
