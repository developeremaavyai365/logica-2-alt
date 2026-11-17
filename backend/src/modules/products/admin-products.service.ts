import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListQuery, listProducts, summariseProduct } from './admin-products';
import { toHistoryEntry } from './product-history';
import { ProductsService } from './products.service';

const HISTORY_PAGE = 30;

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
  async list(query: ListQuery & { deleted?: boolean }) {
    const [products, linked, categories] = await Promise.all([
      this.prisma.product.findMany({
        select: {
          slug: true,
          name: true,
          status: true,
          imageUrl: true,
          gallery: true,
          sharedImages: true,
          position: true,
          priceInPaise: true,
          mrpInPaise: true,
          inStock: true,
          ean: true,
          updatedAt: true,
          deletedAt: true,
          brand: { select: { name: true } },
          category: { select: { slug: true, name: true } },
          colours: { select: { key: true, name: true, ean: true, images: true }, orderBy: { position: 'asc' } },
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
    const live = rows.filter((r) => !r.deletedAt);
    const deleted = rows.filter((r) => r.deletedAt);
    const brands = [...new Set(live.map((r) => r.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    // Deleted products are listed only when asked for, to be restored. The
    // tab counts are always of the products not deleted, under the same
    // search and filters, plus how many deleted ones match.
    const anyStatus = { ...query, status: undefined, issue: undefined };
    const result = listProducts(query.deleted ? deleted : live, query.deleted ? anyStatus : query);
    const counts = query.deleted ? listProducts(live, anyStatus).counts : result.counts;
    return { ...result, counts: { ...counts, deleted: listProducts(deleted, anyStatus).total }, filters: { categories, brands } };
  }

  /** The product's history, newest first, a page at a time: its own changes
   *  and the SAP codes linked to it or taken off it. `before` is the
   *  `next` of the previous page. */
  async history(slug: string, before?: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) throw new NotFoundException('No product with this address.');

    let older: Prisma.AuditLogWhereInput = {};
    if (before) {
      const [iso, id] = before.split('|');
      const at = new Date(iso);
      if (Number.isNaN(at.getTime()) || !id) throw new BadRequestException('Not a history page.');
      older = { OR: [{ createdAt: { lt: at } }, { createdAt: at, id: { lt: id } }] };
    }
    const rows = await this.prisma.auditLog.findMany({
      where: {
        AND: [
          {
            OR: [
              { targetType: 'Product', targetId: slug },
              { targetType: 'SapItem', metadata: { path: ['productId'], equals: slug } },
              { targetType: 'SapItem', metadata: { path: ['previousProductId'], equals: slug } },
            ],
          },
          older,
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: HISTORY_PAGE + 1,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        metadata: true,
        createdAt: true,
        actor: { select: { name: true, email: true } },
      },
    });
    const page = rows.slice(0, HISTORY_PAGE);
    const last = page[page.length - 1];
    return {
      entries: page.map((row) => toHistoryEntry(row, slug)),
      next: rows.length > HISTORY_PAGE && last ? `${last.createdAt.toISOString()}|${last.id}` : null,
    };
  }

  /** Deletes a product by hiding it: off the shop and out of the list, kept
   *  with its history so it can be restored. A product with a SAP code
   *  linked is refused, so the code is not left pointing at nothing. */
  async remove(slug: string, actorId: string) {
    const product = await this.prisma.product.findFirst({ where: { slug, deletedAt: null }, select: { id: true, status: true, name: true } });
    if (!product) throw new NotFoundException('No product with this address.');
    const linked = await this.prisma.sapItem.findFirst({ where: { websiteProductId: slug }, select: { sapCode: true } });
    if (linked) {
      throw new ConflictException(`SAP code ${linked.sapCode} is linked to this product. Unlink it on the SAP import page first, then delete the product.`);
    }
    // A product on the shop comes off it; a draft stays a draft, so that
    // restoring it later does not count it as published. Recorded before
    // anything is written, with the status it had.
    const to = product.status === ProductStatus.ACTIVE ? ProductStatus.INACTIVE : product.status;
    const audit = { actorId, action: 'PRODUCT_DELETED', targetType: 'Product', targetId: slug, metadata: { name: product.name, from: product.status, to } };
    await this.prisma.$transaction([
      this.prisma.product.update({ where: { id: product.id }, data: { deletedAt: new Date(), status: to } }),
      this.prisma.auditLog.create({ data: audit }),
    ]);
    this.catalogue.forget();
    return { deleted: slug };
  }

  /** Brings a deleted product back, off the shop (or still a draft) until it
   *  is published again. A barcode given to another product since is taken
   *  off this one, as two products cannot share one. */
  async restore(slug: string, actorId: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: { not: null } },
      select: { id: true, status: true, ean: true, colours: { select: { id: true, ean: true } } },
    });
    if (!product) throw new NotFoundException('No deleted product with this address.');

    const codes = [product.ean, ...product.colours.map((c) => c.ean)].filter((c): c is string => !!c);
    const live = { deletedAt: null, id: { not: product.id } };
    const [onProducts, onColours] = codes.length
      ? await Promise.all([
          this.prisma.product.findMany({ where: { ...live, ean: { in: codes } }, select: { ean: true } }),
          this.prisma.productColour.findMany({ where: { ean: { in: codes }, product: live }, select: { ean: true } }),
        ])
      : [[], []];
    const taken = new Set([...onProducts, ...onColours].map((r) => r.ean));
    const cleared = codes.filter((c) => taken.has(c));
    const status = product.status === ProductStatus.DRAFT ? ProductStatus.DRAFT : ProductStatus.INACTIVE;

    await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: product.id },
        // Never straight back on the shop: someone publishes it on purpose.
        data: {
          deletedAt: null,
          status,
          ...(product.ean && taken.has(product.ean) && { ean: null }),
        },
      }),
      ...product.colours
        .filter((c) => c.ean && taken.has(c.ean))
        .map((c) => this.prisma.productColour.update({ where: { id: c.id }, data: { ean: null } })),
      this.prisma.auditLog.create({
        data: { actorId, action: 'PRODUCT_RESTORED', targetType: 'Product', targetId: slug, metadata: { clearedBarcodes: cleared, status } },
      }),
    ]);
    this.catalogue.forget();
    return { restored: slug, status, clearedBarcodes: cleared };
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
