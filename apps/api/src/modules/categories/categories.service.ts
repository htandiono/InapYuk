import { prisma } from '../../libs/prisma';
import { conflict, forbidden } from '../../utils/app-error';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema';
import { toPrismaPageArgs, buildPaginationMeta } from '../../utils/pagination';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export class CategoriesService {
  static async createCategory(tenantId: string, data: CreateCategoryInput) {
    const slug = generateSlug(data.name);
    const existing = await prisma.propertyCategory.findFirst({ where: { tenantId, slug, deletedAt: null } });
    if (existing) throw conflict('Kategori sudah ada');
    return prisma.propertyCategory.create({ data: { tenantId, name: data.name, slug } });
  }

  static async getCategories(tenantId: string, page: number = 1, limit: number = 10) {
    const { take, skip } = toPrismaPageArgs({ page, limit });
    const where = { tenantId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.propertyCategory.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } }),
      prisma.propertyCategory.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  static async updateCategory(tenantId: string, id: string, data: UpdateCategoryInput) {
    const slug = generateSlug(data.name);

    const target = await prisma.propertyCategory.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!target) throw forbidden('Akses ditolak');

    const duplicate = await prisma.propertyCategory.findFirst({
      where: { tenantId, slug, id: { not: id }, deletedAt: null },
    });

    if (duplicate) throw conflict('Kategori sudah ada');

    return prisma.propertyCategory.update({
      where: { id },
      data: { name: data.name, slug },
    });
  }

  static async deleteCategory(tenantId: string, id: string) {
    const target = await prisma.propertyCategory.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!target) throw forbidden('Akses ditolak');

    return prisma.propertyCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
