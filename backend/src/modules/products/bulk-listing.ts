import { toNumber } from '../sap-import/row-validator';
import { SheetRow } from '../sap-import/sap-import.types';
import {
  FieldChange,
  GST_RATES,
  Listing,
  barcodeProblem,
  bigPriceChange,
  checkListing,
  isValidGtin,
  listingChanges,
} from './listing-rules';

/* Adding and editing products in bulk from a sheet, apart from the database
   so it can be tested on its own.

   One row is one product. A row with a Product ID edits that product; a row
   without one adds a new product. A column left out of the sheet leaves that
   field as it is; a blank cell in a column that is there clears the field
   (status and stock aside, where blank means "as it is", or Draft and in
   stock for a new product). Colours are edited on the product's own page,
   never by the sheet. */

export type BulkField =
  | 'slug'
  | 'name'
  | 'category'
  | 'brand'
  | 'status'
  | 'price'
  | 'mrp'
  | 'inStock'
  | 'modelNumber'
  | 'partNumber'
  | 'ean'
  | 'hsnCode'
  | 'gstRatePercent'
  | 'warranty'
  | 'inTheBox'
  | 'highlights'
  | 'description'
  | 'photos'
  | 'otherSpecs';

export interface BulkColumn {
  field: BulkField;
  heading: string;
  /** Other headings read as this column. */
  aliases: string[];
  /** Shown as a note on the heading in the template. */
  note: string;
  width: number;
}

export const BULK_COLUMNS: BulkColumn[] = [
  {
    field: 'slug',
    heading: 'Product ID',
    aliases: ['id', 'slug', 'productslug', 'productaddress'],
    note: 'Leave blank to add a new product. For a product already on the site this is filled in: do not change it.',
    width: 30,
  },
  { field: 'name', heading: 'Title *', aliases: ['producttitle', 'name', 'productname'], note: 'The product name shoppers see. Up to 200 characters.', width: 44 },
  { field: 'category', heading: 'Category *', aliases: ['categoryname'], note: 'Pick from the list.', width: 18 },
  { field: 'brand', heading: 'Brand *', aliases: ['brandname', 'make'], note: 'A brand not used before is added.', width: 16 },
  {
    field: 'status',
    heading: 'Status',
    aliases: ['listingstatus'],
    note: 'Draft: saved, not on the shop. Active: on the shop. Inactive: taken off the shop. Blank keeps it as it is (Draft for a new product).',
    width: 12,
  },
  {
    field: 'price',
    heading: 'Selling price (₹)',
    aliases: ['sellingprice', 'price', 'mop', 'offerprice', 'saleprice'],
    note: 'In rupees. Ignored for a product linked to a SAP code: the SAP sheet sets its price.',
    width: 16,
  },
  { field: 'mrp', heading: 'MRP (₹)', aliases: ['mrp', 'maximumretailprice'], note: 'In rupees. Ignored for a product linked to a SAP code.', width: 14 },
  {
    field: 'inStock',
    heading: 'In stock',
    aliases: ['stock', 'available'],
    note: 'Yes or No. Ignored for a product linked to a SAP code: the SAP sheet sets its stock.',
    width: 10,
  },
  { field: 'modelNumber', heading: 'Model number', aliases: ['modelno', 'model'], note: 'Up to 60 characters.', width: 18 },
  { field: 'partNumber', heading: 'Part number', aliases: ['partno', 'mpn', 'manufacturerpartnumber'], note: 'Up to 60 characters.', width: 18 },
  { field: 'ean', heading: 'EAN / barcode', aliases: ['ean', 'barcode', 'gtin', 'upc', 'eancode'], note: 'The 8, 12, 13 or 14 digits under the barcode.', width: 18 },
  { field: 'hsnCode', heading: 'HSN code', aliases: ['hsn', 'hsncode', 'hsnsac'], note: '4 to 8 digits.', width: 12 },
  { field: 'gstRatePercent', heading: 'GST %', aliases: ['gst', 'gstrate', 'gstpercent', 'taxrate'], note: 'One of 0, 5, 12, 18 or 28.', width: 9 },
  { field: 'warranty', heading: 'Warranty', aliases: ['warrantyperiod'], note: 'e.g. 1 year onsite warranty.', width: 24 },
  { field: 'inTheBox', heading: 'In the box', aliases: ['whatsinthebox', 'boxcontents', 'inbox'], note: 'e.g. Laptop, charger, user guide.', width: 24 },
  {
    field: 'highlights',
    heading: 'Key highlights',
    aliases: ['highlights', 'keyfeatures', 'features'],
    note: 'One per line (Alt+Enter starts a new line in a cell). At least 3 recommended.',
    width: 40,
  },
  { field: 'description', heading: 'Description', aliases: ['overview', 'productdescription', 'about'], note: 'Up to 8,000 characters.', width: 40 },
  {
    field: 'photos',
    heading: 'Photos',
    aliases: ['photo', 'images', 'image', 'imageurls', 'photourls', 'photolinks'],
    note: 'Web addresses of the photos, one per line, main photo first. Photos can also be uploaded on the product page.',
    width: 40,
  },
  {
    field: 'otherSpecs',
    heading: 'Other specs',
    aliases: ['specs', 'specifications', 'otherspecifications', 'morespecs'],
    note: 'Any other specs, one per line, as Label: value. For example "Item Weight: 1.6 kg".',
    width: 40,
  },
];

/** Spec columns are headed "Spec: <label>", with " *" on the required ones. */
export const SPEC_PREFIX = 'Spec: ';

export const MAX_BULK_ROWS = 1000;
/** ₹1 crore: anything above is a typo, or a barcode in the price column. */
const MAX_PRICE_RUPEES = 10_000_000;
const PHOTO = /^(\/[\w\-./%]+|https?:\/\/[^\s"'<>]+)$/;

const key = (heading: unknown) =>
  String(heading ?? '')
    .toLowerCase()
    .replace(/\(₹\)|\(rs\.?\)|\(inr\)|\*/g, '')
    .replace(/[^a-z0-9%]/g, '')
    .replace(/%/g, 'percent');

const KNOWN = new Map<string, BulkField>();
for (const column of BULK_COLUMNS) {
  for (const name of [column.heading, ...column.aliases]) KNOWN.set(key(name), column.field);
}
KNOWN.set('gst', 'gstRatePercent');

export interface BulkHeader {
  /** Index into the rows of the heading row. */
  index: number;
  columns: Partial<Record<BulkField, number>>;
  specColumns: { label: string; index: number }[];
  /** Headings that were not recognised, so are not read. */
  ignored: string[];
}

function readHeadings(cells: unknown[]): Omit<BulkHeader, 'index'> {
  const columns: Partial<Record<BulkField, number>> = {};
  const specColumns: { label: string; index: number }[] = [];
  const ignored: string[] = [];
  cells.forEach((cell, index) => {
    const text = String(cell ?? '').trim();
    if (!text) return;
    const spec = /^spec\s*:\s*(.+?)\s*\*?\s*$/i.exec(text);
    if (spec) {
      if (!specColumns.some((s) => s.label.toLowerCase() === spec[1].toLowerCase())) specColumns.push({ label: spec[1], index });
      return;
    }
    const field = KNOWN.get(key(text));
    if (field && columns[field] === undefined) columns[field] = index;
    else ignored.push(text);
  });
  return { columns, specColumns, ignored };
}

/** The row of headings: the first of the opening rows with a Title or a
 *  Product ID column, and one more it knows. (Product ID and Selling price
 *  alone is a price update.) */
export function locateBulkHeader(rows: SheetRow[]): BulkHeader | null {
  for (let index = 0; index < Math.min(rows.length, 10); index++) {
    const found = readHeadings(rows[index].cells);
    const recognised = Object.keys(found.columns).length + found.specColumns.length;
    if ((found.columns.name !== undefined || found.columns.slug !== undefined) && recognised >= 2) return { index, ...found };
  }
  return null;
}

export interface ExistingProduct {
  slug: string;
  listing: Listing;
  linkedToSap: boolean;
}

export interface BulkContext {
  categories: { slug: string; name: string }[];
  brands: string[];
  /** Products not deleted, by Product ID. */
  existing: Map<string, ExistingProduct>;
  /** Barcodes in use, product's own or a colour's, and whose they are. */
  barcodeOwners: Map<string, { slug: string; name: string }>;
}

export interface BulkIssue {
  rowNumber: number;
  product: string | null;
  severity: 'error' | 'warning';
  message: string;
}

export interface PlannedCreate {
  rowNumber: number;
  listing: Listing;
}

export interface PlannedUpdate {
  rowNumber: number;
  slug: string;
  before: Listing;
  listing: Listing;
  changes: FieldChange[];
}

export interface PriceAlert {
  rowNumber: number;
  slug: string;
  name: string;
  fromPaise: number;
  toPaise: number;
  percent: number;
}

export interface BulkPlan {
  toCreate: PlannedCreate[];
  toUpdate: PlannedUpdate[];
  unchanged: number;
  /** Rows left out because of an error. */
  rejected: number;
  issues: BulkIssue[];
  priceAlerts: PriceAlert[];
  /** Brands the sheet uses that are not on the site yet. */
  newBrands: string[];
}

/* Text is kept as typed apart from its ends: a sheet downloaded and uploaded
   again untouched must change nothing, and existing listings hold bullets,
   double spaces and non-breaking spaces of their own. */

/** A one-line value: a line break inside it becomes a space. */
const single = (value: unknown): string => cellString(value).replace(/\s*\n\s*/g, ' ').trim();

/** A value that may hold several lines, each trimmed, blank lines dropped. */
const lines = (value: unknown): string[] =>
  cellString(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

function cellString(value: unknown): string {
  if (value === null || value === undefined) return '';
  // Whole numbers come back as Excel stored them; a barcode is never shown
  // in scientific notation here.
  if (typeof value === 'number') return Number.isInteger(value) ? value.toFixed(0) : String(value);
  return String(value).replace(/\r\n?/g, '\n');
}

const NEW_PRODUCT: Listing = {
  name: '',
  categorySlug: '',
  brandName: '',
  status: 'DRAFT',
  priceInPaise: 0,
  mrpInPaise: null,
  inStock: true,
  gallery: [],
  sharedImages: [],
  highlights: [],
  specs: [],
  description: '',
  modelNumber: null,
  partNumber: null,
  ean: null,
  hsnCode: null,
  gstRatePercent: null,
  warranty: null,
  inTheBox: null,
  colours: [],
};

const STATUS_WORDS: Record<string, Listing['status']> = {
  draft: 'DRAFT',
  active: 'ACTIVE',
  live: 'ACTIVE',
  ontheshop: 'ACTIVE',
  published: 'ACTIVE',
  inactive: 'INACTIVE',
  offtheshop: 'INACTIVE',
  hidden: 'INACTIVE',
};
const YES = new Set(['yes', 'y', 'true', '1', 'instock']);
const NO = new Set(['no', 'n', 'false', '0', 'outofstock']);

/** Splits a cell of photo addresses: one per line, or separated by spaces,
 *  semicolons, or a comma before the next address (addresses may hold
 *  commas of their own). */
const photoList = (value: unknown) =>
  cellString(value)
    .split(/[\s;]+|,(?=\s*(?:https?:\/\/|\/))/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Reads every row against the catalogue as it is: what would be added,
 *  what would change, and what is wrong. Changes nothing. */
export function planBulk(rows: SheetRow[], header: BulkHeader, ctx: BulkContext): BulkPlan {
  const plan: BulkPlan = { toCreate: [], toUpdate: [], unchanged: 0, rejected: 0, issues: [], priceAlerts: [], newBrands: [] };
  const categoryByKey = new Map(ctx.categories.flatMap((c) => [[key(c.slug), c] as const, [key(c.name), c] as const]));
  const brandByKey = new Map(ctx.brands.map((b) => [b.toLowerCase(), b]));
  const newBrands = new Map<string, string>();
  const slugRows = new Map<string, number>();
  const barcodeRows = new Map<string, number>();
  const existingNames = new Map([...ctx.existing.values()].map((p) => [p.listing.name.toLowerCase(), p.slug]));
  const newNames = new Map<string, number>();

  const has = (field: BulkField) => header.columns[field] !== undefined;

  for (const row of rows) {
    const cell = (field: BulkField): unknown => (has(field) ? row.cells[header.columns[field]!] : undefined);
    const errors: string[] = [];
    const warnings: string[] = [];

    const slug = single(cell('slug')).toLowerCase();
    const existing = slug ? ctx.existing.get(slug) : undefined;
    const label = single(cell('name')) || existing?.listing.name || slug || null;
    const report = (severity: 'error' | 'warning', messages: string[]) =>
      messages.forEach((message) => plan.issues.push({ rowNumber: row.rowNumber, product: label, severity, message }));

    if (slug && !existing) {
      report('error', [`No product has the ID "${slug}". Leave the Product ID blank to add a new product.`]);
      plan.rejected++;
      continue;
    }
    if (slug && slugRows.has(slug)) {
      report('error', [`This product is also on row ${slugRows.get(slug)}. Only that row was read.`]);
      plan.rejected++;
      continue;
    }
    if (slug) slugRows.set(slug, row.rowNumber);

    const base = existing?.listing ?? NEW_PRODUCT;
    const next: Listing = { ...base, specs: base.specs.map((s) => ({ ...s })), colours: base.colours };

    // Title, category and brand.
    if (has('name')) next.name = single(cell('name'));
    if (!next.name) errors.push(has('name') ? 'No title.' : 'No title: the sheet needs a Title column to add products.');
    else if (next.name.length > 200) errors.push(`The title is ${next.name.length} characters; the most is 200.`);
    if (has('category')) {
      const text = single(cell('category'));
      const found = categoryByKey.get(key(text));
      if (!text) errors.push('No category.');
      else if (!found) errors.push(`"${text}" is not a category. Use one of: ${ctx.categories.map((c) => c.name).join(', ')}.`);
      else next.categorySlug = found.slug;
    } else if (!existing) {
      errors.push('No category: the sheet needs a Category column to add products.');
    }
    if (has('brand')) {
      const text = single(cell('brand'));
      if (text.length > 60) errors.push('The brand is longer than 60 characters.');
      const known = brandByKey.get(text.toLowerCase()) ?? newBrands.get(text.toLowerCase());
      if (text && !known) {
        newBrands.set(text.toLowerCase(), text);
        warnings.push(`"${text}" is a new brand; it will be added.`);
      }
      next.brandName = known ?? text;
    }

    // Status.
    if (has('status')) {
      const text = single(cell('status'));
      if (text) {
        const status = STATUS_WORDS[key(text)];
        if (status) next.status = status;
        else errors.push(`Status "${text}" should be Draft, Active or Inactive.`);
      }
    }

    // Price and stock.
    const rupees = (field: 'price' | 'mrp', name: string): number | null | undefined => {
      if (!has(field)) return undefined;
      const raw = cell(field);
      if (single(raw) === '') return null;
      const value = toNumber(raw);
      if (value === null) errors.push(`${name} "${single(raw)}" is not a number.`);
      else if (value < 0) errors.push(`${name} cannot be below zero.`);
      else if (value > MAX_PRICE_RUPEES) errors.push(`${name} ${value} is implausibly high.`);
      else return Math.round(value * 100);
      return undefined;
    };
    const price = rupees('price', 'The selling price');
    if (price !== undefined) next.priceInPaise = price ?? 0;
    const mrp = rupees('mrp', 'The MRP');
    if (mrp !== undefined) next.mrpInPaise = mrp;
    if (has('inStock')) {
      const text = key(single(cell('inStock')));
      if (YES.has(text)) next.inStock = true;
      else if (NO.has(text)) next.inStock = false;
      else if (text) errors.push(`In stock "${single(cell('inStock'))}" should be Yes or No.`);
    }
    if (existing?.linkedToSap) {
      const ignored = next.priceInPaise !== base.priceInPaise || next.mrpInPaise !== base.mrpInPaise || next.inStock !== base.inStock;
      next.priceInPaise = base.priceInPaise;
      next.mrpInPaise = base.mrpInPaise;
      next.inStock = base.inStock;
      if (ignored) warnings.push("Linked to a SAP code, so the SAP sheet sets its price and stock: this sheet's price, MRP and stock were not used.");
    }

    // Short text.
    const text = (field: 'modelNumber' | 'partNumber' | 'warranty' | 'inTheBox', name: string, max: number) => {
      if (!has(field)) return;
      const value = single(cell(field));
      if (value.length > max) errors.push(`${name} is longer than ${max} characters.`);
      next[field] = value || null;
    };
    text('modelNumber', 'The model number', 60);
    text('partNumber', 'The part number', 60);
    text('warranty', 'The warranty', 300);
    text('inTheBox', '"In the box"', 500);

    // Barcode and tax.
    if (has('ean')) {
      const raw = single(cell('ean')).replace(/[\s-]/g, '');
      if (!raw) next.ean = null;
      else if (!isValidGtin(raw)) errors.push(`EAN "${single(cell('ean'))}" is not a valid barcode: check the digits.`);
      else next.ean = raw;
    }
    if (has('hsnCode')) {
      const raw = single(cell('hsnCode')).replace(/\s/g, '');
      if (!raw) next.hsnCode = null;
      else if (!/^\d{4,8}$/.test(raw)) errors.push(`HSN code "${raw}" should be 4 to 8 digits.`);
      else next.hsnCode = raw;
    }
    if (has('gstRatePercent')) {
      const raw = cell('gstRatePercent');
      const shown = single(raw);
      if (!shown) next.gstRatePercent = null;
      else {
        let rate = toNumber(shown.replace(/%$/, ''));
        // A cell formatted as a percentage holds 18% as 0.18.
        if (typeof raw === 'number' && raw > 0 && raw < 1) rate = Math.round(raw * 100);
        if (rate !== null && GST_RATES.includes(rate)) next.gstRatePercent = rate;
        else errors.push(`GST % "${shown}" should be one of ${GST_RATES.join(', ')}.`);
      }
    }

    // Highlights, description and photos.
    if (has('highlights')) {
      next.highlights = lines(cell('highlights'));
      if (next.highlights.length > 30) errors.push(`${next.highlights.length} key highlights; the most is 30.`);
      if (next.highlights.some((h) => h.length > 1000)) errors.push('A key highlight is longer than 1,000 characters.');
    }
    if (has('description')) {
      next.description = cellString(cell('description')).trim();
      if (next.description.length > 8000) errors.push(`The description is ${next.description.length} characters; the most is 8,000.`);
    }
    if (has('photos')) {
      next.gallery = photoList(cell('photos'));
      const bad = next.gallery.find((p) => !PHOTO.test(p) || p.length > 2000);
      if (bad) errors.push(`Photo "${bad.slice(0, 80)}" is not a web address. Use addresses starting with https:// or /.`);
      if (next.gallery.length > 20) errors.push(`${next.gallery.length} photos; the most is 20.`);
    }

    // Specs: each spec column sets or clears its label in place; "Other
    // specs" sets the rest, keeping the order of the ones already there.
    const columnLabels = new Set(header.specColumns.map((s) => s.label.toLowerCase()));
    const setSpec = (label: string, value: string) => {
      const at = next.specs.findIndex((s) => s.label.toLowerCase() === label.toLowerCase());
      if (!value) {
        if (at >= 0) next.specs.splice(at, 1);
      } else if (at >= 0) next.specs[at] = { label: next.specs[at].label, value };
      else next.specs.push({ label, value });
    };
    for (const spec of header.specColumns) setSpec(spec.label, single(row.cells[spec.index]));
    if (has('otherSpecs')) {
      const others = new Map<string, { label: string; value: string }>();
      for (const line of lines(cell('otherSpecs'))) {
        const colon = line.indexOf(':');
        const specLabel = colon > 0 ? line.slice(0, colon).trim() : '';
        const value = colon > 0 ? line.slice(colon + 1).trim() : '';
        if (!specLabel || !value) errors.push(`Other specs: "${line.slice(0, 60)}" needs a label and a value, like "Item Weight: 1.6 kg".`);
        else if (specLabel.length > 80) errors.push(`Other specs: the label "${specLabel.slice(0, 40)}…" is longer than 80 characters.`);
        else others.set(specLabel.toLowerCase(), { label: specLabel, value });
      }
      next.specs = next.specs.filter((s) => columnLabels.has(s.label.toLowerCase()) || others.has(s.label.toLowerCase()));
      for (const { label: specLabel, value } of others.values()) setSpec(specLabel, value);
    }
    if (next.specs.length > 60) errors.push(`${next.specs.length} specs; the most is 60.`);
    if (next.specs.some((s) => s.value.length > 3000)) errors.push('A spec value is longer than 3,000 characters.');

    // Barcodes: valid, not used twice here, not on another product.
    if (errors.length === 0) {
      const problem = barcodeProblem(next);
      if (problem) errors.push(problem);
      for (const code of [next.ean, ...next.colours.map((c) => c.ean)]) {
        if (!code) continue;
        const owner = ctx.barcodeOwners.get(code);
        if (owner && owner.slug !== slug) errors.push(`The EAN ${code} is already on "${owner.name}".`);
        else if (barcodeRows.has(code)) errors.push(`The EAN ${code} is also on row ${barcodeRows.get(code)}.`);
      }
    }

    // On the shop only when it is ready, as the product page requires.
    if (errors.length === 0 && next.status === 'ACTIVE') {
      const { blocking } = checkListing(next, existing?.linkedToSap ?? false, base.status === 'ACTIVE' && !!existing);
      if (blocking.length) errors.push(`Not ready to be Active: ${blocking.join(' ')} Set its Status to Draft to save it anyway.`);
    }

    if (errors.length) {
      report('error', errors);
      report('warning', warnings);
      plan.rejected++;
      continue;
    }
    report('warning', warnings);
    for (const code of [next.ean, ...next.colours.map((c) => c.ean)]) if (code) barcodeRows.set(code, row.rowNumber);

    if (existing) {
      const changes = listingChanges(base, next);
      if (changes.length === 0) {
        plan.unchanged++;
        continue;
      }
      plan.toUpdate.push({ rowNumber: row.rowNumber, slug, before: base, listing: next, changes });
      const percent = existing.linkedToSap ? null : bigPriceChange(base.priceInPaise, next.priceInPaise);
      if (percent !== null) {
        plan.priceAlerts.push({ rowNumber: row.rowNumber, slug, name: next.name, fromPaise: base.priceInPaise, toPaise: next.priceInPaise, percent });
      }
    } else {
      const same = next.name.toLowerCase();
      if (existingNames.has(same)) {
        report('warning', [`A product with this title is already on the site (ID ${existingNames.get(same)}). This row adds another one.`]);
      } else if (newNames.has(same)) {
        report('warning', [`Row ${newNames.get(same)} adds a product with the same title.`]);
      }
      newNames.set(same, row.rowNumber);
      plan.toCreate.push({ rowNumber: row.rowNumber, listing: next });
    }
  }

  plan.newBrands = [...new Set([...plan.toCreate, ...plan.toUpdate].map((p) => p.listing.brandName))].filter(
    (b) => b && !brandByKey.has(b.toLowerCase()),
  );
  return plan;
}
