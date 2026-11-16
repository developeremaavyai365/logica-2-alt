import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { readSheet, SheetReadError } from '../sap-import/sheet-reader';
import { BulkContext, BulkPlan, ExistingProduct, MAX_BULK_ROWS, locateBulkHeader, planBulk } from './bulk-listing';
import { buildTemplate } from './bulk-template';
import { ChangeValue, SPEC_TEMPLATES, slugify, uniqueSlug } from './listing-rules';
import { LISTING_SELECT, changesMetadata, listingData, toListing, toTitleRule } from './listings.service';
import { ProductsService } from './products.service';

/** How much of each list goes back in a response; the totals are always complete. */
const SAMPLE_LIMIT = 100;
const ISSUE_LIMIT = 300;

export interface BulkSummary {
  fileName: string;
  headerRowNumber: number;
  columnsRead: string[];
  ignoredHeadings: string[];
  totals: { rows: number; toCreate: number; toUpdate: number; unchanged: number; rejected: number; warnings: number };
  /** Set when prices move by 40% or more: the upload is applied only once confirmed. */
  needsConfirmation: string | null;
  newBrands: string[];
  issues: BulkPlan['issues'];
  created: { rowNumber: number; name: string; category: string; status: string; priceInPaise: number }[];
  updated: { rowNumber: number; slug: string; name: string; changes: { field: string; from: ChangeValue; to: ChangeValue }[] }[];
  priceAlerts: BulkPlan['priceAlerts'];
}

/** A long value cut short for the preview; the audit log keeps it whole. */
const short = (value: ChangeValue): ChangeValue => (typeof value === 'string' && value.length > 140 ? `${value.slice(0, 140)}…` : value);

@Injectable()
export class BulkListingsService {
  private readonly logger = new Logger(BulkListingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogue: ProductsService,
  ) {}

  /** The sheet to fill in: for one category (with its spec columns) or all,
   *  blank or with the products already listed. */
  async template(categorySlug: string | null, withProducts: boolean) {
    const categories = await this.prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: 'asc' } });
    const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
    if (categorySlug && !category) throw new BadRequestException('Choose one of the listed categories.');

    const products = withProducts
      ? [...(await this.products()).existing.values()].filter((p) => !category || p.listing.categorySlug === category.slug)
      : [];
    const buffer = await buildTemplate({
      categories,
      category: category ?? null,
      specFields: category ? (SPEC_TEMPLATES[category.slug] ?? []) : [],
      products,
    });
    const name = `Logica products - ${category?.name ?? 'All categories'}${withProducts ? '' : ' (blank)'}.xlsx`;
    return { buffer, fileName: name };
  }

  /** Every product not deleted, in the shape the sheet is checked against. */
  private async products() {
    const [rows, links] = await Promise.all([
      this.prisma.product.findMany({ where: { deletedAt: null }, select: { ...LISTING_SELECT, id: true }, orderBy: { position: 'asc' } }),
      this.prisma.sapItem.findMany({ where: { websiteProductId: { not: null } }, select: { websiteProductId: true } }),
    ]);
    const linked = new Set(links.map((l) => l.websiteProductId));
    const existing = new Map<string, ExistingProduct>();
    const ids = new Map<string, string>();
    for (const row of rows) {
      existing.set(row.slug, { slug: row.slug, listing: toListing(row), linkedToSap: linked.has(row.slug) });
      ids.set(row.slug, row.id);
    }
    return { existing, ids };
  }

  private async context(): Promise<BulkContext & { ids: Map<string, string> }> {
    const [categories, brands, { existing, ids }, formats] = await Promise.all([
      this.prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: 'asc' } }),
      this.prisma.brand.findMany({ select: { name: true } }),
      this.products(),
      this.prisma.titleFormat.findMany({ select: { brandKey: true, categorySlug: true, pattern: true } }),
    ]);
    const barcodeOwners = new Map<string, { slug: string; name: string }>();
    for (const p of existing.values()) {
      for (const code of [p.listing.ean, ...p.listing.colours.map((c) => c.ean)]) {
        if (code) barcodeOwners.set(code, { slug: p.slug, name: p.listing.name });
      }
    }
    return { categories, brands: brands.map((b) => b.name), existing, barcodeOwners, ids, titleFormats: formats.map(toTitleRule) };
  }

  /** Reads and checks the sheet. Throws a 400, worded for the uploader,
   *  when the file as a whole cannot be used. */
  private async prepare(buffer: Buffer, fileName: string) {
    let rows;
    try {
      rows = await readSheet(buffer, fileName);
    } catch (err) {
      if (err instanceof SheetReadError) throw new BadRequestException(err.message);
      throw err;
    }
    if (rows.length === 0) throw new BadRequestException('This sheet is empty. Nothing was changed.');

    const header = locateBulkHeader(rows);
    if (!header) {
      throw new BadRequestException(
        'Could not find the row of column headings. Download the sheet from this page and keep its headings: it needs a "Title" or a "Product ID" column.',
      );
    }
    const dataRows = rows.slice(header.index + 1);
    if (dataRows.length === 0) throw new BadRequestException('The sheet has headings but no product rows. Nothing was changed.');
    if (dataRows.length > MAX_BULK_ROWS) {
      throw new BadRequestException(
        `The sheet has ${dataRows.length.toLocaleString('en-IN')} product rows; one upload takes up to ${MAX_BULK_ROWS.toLocaleString('en-IN')}. Split it into smaller sheets.`,
      );
    }

    const ctx = await this.context();
    const plan = planBulk(dataRows, header, ctx);
    const headings = rows[header.index].cells.map((c) => String(c ?? '').trim());
    const categoryName = new Map(ctx.categories.map((c) => [c.slug, c.name]));
    const errors = plan.issues.filter((i) => i.severity === 'error');

    const summary: BulkSummary = {
      fileName,
      headerRowNumber: rows[header.index].rowNumber,
      columnsRead: [...Object.values(header.columns), ...header.specColumns.map((s) => s.index)].sort((a, b) => a - b).map((i) => headings[i]),
      ignoredHeadings: header.ignored,
      totals: {
        rows: dataRows.length,
        toCreate: plan.toCreate.length,
        toUpdate: plan.toUpdate.length,
        unchanged: plan.unchanged,
        rejected: plan.rejected,
        warnings: plan.issues.length - errors.length,
      },
      needsConfirmation: plan.priceAlerts.length
        ? `${plan.priceAlerts.length} product${plan.priceAlerts.length === 1 ? '' : 's'} would change selling price by 40% or more. Check ${plan.priceAlerts.length === 1 ? 'it' : 'them'} below before applying.`
        : null,
      newBrands: plan.newBrands,
      // Errors first: they are the rows left out.
      issues: [...errors, ...plan.issues.filter((i) => i.severity === 'warning')].slice(0, ISSUE_LIMIT),
      created: plan.toCreate.slice(0, SAMPLE_LIMIT).map((c) => ({
        rowNumber: c.rowNumber,
        name: c.listing.name,
        category: categoryName.get(c.listing.categorySlug) ?? c.listing.categorySlug,
        status: c.listing.status,
        priceInPaise: c.listing.priceInPaise,
      })),
      updated: plan.toUpdate.slice(0, SAMPLE_LIMIT).map((u) => ({
        rowNumber: u.rowNumber,
        slug: u.slug,
        name: u.listing.name,
        changes: u.changes.map((c) => ({ field: c.field, from: short(c.from), to: short(c.to) })),
      })),
      priceAlerts: plan.priceAlerts,
    };
    return { plan, summary, ctx };
  }

  /** What uploading this sheet would do. Changes nothing. */
  async preview(buffer: Buffer, fileName: string): Promise<BulkSummary> {
    return (await this.prepare(buffer, fileName)).summary;
  }

  /** Adds and updates the products, all in one transaction: a failure part
   *  way leaves every product as it was. */
  async apply(buffer: Buffer, fileName: string, actorId: string, confirmPriceChanges: boolean) {
    const { plan, summary, ctx } = await this.prepare(buffer, fileName);
    if (summary.needsConfirmation && !confirmPriceChanges) throw new ConflictException(summary.needsConfirmation);
    if (plan.toCreate.length + plan.toUpdate.length === 0) {
      throw new BadRequestException('There is nothing to change: every row is either unchanged or has a problem to fix.');
    }

    const via = { via: 'bulk upload', fileName: fileName.slice(0, 255) };
    const created: string[] = [];
    await this.prisma.$transaction(
      async (tx) => {
        const categoryIds = new Map((await tx.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]));
        const brands = await tx.brand.findMany({ select: { id: true, name: true, slug: true } });
        const brandIds = new Map(brands.map((b) => [b.name.toLowerCase(), b.id]));
        const brandSlugs = new Set(brands.map((b) => b.slug));
        for (const name of plan.newBrands) {
          const slug = uniqueSlug(slugify(name), brandSlugs);
          brandSlugs.add(slug);
          const brand = await tx.brand.create({ data: { name, slug }, select: { id: true } });
          brandIds.set(name.toLowerCase(), brand.id);
        }
        const brandId = (name: string) => (name ? (brandIds.get(name.toLowerCase()) ?? null) : null);

        const audit: Prisma.AuditLogCreateManyInput[] = [];
        for (const update of plan.toUpdate) {
          const id = ctx.ids.get(update.slug)!;
          await tx.product.update({
            where: { id },
            data: listingData(update.listing, categoryIds.get(update.listing.categorySlug)!, brandId(update.listing.brandName)),
          });
          audit.push({ actorId, action: 'PRODUCT_UPDATED', targetType: 'Product', targetId: update.slug, metadata: changesMetadata(update.before, update.listing, via) });
        }

        // Addresses of deleted products stay taken: the column is unique.
        const taken = new Set((await tx.product.findMany({ select: { slug: true } })).map((p) => p.slug));
        let position = ((await tx.product.aggregate({ _max: { position: true } }))._max.position ?? -1) + 1;
        for (const { listing } of plan.toCreate) {
          const slug = uniqueSlug(slugify(listing.name), taken);
          taken.add(slug);
          await tx.product.create({
            data: { ...listingData(listing, categoryIds.get(listing.categorySlug)!, brandId(listing.brandName)), slug, position: position++ },
          });
          created.push(slug);
          audit.push({ actorId, action: 'PRODUCT_CREATED', targetType: 'Product', targetId: slug, metadata: { name: listing.name, status: listing.status, ...via } });
        }

        audit.push({
          actorId,
          action: 'PRODUCT_BULK_UPLOAD',
          targetType: 'ProductSheet',
          targetId: via.fileName,
          metadata: { ...summary.totals, created: plan.toCreate.length, updated: plan.toUpdate.length },
        });
        await tx.auditLog.createMany({ data: audit });
      },
      // A sheet of hundreds of products runs past the 5-second default.
      { maxWait: 10_000, timeout: 120_000 },
    );

    this.catalogue.forget();
    this.logger.log(
      `[BULK LISTING] "${fileName}" by ${actorId}: ${plan.toCreate.length} added, ${plan.toUpdate.length} updated, ` +
        `${plan.unchanged} unchanged, ${plan.rejected} rejected`,
    );
    return { ...summary, appliedAt: new Date().toISOString(), createdSlugs: created.slice(0, SAMPLE_LIMIT) };
  }
}
