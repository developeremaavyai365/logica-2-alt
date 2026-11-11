import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, SapImportMode } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { locateHeader } from './column-mapping';
import { ImportPlan, largeRemovalWarning, planImport } from './import-plan';
import { LiveEntry, toLiveEntries } from './live-catalogue';
import { validateRows } from './row-validator';
import { FIELD_LABELS, ImportMode, ParsedItem, RowIssue, SapField, StoredItem } from './sap-import.types';
import { readSheet, SheetReadError } from './sheet-reader';

/** How much of each list goes back in a response. The counts are always
 *  complete; only the examples are capped, so a sheet with thousands of
 *  changes does not produce a response of thousands of lines. */
const SAMPLE_LIMIT = 100;
const ISSUE_LIMIT = 300;
/** Rows written per database statement. */
const CHUNK = 500;

interface Analysis {
  headerRowNumber: number;
  /** Field → the heading it was read from, as written in the sheet. */
  columns: Partial<Record<SapField, string>>;
  unrecognisedHeadings: string[];
  dataRowCount: number;
  items: ParsedItem[];
  issues: RowIssue[];
}

export interface ImportSummary {
  fileName: string;
  mode: ImportMode;
  headerRowNumber: number;
  columns: Partial<Record<SapField, string>>;
  unrecognisedHeadings: string[];
  totals: {
    rows: number;
    valid: number;
    rejected: number;
    warnings: number;
    toCreate: number;
    toUpdate: number;
    unchanged: number;
    missing: number;
  };
  /** Set when a full sheet would take most of the catalogue out of stock —
   *  it will not be applied until the uploader confirms. */
  needsConfirmation: string | null;
  issues: RowIssue[];
  samples: {
    created: { sapCode: string; modelName: string; stock: number; mopInPaise: number; mrpInPaise: number }[];
    updated: { sapCode: string; modelName: string; returning: boolean; changes: ImportPlan['toUpdate'][number]['changes'] }[];
    missing: ImportPlan['missing'];
    priceAlerts: ImportPlan['priceAlerts'];
  };
}

export interface AppliedImport extends ImportSummary {
  importId: string;
  appliedAt: string;
}

const STORED_FIELDS = {
  sapCode: true,
  sapName: true,
  modelName: true,
  stock: true,
  mrpInPaise: true,
  mopInPaise: true,
  brand: true,
  partNumber: true,
  ean: true,
  itemGroup: true,
  inLatestFeed: true,
} as const;

function chunks<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

@Injectable()
export class SapImportService {
  private readonly logger = new Logger(SapImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Reads and checks the sheet. Throws a 400, worded for the uploader,
   *  when the file as a whole cannot be used. */
  private async analyse(buffer: Buffer, fileName: string): Promise<Analysis> {
    let rows;
    try {
      rows = await readSheet(buffer, fileName);
    } catch (err) {
      if (err instanceof SheetReadError) throw new BadRequestException(err.message);
      throw err;
    }

    if (rows.length === 0) {
      throw new BadRequestException('This sheet is empty. Nothing was changed.');
    }

    const header = locateHeader(rows);
    if (!header) {
      throw new BadRequestException(
        'Could not find the row of column headings. The sheet needs headings such as "SAP Code", "Model Name", "Stock", "MRP" and "MOP" above the data.',
      );
    }
    if (header.map.missing.length > 0) {
      const missing = header.map.missing.map((field) => FIELD_LABELS[field]).join(', ');
      const found = rows[header.index].cells.map((cell) => String(cell ?? '').trim()).filter(Boolean).join(', ');
      throw new BadRequestException(
        `The sheet has no column for: ${missing}. Headings found on row ${rows[header.index].rowNumber}: ${found}. Nothing was changed.`,
      );
    }

    const dataRows = rows.slice(header.index + 1);
    if (dataRows.length === 0) {
      throw new BadRequestException('The sheet has headings but no product rows. Nothing was changed.');
    }

    const { items, issues } = validateRows(dataRows, header.map.columns);
    if (items.length === 0) {
      throw new BadRequestException(
        `None of the ${dataRows.length} rows could be used — every one has a problem (first: row ${issues[0]?.rowNumber}, ${issues[0]?.message}) Nothing was changed.`,
      );
    }

    const headings = rows[header.index].cells;
    const columns: Partial<Record<SapField, string>> = {};
    for (const [field, index] of Object.entries(header.map.columns) as [SapField, number][]) {
      columns[field] = String(headings[index] ?? '').trim();
    }

    return {
      headerRowNumber: rows[header.index].rowNumber,
      columns,
      unrecognisedHeadings: header.map.unrecognised,
      dataRowCount: dataRows.length,
      items,
      issues,
    };
  }

  private summarise(fileName: string, mode: ImportMode, analysis: Analysis, plan: ImportPlan, existing: StoredItem[]): ImportSummary {
    const errors = analysis.issues.filter((issue) => issue.severity === 'error');
    // A row can raise more than one error; it is still one rejected row.
    const rejectedRows = new Set(errors.map((issue) => issue.rowNumber)).size;

    return {
      fileName,
      mode,
      headerRowNumber: analysis.headerRowNumber,
      columns: analysis.columns,
      unrecognisedHeadings: analysis.unrecognisedHeadings,
      totals: {
        rows: analysis.dataRowCount,
        valid: analysis.items.length,
        rejected: rejectedRows,
        warnings: analysis.issues.length - errors.length,
        toCreate: plan.toCreate.length,
        toUpdate: plan.toUpdate.length,
        unchanged: plan.unchanged,
        missing: plan.missing.length,
      },
      needsConfirmation: mode === 'full' ? largeRemovalWarning(plan, existing) : null,
      // Errors first — they are the ones that kept a product out.
      issues: [...errors, ...analysis.issues.filter((issue) => issue.severity === 'warning')].slice(0, ISSUE_LIMIT),
      samples: {
        created: plan.toCreate.slice(0, SAMPLE_LIMIT).map((item) => ({
          sapCode: item.sapCode,
          modelName: item.modelName,
          stock: item.stock,
          mopInPaise: item.mopInPaise,
          mrpInPaise: item.mrpInPaise,
        })),
        updated: plan.toUpdate.slice(0, SAMPLE_LIMIT).map((update) => ({
          sapCode: update.item.sapCode,
          modelName: update.item.modelName,
          returning: update.returning,
          changes: update.changes,
        })),
        missing: plan.missing.slice(0, SAMPLE_LIMIT),
        priceAlerts: plan.priceAlerts.slice(0, SAMPLE_LIMIT),
      },
    };
  }

  private async prepare(buffer: Buffer, fileName: string, mode: ImportMode) {
    const analysis = await this.analyse(buffer, fileName);
    const existing: StoredItem[] = await this.prisma.sapItem.findMany({ select: STORED_FIELDS });
    const plan = planImport(analysis.items, existing, mode);
    return { analysis, existing, plan, summary: this.summarise(fileName, mode, analysis, plan, existing) };
  }

  /** What applying this sheet would do. Changes nothing. */
  async preview(buffer: Buffer, fileName: string, mode: ImportMode): Promise<ImportSummary> {
    return (await this.prepare(buffer, fileName, mode)).summary;
  }

  /** Applies the sheet: creates the new codes, updates the changed ones
   *  and, for a full sheet, marks the missing ones out of stock — all in
   *  one transaction, so a failure part-way leaves the catalogue exactly as
   *  it was. */
  async apply(
    buffer: Buffer,
    fileName: string,
    mode: ImportMode,
    userId: string,
    confirmLargeRemoval: boolean,
  ): Promise<AppliedImport> {
    const { plan, summary } = await this.prepare(buffer, fileName, mode);

    if (summary.needsConfirmation && !confirmLargeRemoval) {
      throw new ConflictException(summary.needsConfirmation);
    }

    const record = await this.prisma.$transaction(
      async (tx) => {
        const created = await tx.sapImport.create({
          data: {
            fileName: fileName.slice(0, 255),
            mode: mode === 'full' ? SapImportMode.FULL : SapImportMode.PARTIAL,
            uploadedById: userId,
            totalRows: summary.totals.rows,
            createdCount: plan.toCreate.length,
            updatedCount: plan.toUpdate.length,
            unchangedCount: plan.unchanged,
            rejectedCount: summary.totals.rejected,
            missingCount: plan.missing.length,
            issues: summary.issues as unknown as Prisma.InputJsonValue,
          },
        });

        const row = (item: ParsedItem) => ({
          sapName: item.sapName,
          modelName: item.modelName,
          stock: item.stock,
          mrpInPaise: item.mrpInPaise,
          mopInPaise: item.mopInPaise,
          brand: item.brand,
          partNumber: item.partNumber,
          ean: item.ean,
          itemGroup: item.itemGroup,
          inLatestFeed: true,
          lastImportId: created.id,
        });

        for (const batch of chunks(plan.toCreate, CHUNK)) {
          await tx.sapItem.createMany({ data: batch.map((item) => ({ sapCode: item.sapCode, ...row(item) })) });
        }

        for (const update of plan.toUpdate) {
          await tx.sapItem.update({ where: { sapCode: update.item.sapCode }, data: row(update.item) });
        }

        for (const batch of chunks(plan.missing, CHUNK)) {
          await tx.sapItem.updateMany({
            where: { sapCode: { in: batch.map((item) => item.sapCode) } },
            data: { stock: 0, inLatestFeed: false, lastImportId: created.id },
          });
        }

        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: 'SAP_IMPORT_APPLIED',
            targetType: 'SapImport',
            targetId: created.id,
            metadata: { fileName, mode, ...summary.totals },
          },
        });

        return created;
      },
      // A sheet of a few thousand rows runs well past the 5-second default.
      { maxWait: 10_000, timeout: 180_000 },
    );

    this.logger.log(
      `[SAP IMPORT] applied ${record.id} "${fileName}" (${mode}) by ${userId}: ` +
        `${plan.toCreate.length} created, ${plan.toUpdate.length} updated, ${plan.unchanged} unchanged, ` +
        `${summary.totals.rejected} rejected, ${plan.missing.length} marked out of stock`,
    );

    return { ...summary, importId: record.id, appliedAt: record.createdAt.toISOString() };
  }

  /** The most recent imports, newest first. */
  async history(limit = 20) {
    const imports = await this.prisma.sapImport.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    const uploaderIds = [...new Set(imports.map((i) => i.uploadedById).filter((id): id is string => Boolean(id)))];
    const uploaders = uploaderIds.length
      ? await this.prisma.user.findMany({ where: { id: { in: uploaderIds } }, select: { id: true, name: true, email: true } })
      : [];
    const nameOf = new Map(uploaders.map((u) => [u.id, u.name || u.email || 'Unknown']));

    return imports.map((i) => ({
      id: i.id,
      fileName: i.fileName,
      mode: i.mode === SapImportMode.FULL ? 'full' : 'partial',
      uploadedBy: i.uploadedById ? (nameOf.get(i.uploadedById) ?? 'Deleted account') : 'Unknown',
      appliedAt: i.createdAt.toISOString(),
      totals: {
        rows: i.totalRows,
        created: i.createdCount,
        updated: i.updatedCount,
        unchanged: i.unchangedCount,
        rejected: i.rejectedCount,
        missing: i.missingCount,
      },
    }));
  }

  /** The stored feed, a page at a time, optionally narrowed by a search on
   *  code, name, brand or part number, and by whether a code is linked to a
   *  website product. */
  async items(search: string | undefined, page: number, pageSize: number, linked?: 'yes' | 'no') {
    const term = search?.trim();
    const where: Prisma.SapItemWhereInput = {
      ...(term
        ? {
            OR: [
              { sapCode: { contains: term, mode: 'insensitive' } },
              { modelName: { contains: term, mode: 'insensitive' } },
              { sapName: { contains: term, mode: 'insensitive' } },
              { brand: { contains: term, mode: 'insensitive' } },
              { partNumber: { contains: term, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(linked === 'yes' ? { websiteProductId: { not: null } } : linked === 'no' ? { websiteProductId: null } : {}),
    };

    const [total, rows, inFeed, inStock, linkedCount] = await Promise.all([
      this.prisma.sapItem.count({ where }),
      this.prisma.sapItem.findMany({
        where,
        orderBy: [{ inLatestFeed: 'desc' }, { modelName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { ...STORED_FIELDS, websiteProductId: true, websiteColour: true, updatedAt: true },
      }),
      this.prisma.sapItem.count({ where: { inLatestFeed: true } }),
      this.prisma.sapItem.count({ where: { inLatestFeed: true, stock: { gt: 0 } } }),
      this.prisma.sapItem.count({ where: { websiteProductId: { not: null } } }),
    ]);

    return { total, page, pageSize, catalogue: { inFeed, inStock, linked: linkedCount }, items: rows };
  }

  /** Links a SAP code to the website product it is sold as — the whole
   *  product, or one colour of it — or unlinks it when `productId` is null.
   *  One code per product-and-colour: linking a second code to the same
   *  place is refused, naming the code already there. */
  async link(sapCode: string, productId: string | null, colour: string | null, userId: string) {
    const item = await this.prisma.sapItem.findUnique({ where: { sapCode }, select: { sapCode: true } });
    if (!item) throw new NotFoundException(`No SAP code "${sapCode}" in the feed.`);

    const websiteColour = productId ? colour : null;
    if (productId) {
      const taken = await this.prisma.sapItem.findFirst({
        where: { websiteProductId: productId, websiteColour, sapCode: { not: sapCode } },
        select: { sapCode: true },
      });
      if (taken) {
        throw new ConflictException(
          `SAP code ${taken.sapCode} is already linked to this ${websiteColour ? 'colour' : 'product'}. Unlink it first.`,
        );
      }
    }

    const updated = await this.prisma.sapItem.update({
      where: { sapCode },
      data: { websiteProductId: productId, websiteColour },
      select: { ...STORED_FIELDS, websiteProductId: true, websiteColour: true, updatedAt: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: productId ? 'SAP_ITEM_LINKED' : 'SAP_ITEM_UNLINKED',
        targetType: 'SapItem',
        targetId: sapCode,
        metadata: { productId, colour: websiteColour },
      },
    });

    return updated;
  }

  /** Price, MRP and availability of every linked code, for the shop. */
  async live(): Promise<LiveEntry[]> {
    const rows = await this.prisma.sapItem.findMany({
      where: { websiteProductId: { not: null } },
      select: { websiteProductId: true, websiteColour: true, stock: true, mrpInPaise: true, mopInPaise: true },
    });
    return toLiveEntries(rows);
  }
}
