import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_TITLE_FORMATS, TITLE_FIELDS, TitleFormatRule, buildTitle, pickTitleFormat } from './title-format';
import { LISTING_SELECT, titleInput, toListing, toTitleRule } from './listings.service';
import { ProductsService } from './products.service';

/** A format as the Title formats page lists it. */
export interface FormatRow {
  category: string | null;
  brand: string | null;
  pattern: string;
  /** The built-in format for the same brand and category, if there is one. */
  builtIn: string | null;
  /** Changed or added by an admin. */
  custom: boolean;
}

const key = (brand: string | null) => (brand ? brand.toLowerCase() : '*');

/** What makes a usable format: at most 300 characters, fields in matched
 *  braces, and at least the model or the brand in it. */
export function formatProblem(pattern: string): string | null {
  const p = pattern.trim();
  if (!p) return 'Write the format.';
  if (p.length > 300) return 'A format is at most 300 characters.';
  let depth = 0;
  for (const ch of p) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth < 0 || depth > 1) return 'Each field goes in one pair of braces, like {model}.';
  }
  if (depth !== 0) return 'A brace is not closed: each field goes in braces, like {model}.';
  if (!/\{(model|brand)\}/.test(p)) return 'A format needs at least {brand} or {model}.';
  return null;
}

@Injectable()
export class TitleFormatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogue: ProductsService,
  ) {}

  /** Every format in use: the built-in ones, each as an admin has left it,
   *  and the admin's own additions. */
  async list() {
    const [saved, categories, brands] = await Promise.all([
      this.prisma.titleFormat.findMany({ select: { brandKey: true, categorySlug: true, pattern: true } }),
      this.prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: 'asc' } }),
      this.prisma.brand.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
    ]);
    const brandName = new Map(brands.map((b) => [b.name.toLowerCase(), b.name]));
    const rows = new Map<string, FormatRow>();
    for (const d of DEFAULT_TITLE_FORMATS) {
      rows.set(`${d.category ?? '*'}|${key(d.brand)}`, { category: d.category, brand: d.brand, pattern: d.pattern, builtIn: d.pattern, custom: false });
    }
    for (const s of saved.map(toTitleRule)) {
      const id = `${s.category ?? '*'}|${key(s.brand)}`;
      const builtIn = rows.get(id)?.builtIn ?? null;
      rows.set(id, { category: s.category, brand: s.brand ? (brandName.get(s.brand) ?? s.brand) : null, pattern: s.pattern, builtIn, custom: s.pattern !== builtIn });
    }
    return {
      fields: TITLE_FIELDS,
      categories,
      brands: brands.map((b) => b.name),
      formats: [...rows.values()],
    };
  }

  /** Saves a format for a brand in a category (null: every brand, or every
   *  category), then re-titles the products whose titles it builds. */
  async save(brand: string | null, category: string | null, pattern: string, actorId: string) {
    const problem = formatProblem(pattern);
    if (problem) throw new BadRequestException(problem);
    if (category && !(await this.prisma.category.findUnique({ where: { slug: category }, select: { id: true } }))) {
      throw new BadRequestException('Choose one of the listed categories.');
    }
    const where = { brandKey_categorySlug: { brandKey: key(brand?.trim() || null), categorySlug: category ?? '*' } };
    await this.prisma.titleFormat.upsert({
      where,
      create: { ...where.brandKey_categorySlug, pattern: pattern.trim() },
      update: { pattern: pattern.trim() },
    });
    const retitled = await this.retitle(actorId, 'TITLE_FORMAT_SAVED', { brand, category, pattern: pattern.trim() });
    return { ...(await this.list()), retitled };
  }

  /** Back to the built-in format (or none, for an admin's own addition). */
  async reset(brand: string | null, category: string | null, actorId: string) {
    await this.prisma.titleFormat.deleteMany({ where: { brandKey: key(brand?.trim() || null), categorySlug: category ?? '*' } });
    const retitled = await this.retitle(actorId, 'TITLE_FORMAT_RESET', { brand, category });
    return { ...(await this.list()), retitled };
  }

  /** Rebuilds the titles of products with automatic titles from the formats
   *  as they now are, logging each title that changes. Returns how many. */
  private async retitle(actorId: string, action: string, details: Record<string, string | null>): Promise<number> {
    const [saved, products] = await Promise.all([
      this.prisma.titleFormat.findMany({ select: { brandKey: true, categorySlug: true, pattern: true } }),
      this.prisma.product.findMany({ where: { titleAuto: true, deletedAt: null }, select: { ...LISTING_SELECT, id: true } }),
    ]);
    const formats: TitleFormatRule[] = saved.map(toTitleRule);
    const changed: { id: string; slug: string; from: string; to: string }[] = [];
    for (const p of products) {
      const listing = toListing(p);
      const { pattern } = pickTitleFormat(listing.brandName, listing.categorySlug, formats);
      const title = buildTitle(pattern, titleInput(listing), listing.colours[0]?.name ?? null);
      if (title.length >= 3 && title !== p.name) changed.push({ id: p.id, slug: p.slug, from: p.name, to: title });
    }

    await this.prisma.$transaction([
      ...changed.map((c) => this.prisma.product.update({ where: { id: c.id }, data: { name: c.to } })),
      this.prisma.auditLog.createMany({
        data: [
          { actorId, action, targetType: 'TitleFormat', targetId: `${details.category ?? '*'}|${details.brand ?? '*'}`, metadata: { ...details, retitled: changed.length } },
          ...changed.map((c) => ({
            actorId,
            action: 'PRODUCT_UPDATED',
            targetType: 'Product',
            targetId: c.slug,
            metadata: { via: 'title format', changes: [{ field: 'name', from: c.from, to: c.to }] } as Prisma.InputJsonObject,
          })),
        ],
      }),
    ]);
    if (changed.length) this.catalogue.forget();
    return changed.length;
  }
}
