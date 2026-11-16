import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListQuery, listProducts, summariseProduct } from './admin-products';
import { ProductsService } from './products.service';

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogue: ProductsService,
  ) {}

  /** The admin products list. The whole catalogue is summarised and filtered
   *  in memory: a few thousand rows at most, and the shown price, stock and
   *  barcode status depend on the linked SAP codes, which are not a
   *  database relation. */
  async list(query: ListQuery) {
    const [products, linked, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: { deletedAt: null },
        select: {
          slug: true,
          name: true,
          status: true,
          imageUrl: true,
          position: true,
          priceInPaise: true,
          mrpInPaise: true,
          inStock: true,
          ean: true,
          updatedAt: true,
          brand: { select: { name: true } },
          category: { select: { slug: true, name: true } },
          colours: { select: { key: true, name: true, ean: true }, orderBy: { position: 'asc' } },
        },
      }),
      this.prisma.sapItem.findMany({
        where: { websiteProductId: { not: null } },
        select: {
          sapCode: true,
          websiteProductId: true,
          websiteColour: true,
          mopInPaise: true,
          mrpInPaise: true,
          stock: true,
          ean: true,
        },
      }),
      this.prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: 'asc' } }),
    ]);

    const rows = products.map((p) => summariseProduct(p, linked));
    const brands = [...new Set(rows.map((r) => r.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return { ...listProducts(rows, query), filters: { categories, brands } };
  }

  /** Puts products on the shop or takes them off, logging each change. */
  async setStatus(slugs: string[], status: 'ACTIVE' | 'INACTIVE', actorId: string) {
    const unique = [...new Set(slugs)];
    const changing = await this.prisma.product.findMany({
      where: { slug: { in: unique }, deletedAt: null, status: { not: status } },
      select: { slug: true, status: true },
    });
    if (changing.length === 0) return { updated: 0 };

    // Recorded before anything is written, with each product's old status.
    const audit = changing.map((p) => ({
      actorId,
      action: status === 'ACTIVE' ? 'PRODUCT_ACTIVATED' : 'PRODUCT_DEACTIVATED',
      targetType: 'Product',
      targetId: p.slug,
      metadata: { from: p.status, to: status },
    }));
    await this.prisma.$transaction([
      this.prisma.product.updateMany({
        where: { slug: { in: changing.map((p) => p.slug) } },
        data: { status: ProductStatus[status] },
      }),
      this.prisma.auditLog.createMany({ data: audit }),
    ]);
    this.catalogue.forget();
    return { updated: changing.length };
  }
}
