import ExcelJS from 'exceljs';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { locateHeader, mapColumns } from './column-mapping';
import { largeRemovalWarning, planImport } from './import-plan';
import { toLiveEntries } from './live-catalogue';
import { toNumber, validateRows } from './row-validator';
import { SapImportService } from './sap-import.service';
import { ParsedItem, SheetRow, StoredItem } from './sap-import.types';
import { parseCsv, readSheet, SheetReadError } from './sheet-reader';

const HEADINGS = ['SAP Code', 'SAP Name', 'Model Name for Website', 'Available Stock', 'MRP', 'MOP', 'Brand', 'Part Number', 'EAN', 'Item Group'];

async function workbook(rows: unknown[][], sheetName = 'Sheet1'): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  rows.forEach((row) => ws.addRow(row));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

const dataRows = (rows: unknown[][], firstRowNumber = 2): SheetRow[] =>
  rows.map((cells, i) => ({ rowNumber: firstRowNumber + i, cells }));

const COLUMNS = mapColumns(HEADINGS).columns;

const stored = (overrides: Partial<StoredItem> & { sapCode: string }): StoredItem => ({
  sapName: 'SAP NAME',
  modelName: 'Model',
  stock: 5,
  mrpInPaise: 100_00,
  mopInPaise: 80_00,
  brand: null,
  partNumber: null,
  ean: null,
  itemGroup: null,
  inLatestFeed: true,
  ...overrides,
});

const parsed = (overrides: Partial<ParsedItem> & { sapCode: string }): ParsedItem => ({
  rowNumber: 2,
  sapName: 'SAP NAME',
  modelName: 'Model',
  stock: 5,
  mrpInPaise: 100_00,
  mopInPaise: 80_00,
  brand: null,
  partNumber: null,
  ean: null,
  itemGroup: null,
  ...overrides,
});

describe('column mapping', () => {
  it('matches the agreed headings', () => {
    const map = mapColumns(HEADINGS);
    expect(map.missing).toEqual([]);
    expect(map.unrecognised).toEqual([]);
    expect(map.columns).toEqual({
      sapCode: 0, sapName: 1, modelName: 2, stock: 3, mrp: 4, mop: 5, brand: 6, partNumber: 7, ean: 8, itemGroup: 9,
    });
  });

  it('matches the headings a SAP export typically uses, in any order', () => {
    const map = mapColumns(['Item Description', 'MOP (INR)', 'Item No.', 'Qty Available', 'M.R.P.', 'Website Model Name', 'Mfr Part No', 'EAN Code', 'Item Group Name']);
    expect(map.missing).toEqual([]);
    expect(map.columns.sapName).toBe(0);
    expect(map.columns.mop).toBe(1);
    expect(map.columns.sapCode).toBe(2);
    expect(map.columns.stock).toBe(3);
    expect(map.columns.mrp).toBe(4);
    expect(map.columns.modelName).toBe(5);
    expect(map.columns.partNumber).toBe(6);
    // "EAN Code" is a barcode, not the SAP code.
    expect(map.columns.ean).toBe(7);
    expect(map.columns.itemGroup).toBe(8);
  });

  it('reports required columns that are absent and headings it did not recognise', () => {
    const map = mapColumns(['SAP Code', 'Model Name', 'Stock', 'MRP', 'Warehouse']);
    expect(map.missing).toEqual(['sapName', 'mop']);
    expect(map.unrecognised).toEqual(['Warehouse']);
  });

  it('finds the heading row below a title and a blank line', () => {
    const rows: SheetRow[] = [
      { rowNumber: 1, cells: ['Logica Infoway — stock and price list'] },
      { rowNumber: 2, cells: ['Generated 13.10.2026'] },
      { rowNumber: 4, cells: HEADINGS },
      { rowNumber: 5, cells: ['100234', 'X', 'Y', 1, 2, 1] },
    ];
    expect(locateHeader(rows)?.index).toBe(2);
  });

  it('finds no heading row in a sheet of plain data', () => {
    expect(locateHeader([{ rowNumber: 1, cells: ['100234', 'HP LAP', 14, 52990, 41990] }])).toBeNull();
  });
});

describe('reading numbers', () => {
  it.each([
    [52990, 52990],
    ['52,990', 52990],
    ['₹ 1,29,990.00', 129990],
    ['Rs. 41990/-', 41990],
    ['  14 ', 14],
    ['-3', -3],
  ])('reads %p as %p', (input, expected) => expect(toNumber(input)).toBe(expected));

  it.each(['', 'N/A', 'twelve', '12 units', '1.2.3'])('rejects %p', (input) => expect(toNumber(input)).toBeNull());
});

describe('row validation', () => {
  it('accepts a clean row and converts money to paise', () => {
    const { items, issues } = validateRows(
      dataRows([[100234, 'HP LAP 15S I3', 'HP 15s Core i3 (8 GB / 512 GB)', 14, 52990, '41,990.50', 'HP', '7K0Y1PA', 8901234567890, 'Laptops']]),
      COLUMNS,
    );
    expect(issues).toEqual([]);
    expect(items).toEqual([
      {
        rowNumber: 2,
        sapCode: '100234',
        sapName: 'HP LAP 15S I3',
        modelName: 'HP 15s Core i3 (8 GB / 512 GB)',
        stock: 14,
        mrpInPaise: 5299000,
        mopInPaise: 4199050,
        brand: 'HP',
        partNumber: '7K0Y1PA',
        ean: '8901234567890',
        itemGroup: 'Laptops',
      },
    ]);
  });

  it('keeps leading zeros on a code typed as text', () => {
    const { items } = validateRows(dataRows([['000451', 'A', 'B', 1, 100, 90]]), COLUMNS);
    expect(items[0].sapCode).toBe('000451');
  });

  it('rejects rows with a missing code, a missing model name, a bad price or MOP above MRP', () => {
    const { items, issues } = validateRows(
      dataRows([
        ['', 'A', 'Model A', 1, 100, 90],
        ['C2', 'A', '', 1, 100, 90],
        ['C3', 'A', 'Model C', 1, 'call', 90],
        ['C4', 'A', 'Model D', 1, 100, 120],
        ['C5', 'A', 'Model E', 1, 100, 0],
        ['C6', 'A', 'Model F', 2.5, 100, 90],
        ['C7', 'A', 'Model G', 1, 100, 90],
      ]),
      COLUMNS,
    );
    expect(items.map((i) => i.sapCode)).toEqual(['C7']);
    const errors = issues.filter((i) => i.severity === 'error');
    expect(errors.map((e) => [e.rowNumber, e.field])).toEqual([
      [2, 'sapCode'],
      [3, 'modelName'],
      [4, 'mrp'],
      [5, 'mop'],
      [6, 'mop'],
      [7, 'stock'],
    ]);
    expect(errors[3].message).toContain('higher than MRP');
  });

  it('skips a repeated code and says which row had it first', () => {
    const { items, issues } = validateRows(
      dataRows([
        ['C1', 'A', 'First', 1, 100, 90],
        ['c1', 'A', 'Second', 9, 100, 90],
      ]),
      COLUMNS,
    );
    expect(items).toHaveLength(1);
    expect(items[0].modelName).toBe('First');
    expect(issues[0]).toMatchObject({ rowNumber: 3, severity: 'error', field: 'sapCode' });
    expect(issues[0].message).toContain('row 2');
  });

  it('stores negative stock as zero and drops a bad barcode, each with a warning', () => {
    const { items, issues } = validateRows(dataRows([['C1', 'A', 'Model', -4, 100, 90, '', '', 'ABC123']]), COLUMNS);
    expect(items[0]).toMatchObject({ stock: 0, ean: null });
    expect(issues.map((i) => [i.severity, i.field])).toEqual([
      ['warning', 'stock'],
      ['warning', 'ean'],
    ]);
  });

  it('falls back to the model name when the SAP name is blank', () => {
    const { items } = validateRows(dataRows([['C1', '', 'Model', 1, 100, 90]]), COLUMNS);
    expect(items[0].sapName).toBe('Model');
  });
});

describe('import plan', () => {
  it('separates new, changed and unchanged products', () => {
    const plan = planImport(
      [parsed({ sapCode: 'NEW' }), parsed({ sapCode: 'SAME' }), parsed({ sapCode: 'CHG', stock: 9, mopInPaise: 75_00 })],
      [stored({ sapCode: 'SAME' }), stored({ sapCode: 'CHG' }), stored({ sapCode: 'OTHER' })],
      'partial',
    );
    expect(plan.toCreate.map((i) => i.sapCode)).toEqual(['NEW']);
    expect(plan.unchanged).toBe(1);
    expect(plan.toUpdate).toHaveLength(1);
    expect(plan.toUpdate[0].changes).toEqual([
      { field: 'stock', from: 5, to: 9 },
      { field: 'mopInPaise', from: 80_00, to: 75_00 },
    ]);
    // A partial sheet leaves products it does not mention alone.
    expect(plan.missing).toEqual([]);
  });

  it('marks products a full sheet leaves out as missing, but not ones already out of the feed', () => {
    const plan = planImport(
      [parsed({ sapCode: 'A' })],
      [stored({ sapCode: 'A' }), stored({ sapCode: 'B', stock: 3 }), stored({ sapCode: 'C', inLatestFeed: false, stock: 0 })],
      'full',
    );
    expect(plan.missing).toEqual([{ sapCode: 'B', modelName: 'Model', stock: 3 }]);
  });

  it('treats a code coming back into the feed as an update even if nothing else changed', () => {
    const plan = planImport([parsed({ sapCode: 'A' })], [stored({ sapCode: 'A', inLatestFeed: false })], 'partial');
    expect(plan.unchanged).toBe(0);
    expect(plan.toUpdate[0]).toMatchObject({ returning: true, changes: [] });
  });

  it('matches codes regardless of letter case', () => {
    const plan = planImport([parsed({ sapCode: 'ab-1' })], [stored({ sapCode: 'AB-1' })], 'full');
    expect(plan.toCreate).toEqual([]);
    expect(plan.unchanged).toBe(1);
    expect(plan.missing).toEqual([]);
  });

  it('flags a selling-price move of 40% or more', () => {
    const plan = planImport(
      [parsed({ sapCode: 'A', mopInPaise: 8_00 }), parsed({ sapCode: 'B', mopInPaise: 70_00 })],
      [stored({ sapCode: 'A' }), stored({ sapCode: 'B' })],
      'partial',
    );
    expect(plan.priceAlerts).toEqual([{ sapCode: 'A', modelName: 'Model', fromPaise: 80_00, toPaise: 8_00, percent: -90 }]);
  });

  it('asks for confirmation when a full sheet would empty most of a real catalogue', () => {
    const existing = Array.from({ length: 30 }, (_, i) => stored({ sapCode: `S${i}` }));
    const mostlyMissing = planImport([parsed({ sapCode: 'S0' })], existing, 'full');
    expect(largeRemovalWarning(mostlyMissing, existing)).toContain('29 of the 30');

    const fewMissing = planImport(existing.slice(0, 25).map((e) => parsed({ sapCode: e.sapCode })), existing, 'full');
    expect(largeRemovalWarning(fewMissing, existing)).toBeNull();

    // Too small a catalogue for the share to mean anything.
    const tiny = [stored({ sapCode: 'A' }), stored({ sapCode: 'B' })];
    expect(largeRemovalWarning(planImport([], tiny, 'full'), tiny)).toBeNull();
  });
});

describe('reading the file', () => {
  it('reads an .xlsx, including numeric codes and formula cells', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Stock');
    ws.addRow(HEADINGS);
    ws.addRow([100234, 'HP LAP', 'HP 15s', 14, 52990, { formula: 'E2*0.8', result: 42392 }]);
    ws.addRow([]);
    ws.addRow(['100235', 'DELL LAP', { richText: [{ text: 'Dell ' }, { text: 'Inspiron' }] }, 0, 61990, 55990]);
    const rows = await readSheet(Buffer.from(await wb.xlsx.writeBuffer()), 'stock.xlsx');

    expect(rows.map((r) => r.rowNumber)).toEqual([1, 2, 4]);
    expect(rows[1].cells.slice(0, 6)).toEqual([100234, 'HP LAP', 'HP 15s', 14, 52990, 42392]);
    expect(rows[2].cells[2]).toBe('Dell Inspiron');
  });

  it('skips a leading empty sheet', async () => {
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet('Cover');
    wb.addWorksheet('Data').addRow(HEADINGS);
    const rows = await readSheet(Buffer.from(await wb.xlsx.writeBuffer()), 'stock.xlsx');
    expect(rows).toHaveLength(1);
  });

  it('reads a CSV with quoted fields, embedded commas and a semicolon separator', () => {
    expect(parseCsv('code,name,price\r\n100,"HP 15s, Silver","52,990"\r\n').map((r) => r.cells)).toEqual([
      ['code', 'name', 'price'],
      ['100', 'HP 15s, Silver', '52,990'],
    ]);
    expect(parseCsv('code;name\n100;"He said ""hi"""\n')[1].cells).toEqual(['100', 'He said "hi"']);
  });

  it('refuses an old .xls and anything that is not a sheet, with a usable message', async () => {
    await expect(readSheet(Buffer.from('x'), 'stock.xls')).rejects.toThrow(/Save As/);
    await expect(readSheet(Buffer.from('x'), 'photo.png')).rejects.toBeInstanceOf(SheetReadError);
    await expect(readSheet(Buffer.from('not a zip'), 'stock.xlsx')).rejects.toThrow(/could not be opened/);
  });
});

/** A stand-in for the database: enough of Prisma's surface for the service,
 *  holding rows in memory so the writes can be checked. */
function fakePrisma(initial: StoredItem[] = []) {
  const items = new Map(initial.map((item) => [item.sapCode, { ...item, lastImportId: null as string | null }]));
  const imports: Record<string, unknown>[] = [];
  const audit: Record<string, unknown>[] = [];

  const tx = {
    sapImport: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = { id: `imp-${imports.length + 1}`, createdAt: new Date('2026-10-13T10:00:00Z'), ...data };
        imports.push(row);
        return row;
      },
    },
    sapItem: {
      findMany: async () => [...items.values()],
      findUnique: async ({ where }: { where: { sapCode: string } }) => items.get(where.sapCode) ?? null,
      findFirst: async ({ where }: { where: { websiteProductId: string; websiteColour: string | null; sapCode: { not: string } } }) =>
        [...items.values()].find(
          (row) =>
            (row as Record<string, unknown>).websiteProductId === where.websiteProductId &&
            ((row as Record<string, unknown>).websiteColour ?? null) === where.websiteColour &&
            row.sapCode !== where.sapCode.not,
        ) ?? null,
      createMany: async ({ data }: { data: (StoredItem & { lastImportId: string })[] }) => {
        data.forEach((row) => items.set(row.sapCode, row));
      },
      update: async ({ where, data }: { where: { sapCode: string }; data: Partial<StoredItem> }) => {
        items.set(where.sapCode, { ...items.get(where.sapCode)!, ...data });
        return items.get(where.sapCode);
      },
      updateMany: async ({ where, data }: { where: { sapCode: { in: string[] } }; data: Partial<StoredItem> }) => {
        where.sapCode.in.forEach((code) => items.set(code, { ...items.get(code)!, ...data }));
      },
    },
    auditLog: { create: async ({ data }: { data: Record<string, unknown> }) => audit.push(data) },
  };

  const prisma = { ...tx, $transaction: async (run: (t: typeof tx) => unknown) => run(tx) };
  return { prisma, items, imports, audit };
}

describe('the import service', () => {
  const sheet = (rows: unknown[][]) => workbook([['Stock and price list'], [], HEADINGS, ...rows]);

  it('previews without writing anything', async () => {
    const db = fakePrisma([stored({ sapCode: '100', stock: 2 })]);
    const service = new SapImportService(db.prisma as never);

    const summary = await service.preview(
      await sheet([
        [100, 'HP LAP', 'Model', 7, 100, 80],
        [200, 'NEW LAP', 'New model', 3, 500, 450, 'Dell'],
        [300, 'BAD', 'Bad price', 1, 100, 900],
      ]),
      'stock.xlsx',
      'partial',
    );

    expect(summary.headerRowNumber).toBe(3);
    expect(summary.columns.modelName).toBe('Model Name for Website');
    expect(summary.totals).toEqual({ rows: 3, valid: 2, rejected: 1, warnings: 0, toCreate: 1, toUpdate: 1, unchanged: 0, missing: 0 });
    expect(summary.issues[0]).toMatchObject({ rowNumber: 6, sapCode: '300', field: 'mop' });
    expect(db.imports).toHaveLength(0);
    expect(db.items.get('100')?.stock).toBe(2);
  });

  it('applies a sheet: creates, updates, logs the import and the audit entry', async () => {
    const db = fakePrisma([stored({ sapCode: '100', stock: 2 })]);
    const service = new SapImportService(db.prisma as never);

    const result = await service.apply(
      await sheet([
        [100, 'HP LAP', 'Model', 7, 100, 80],
        [200, 'NEW LAP', 'New model', 3, 500, 450, 'Dell'],
      ]),
      'stock.xlsx',
      'partial',
      'admin-1',
      false,
    );

    expect(result.importId).toBe('imp-1');
    expect(db.items.get('100')).toMatchObject({ stock: 7, lastImportId: 'imp-1', inLatestFeed: true });
    expect(db.items.get('200')).toMatchObject({ modelName: 'New model', mopInPaise: 450_00, brand: 'Dell', lastImportId: 'imp-1' });
    expect(db.imports[0]).toMatchObject({ fileName: 'stock.xlsx', mode: 'PARTIAL', uploadedById: 'admin-1', createdCount: 1, updatedCount: 1 });
    expect(db.audit[0]).toMatchObject({ actorId: 'admin-1', action: 'SAP_IMPORT_APPLIED', targetId: 'imp-1' });
  });

  it('in full mode marks products the sheet leaves out as out of stock, without deleting them', async () => {
    const db = fakePrisma([stored({ sapCode: '100' }), stored({ sapCode: '900', stock: 12 })]);
    const service = new SapImportService(db.prisma as never);

    const result = await service.apply(await sheet([[100, 'HP LAP', 'Model', 5, 100, 80]]), 'stock.xlsx', 'full', 'admin-1', false);

    expect(result.totals.missing).toBe(1);
    expect(db.items.get('900')).toMatchObject({ stock: 0, inLatestFeed: false });
    expect(db.items.size).toBe(2);
  });

  it('refuses a full sheet that would empty most of the catalogue until it is confirmed', async () => {
    const existing = Array.from({ length: 30 }, (_, i) => stored({ sapCode: String(1000 + i) }));
    const db = fakePrisma(existing);
    const service = new SapImportService(db.prisma as never);
    const buffer = await sheet([[1000, 'HP LAP', 'Model', 5, 100, 80]]);

    await expect(service.apply(buffer, 'stock.xlsx', 'full', 'admin-1', false)).rejects.toBeInstanceOf(ConflictException);
    expect(db.imports).toHaveLength(0);
    expect(db.items.get('1005')?.stock).toBe(5);

    await service.apply(buffer, 'stock.xlsx', 'full', 'admin-1', true);
    expect(db.items.get('1005')).toMatchObject({ stock: 0, inLatestFeed: false });
  });

  it.each([
    ['an empty sheet', [] as unknown[][], /empty/],
    ['a sheet with no headings', [['100', 'HP', 5]], /column headings/],
    ['a sheet missing a required column', [['SAP Code', 'SAP Name', 'Model Name', 'Stock', 'MRP'], [1, 'a', 'b', 1, 2]], /no column for: MOP/],
    ['headings with no rows', [HEADINGS], /no product rows/],
    ['a sheet where every row is bad', [HEADINGS, ['', 'a', 'b', 1, 2, 1]], /None of the 1 rows/],
  ])('rejects %s and changes nothing', async (_name, rows, message) => {
    const db = fakePrisma([stored({ sapCode: '100' })]);
    const service = new SapImportService(db.prisma as never);
    const attempt = service.apply(await workbook(rows), 'stock.xlsx', 'full', 'admin-1', true);
    await expect(attempt).rejects.toBeInstanceOf(BadRequestException);
    await expect(attempt).rejects.toThrow(message);
    expect(db.imports).toHaveLength(0);
    expect(db.items.get('100')).toMatchObject({ stock: 5, inLatestFeed: true });
  });
});

describe('linking SAP codes to the shop', () => {
  const linkedStored = (sapCode: string, productId: string, colour: string | null, overrides: Partial<StoredItem> = {}) =>
    ({ ...stored({ sapCode, ...overrides }), websiteProductId: productId, websiteColour: colour }) as StoredItem;

  it('tells the shop price, MRP and availability in rupees, never the stock count', () => {
    const entries = toLiveEntries([
      { websiteProductId: 'iphone-16', websiteColour: 'blue', stock: 0, mrpInPaise: 79_900_00, mopInPaise: 74_900_00 },
      { websiteProductId: 'hp-laptop', websiteColour: null, stock: 14, mrpInPaise: 61_990_00, mopInPaise: 54_990_00 },
      { websiteProductId: null, websiteColour: null, stock: 3, mrpInPaise: 100_00, mopInPaise: 90_00 },
    ]);
    expect(entries).toEqual([
      { productId: 'hp-laptop', colour: null, price: 54_990, mrp: 61_990, inStock: true },
      { productId: 'iphone-16', colour: 'blue', price: 74_900, mrp: 79_900, inStock: false },
    ]);
    expect(JSON.stringify(entries)).not.toContain('stock');
  });

  it('links a code, and an import afterwards keeps the link while updating the price', async () => {
    const db = fakePrisma([stored({ sapCode: '100' })]);
    const service = new SapImportService(db.prisma as never);

    await service.link('100', 'hp-laptop', null, 'admin-1');
    expect(db.items.get('100')).toMatchObject({ websiteProductId: 'hp-laptop', websiteColour: null });
    expect(db.audit[0]).toMatchObject({ action: 'SAP_ITEM_LINKED', targetId: '100' });

    await service.apply(
      await workbook([HEADINGS, [100, 'HP LAP', 'Model', 9, 120, 99]]),
      'stock.xlsx',
      'partial',
      'admin-1',
      false,
    );
    expect(db.items.get('100')).toMatchObject({ websiteProductId: 'hp-laptop', mopInPaise: 99_00, stock: 9 });
  });

  it('refuses a second code for the same product and colour, but allows another colour', async () => {
    const db = fakePrisma([linkedStored('100', 'iphone-16', 'blue'), stored({ sapCode: '200' })]);
    const service = new SapImportService(db.prisma as never);

    await expect(service.link('200', 'iphone-16', 'blue', 'admin-1')).rejects.toThrow(/100 is already linked/);
    await service.link('200', 'iphone-16', 'black', 'admin-1');
    expect(db.items.get('200')).toMatchObject({ websiteProductId: 'iphone-16', websiteColour: 'black' });
  });

  it('unlinks, clearing the colour too', async () => {
    const db = fakePrisma([linkedStored('100', 'iphone-16', 'blue')]);
    const service = new SapImportService(db.prisma as never);

    await service.link('100', null, 'blue', 'admin-1');
    expect(db.items.get('100')).toMatchObject({ websiteProductId: null, websiteColour: null });
    expect(db.audit[0]).toMatchObject({ action: 'SAP_ITEM_UNLINKED' });
  });

  it('reports a code that is not in the feed', async () => {
    const service = new SapImportService(fakePrisma().prisma as never);
    await expect(service.link('nope', 'hp-laptop', null, 'admin-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
