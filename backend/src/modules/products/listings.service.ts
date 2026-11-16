import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveListingDto } from './dto/listing.dto';
import { GST_RATES, SPEC_TEMPLATES, bigPriceChange, checkListing, isValidGtin, slugify, uniqueSlug } from './listing-rules';
import { ProductsService } from './products.service';

const LISTING_SELECT = {
  slug: true,
  name: true,
  status: true,
  description: true,
  priceInPaise: true,
  mrpInPaise: true,
  inStock: true,
  gallery: true,
  sharedImages: true,
  highlights: true,
  specs: true,
  modelNumber: true,
  partNumber: true,
  ean: true,
  hsnCode: true,
  gstRatePercent: true,
  warranty: true,
  inTheBox: true,
  updatedAt: true,
  brand: { select: { name: true } },
  category: { select: { slug: true } },
  colours: {
    select: { key: true, name: true, hex: true, family: true, images: true, inStock: true, ean: true },
    orderBy: { position: 'asc' },
  },
} satisfies Prisma.ProductSelect;

type StoredListing = Prisma.ProductGetPayload<{ select: typeof LISTING_SELECT }>;

/** The fields whose changes are written to the audit log, by name. */
const AUDITED = [
  'name',
  'status',
  'categorySlug',
  'brandName',
  'priceInPaise',
  'mrpInPaise',
  'inStock',
  'description',
  'modelNumber',
  'partNumber',
  'ean',
  'hsnCode',
  'gstRatePercent',
  'warranty',
  'inTheBox',
] as const;

const specPairs = (specs: unknown): { label: string; value: string }[] =>
  Array.isArray(specs)
    ? specs
        .filter((p): p is [string, string] => Array.isArray(p) && typeof p[0] === 'string' && typeof p[1] === 'string')
        .map(([label, value]) => ({ label, value }))
    : [];

const clean = (text: string | null | undefined) => {
  const t = text?.trim();
  return t ? t : null;
};

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogue: ProductsService,
  ) {}

  /** What the listing form needs to offer: categories with their spec
   *  fields, the brands already in use, and the GST rates. */
  async formOptions() {
    const [categories, brands] = await Promise.all([
      this.prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: 'asc' } }),
      this.prisma.brand.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
    ]);
    return {
      categories: categories.map((c) => ({ ...c, specFields: SPEC_TEMPLATES[c.slug] ?? [] })),
      brands: brands.map((b) => b.name),
      gstRates: GST_RATES,
    };
  }

  /** One listing as the form edits it, with its linked SAP codes and what it
   *  still needs before it can be published. */
  async get(slug: string) {
    const product = await this.prisma.product.findFirst({ where: { slug, deletedAt: null }, select: LISTING_SELECT });
    if (!product) throw new NotFoundException('No product with this address.');
    const sapCodes = await this.prisma.sapItem.findMany({
      where: { websiteProductId: slug },
      select: { sapCode: true, modelName: true, websiteColour: true, mopInPaise: true, mrpInPaise: true, stock: true, ean: true },
      orderBy: { sapCode: 'asc' },
    });
    const listing = this.toForm(product);
    const checklist = checkListing(listing, sapCodes.length > 0, product.status === ProductStatus.ACTIVE);
    return { ...listing, slug, updatedAt: product.updatedAt, sapCodes, checklist };
  }

  /** Creates a listing (`slug` null) or saves an existing one. */
  async save(slug: string | null, dto: SaveListingDto, actorId: string) {
    const existing = slug
      ? await this.prisma.product.findFirst({ where: { slug, deletedAt: null }, select: { ...LISTING_SELECT, id: true } })
      : null;
    if (slug && !existing) throw new NotFoundException('No product with this address.');

    const listing = this.normalise(dto);
    const category = await this.prisma.category.findUnique({ where: { slug: listing.categorySlug }, select: { id: true } });
    if (!category) throw new BadRequestException('Choose one of the listed categories.');

    this.checkBarcodes(listing);
    await this.checkBarcodesUnused(listing, existing?.id ?? null);

    const sapCodes = slug ? await this.prisma.sapItem.findMany({ where: { websiteProductId: slug }, select: { sapCode: true, websiteColour: true } }) : [];

    // A colour sold under its own SAP code keeps that link: removing it here
    // would leave the code pointing at nothing.
    if (existing) {
      const kept = new Set(listing.colours.map((c) => c.key));
      const orphaned = sapCodes.filter((s) => s.websiteColour && !kept.has(s.websiteColour));
      if (orphaned.length) {
        throw new ConflictException(
          `The colour "${orphaned[0].websiteColour}" is linked to SAP code ${orphaned[0].sapCode}. Unlink it on the SAP import page before removing the colour.`,
        );
      }
    }

    if (listing.status === 'ACTIVE') {
      const { blocking } = checkListing(listing, sapCodes.length > 0, existing?.status === ProductStatus.ACTIVE);
      if (blocking.length) throw new BadRequestException({ message: 'This product is not ready to publish.', problems: blocking });
    }

    if (existing && !dto.confirmPriceChange) {
      const percent = bigPriceChange(existing.priceInPaise, listing.priceInPaise);
      if (percent !== null) {
        throw new ConflictException({
          message: `The selling price changes by ${percent > 0 ? '+' : ''}${percent}%. Check it, then save again to confirm.`,
          needsConfirmation: true,
          percent,
        });
      }
    }

    const brandId = await this.brandId(listing.brandName);
    const data = {
      name: listing.name,
      description: listing.description,
      categoryId: category.id,
      brandId,
      status: ProductStatus[listing.status],
      priceInPaise: listing.priceInPaise,
      mrpInPaise: listing.mrpInPaise,
      inStock: listing.inStock,
      imageUrl: listing.gallery[0] ?? '',
      gallery: listing.gallery,
      sharedImages: listing.sharedImages,
      highlights: listing.highlights,
      specs: listing.specs.map((s) => [s.label, s.value]),
      modelNumber: listing.modelNumber,
      partNumber: listing.partNumber,
      ean: listing.ean,
      hsnCode: listing.hsnCode,
      gstRatePercent: listing.gstRatePercent,
      warranty: listing.warranty,
      inTheBox: listing.inTheBox,
    };
    const colours = listing.colours.map((c, position) => ({ ...c, position }));

    const finalSlug = await this.prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.product.update({ where: { id: existing.id }, data });
        await tx.productColour.deleteMany({ where: { productId: existing.id } });
        if (colours.length) await tx.productColour.createMany({ data: colours.map((c) => ({ ...c, productId: existing.id })) });
        await tx.auditLog.create({
          data: { actorId, action: 'PRODUCT_UPDATED', targetType: 'Product', targetId: existing.slug, metadata: { changes: this.changes(this.toForm(existing), listing) } as Prisma.InputJsonObject },
        });
        return existing.slug;
      }

      const taken = new Set((await tx.product.findMany({ select: { slug: true } })).map((p) => p.slug));
      const newSlug = uniqueSlug(slugify(listing.name), taken);
      const last = await tx.product.aggregate({ _max: { position: true } });
      await tx.product.create({
        data: { ...data, slug: newSlug, position: (last._max.position ?? -1) + 1, colours: { create: colours } },
      });
      await tx.auditLog.create({
        data: { actorId, action: 'PRODUCT_CREATED', targetType: 'Product', targetId: newSlug, metadata: { name: listing.name, status: listing.status } },
      });
      return newSlug;
    });

    this.catalogue.forget();
    return this.get(finalSlug);
  }

  /** The listing in the form's own shape. */
  private toForm(p: StoredListing) {
    return {
      name: p.name,
      categorySlug: p.category.slug,
      brandName: p.brand?.name ?? '',
      status: p.status,
      priceInPaise: p.priceInPaise,
      mrpInPaise: p.mrpInPaise,
      inStock: p.inStock,
      gallery: p.gallery,
      sharedImages: p.sharedImages,
      highlights: p.highlights,
      specs: specPairs(p.specs),
      description: p.description,
      modelNumber: p.modelNumber,
      partNumber: p.partNumber,
      ean: p.ean,
      hsnCode: p.hsnCode,
      gstRatePercent: p.gstRatePercent,
      warranty: p.warranty,
      inTheBox: p.inTheBox,
      colours: p.colours.map((c) => ({ ...c, inStock: c.inStock })),
    };
  }

  /** Trims text, drops empty highlights and specs, and turns blanks into null. */
  private normalise(dto: SaveListingDto) {
    const keys = new Set<string>();
    for (const c of dto.colours) {
      if (keys.has(c.key)) throw new BadRequestException(`Two colours share the key "${c.key}".`);
      keys.add(c.key);
    }
    return {
      name: dto.name.trim(),
      categorySlug: dto.categorySlug,
      brandName: dto.brandName.trim(),
      status: dto.status,
      priceInPaise: dto.priceInPaise,
      mrpInPaise: dto.mrpInPaise ?? null,
      inStock: dto.inStock,
      gallery: dto.gallery,
      sharedImages: dto.sharedImages,
      highlights: dto.highlights.map((h) => h.trim()).filter(Boolean),
      specs: dto.specs.map((s) => ({ label: s.label.trim(), value: s.value.trim() })).filter((s) => s.label && s.value),
      description: dto.description.trim(),
      modelNumber: clean(dto.modelNumber),
      partNumber: clean(dto.partNumber),
      ean: clean(dto.ean),
      hsnCode: clean(dto.hsnCode),
      gstRatePercent: dto.gstRatePercent ?? null,
      warranty: clean(dto.warranty),
      inTheBox: clean(dto.inTheBox),
      colours: dto.colours.map((c) => ({
        key: c.key,
        name: c.name.trim(),
        hex: c.hex.toUpperCase(),
        family: c.family.map((w) => w.trim().toLowerCase()).filter(Boolean),
        images: c.images,
        inStock: c.inStock ?? null,
        ean: clean(c.ean),
      })),
    };
  }

  private checkBarcodes(listing: ReturnType<ListingsService['normalise']>) {
    const all = [
      ...(listing.ean ? [{ code: listing.ean, where: 'The product' }] : []),
      ...listing.colours.filter((c) => c.ean).map((c) => ({ code: c.ean!, where: `${c.name}` })),
    ];
    for (const { code, where } of all) {
      if (!isValidGtin(code)) throw new BadRequestException(`${where}'s EAN ${code} is not a valid barcode: check the digits.`);
    }
    const seen = new Set<string>();
    for (const { code } of all) {
      if (seen.has(code)) throw new BadRequestException(`The EAN ${code} is used twice in this listing.`);
      seen.add(code);
    }
  }

  /** A barcode identifies one item: refuse one already on another product. */
  private async checkBarcodesUnused(listing: ReturnType<ListingsService['normalise']>, productId: string | null) {
    const codes = [listing.ean, ...listing.colours.map((c) => c.ean)].filter((c): c is string => !!c);
    if (codes.length === 0) return;
    const notThis = productId ? { not: productId } : undefined;
    const [onProduct, onColour] = await Promise.all([
      this.prisma.product.findFirst({ where: { ean: { in: codes }, id: notThis, deletedAt: null }, select: { ean: true, name: true } }),
      this.prisma.productColour.findFirst({
        where: { ean: { in: codes }, productId: notThis, product: { deletedAt: null } },
        select: { ean: true, name: true, product: { select: { name: true } } },
      }),
    ]);
    if (onProduct) throw new ConflictException(`The EAN ${onProduct.ean} is already on "${onProduct.name}".`);
    if (onColour) throw new ConflictException(`The EAN ${onColour.ean} is already on "${onColour.product.name}" (${onColour.name}).`);
  }

  /** The brand's id, matching an existing brand regardless of letter case,
   *  or a new brand. */
  private async brandId(name: string): Promise<string | null> {
    if (!name) return null;
    const found = await this.prisma.brand.findFirst({ where: { name: { equals: name, mode: 'insensitive' } }, select: { id: true } });
    if (found) return found.id;
    const taken = new Set((await this.prisma.brand.findMany({ select: { slug: true } })).map((b) => b.slug));
    const created = await this.prisma.brand.create({ data: { name, slug: uniqueSlug(slugify(name), taken) }, select: { id: true } });
    return created.id;
  }

  /** What changed, field by field, for the audit log. Lists are summarised. */
  private changes(before: ReturnType<ListingsService['toForm']>, after: ReturnType<ListingsService['normalise']>) {
    const out: { field: string; from: Prisma.InputJsonValue | null; to: Prisma.InputJsonValue | null }[] = [];
    for (const field of AUDITED) {
      const from = before[field] ?? null;
      const to = after[field] ?? null;
      if (from !== to) out.push({ field, from, to });
    }
    const listChange = (field: string, a: unknown, b: unknown, show: (x: unknown) => Prisma.InputJsonValue) => {
      if (JSON.stringify(a) !== JSON.stringify(b)) out.push({ field, from: show(a), to: show(b) });
    };
    const count = (x: unknown) => (Array.isArray(x) ? `${x.length} item(s)` : String(x));
    listChange('photos', before.gallery, after.gallery, count);
    listChange('highlights', before.highlights, after.highlights, count);
    listChange('specs', before.specs, after.specs, count);
    listChange(
      'colours',
      before.colours.map((c) => [c.key, c.ean, c.images.length]),
      after.colours.map((c) => [c.key, c.ean, c.images.length]),
      (x) => (Array.isArray(x) ? x.map((c) => (c as unknown[])[0]).join(', ') || 'none' : String(x)),
    );
    return out;
  }
}
