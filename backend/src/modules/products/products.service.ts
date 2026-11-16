import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PublicCatalogue, toPublicCatalogue } from './public-catalogue';

/** How long the built catalogue is reused before the database is read again. */
const CACHE_MS = 30_000;

@Injectable()
export class ProductsService {
  private cached: { at: number; catalogue: PublicCatalogue } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /** Every active product, shaped as the website reads it. Built at most
   *  once every 30 seconds; an admin edit calls `forget()` so it shows
   *  straight away. */
  async publicCatalogue(): Promise<PublicCatalogue> {
    if (this.cached && Date.now() - this.cached.at < CACHE_MS) return this.cached.catalogue;
    const rows = await this.prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE, deletedAt: null },
      orderBy: [{ position: 'asc' }, { slug: 'asc' }],
      select: {
        slug: true,
        name: true,
        description: true,
        position: true,
        priceInPaise: true,
        mrpInPaise: true,
        inStock: true,
        imageUrl: true,
        gallery: true,
        sharedImages: true,
        highlights: true,
        specs: true,
        attrs: true,
        rating: true,
        reviewCount: true,
        updatedAt: true,
        brand: { select: { name: true } },
        category: { select: { slug: true } },
        colours: { select: { key: true, name: true, hex: true, family: true, images: true, inStock: true, position: true } },
      },
    });
    const catalogue = toPublicCatalogue(rows);
    this.cached = { at: Date.now(), catalogue };
    return catalogue;
  }

  forget() {
    this.cached = null;
  }
}
