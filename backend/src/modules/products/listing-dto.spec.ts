import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SaveListingDto } from './dto/listing.dto';

interface SeedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp?: number;
  inStock: boolean;
  details: { highlights: string[]; specs: [string, string][]; overview?: string } | null;
  gallery: string[];
  colours: { colours: { key: string; name: string; hex: string; family: string[]; images: string[]; inStock?: boolean }[]; shared?: string[] } | null;
}

const seed: { products: SeedProduct[] } = JSON.parse(readFileSync(join(__dirname, '../../../prisma/catalogue-seed.json'), 'utf8'));

/** A seed product as the listing form would send it back unchanged. */
const asFormBody = (p: SeedProduct) => ({
  name: p.name,
  categorySlug: p.category,
  brandName: p.brand,
  status: 'ACTIVE',
  priceInPaise: Math.round(p.price * 100),
  mrpInPaise: p.mrp != null ? Math.round(p.mrp * 100) : null,
  inStock: p.inStock,
  gallery: p.gallery,
  sharedImages: p.colours?.shared ?? [],
  highlights: p.details?.highlights ?? [],
  specs: (p.details?.specs ?? []).map(([label, value]) => ({ label, value })),
  description: p.details?.overview ?? '',
  modelNumber: null,
  partNumber: null,
  ean: null,
  hsnCode: null,
  gstRatePercent: null,
  warranty: null,
  inTheBox: null,
  colours: (p.colours?.colours ?? []).map((c) => ({ ...c, inStock: c.inStock ?? null, ean: null })),
});

describe('the listing form accepts every existing product', () => {
  it('saves each of the catalogue products back unchanged without a validation error', async () => {
    const failures: string[] = [];
    for (const p of seed.products) {
      const errors = await validate(plainToInstance(SaveListingDto, asFormBody(p)), { whitelist: true, forbidNonWhitelisted: true });
      if (errors.length) failures.push(`${p.id}: ${JSON.stringify(errors.map((e) => e.constraints ?? e.children?.map((c) => c.children?.map((g) => g.constraints))))}`);
    }
    expect(failures).toEqual([]);
    expect(seed.products.length).toBe(214);
  });
});
