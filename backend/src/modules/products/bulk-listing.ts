import { toNumber } from '../sap-import/row-validator';
import { SheetRow } from '../sap-import/sap-import.types';
import { TitleFormatRule, buildTitle, pickTitleFormat } from './title-format';
import {
  EMPTY_LISTING,
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
  | 'category'
  | 'brand'
  | 'modelName'
  | 'modelNumber'
  | 'partNumber'
  | 'variant'
  | 'name'
  | 'status'
  | 'mrp'
  | 'price'
  | 'inStock'
  | 'ean'
  | 'gstRatePercent'
  | 'hsnCode'
  | 'photos'
  | 'highlights'
  | 'description'
  | 'inTheBox'
  | 'otherSpecs'
  | 'warranty'
  | 'warrantyPeriod'
  | 'warrantyServiceType'
  | 'warrantyCovered'
  | 'countryOfOrigin'
  | 'manufacturerDetails'
  | 'packerDetails'
  | 'importerDetails'
  | 'packageLengthCm'
  | 'packageBreadthCm'
  | 'packageHeightCm'
  | 'packageWeightKg'
  | 'videoUrl';

export interface BulkColumn {
  field: BulkField;
  heading: string;
  /** Other headings read as this column. */
  aliases: string[];
  /** Shown as a note on the heading in the template. */
  note: string;
  width: number;
}

/** The sheet's columns, in the order of the product page. The category's
 *  variant specs (RAM, storage) follow Variant, and its other specs follow
 *  "In the box", in the downloaded sheet. */
export const BULK_COLUMNS: BulkColumn[] = [
  {
    field: 'slug',
    heading: 'Product ID',
    aliases: ['id', 'slug', 'productslug', 'productaddress'],
    note: 'Leave blank to add a new product. For a product already on the site this is filled in: do not change it.',
    width: 30,
  },
  { field: 'category', heading: 'Category *', aliases: ['categoryname'], note: 'Pick from the list. Decides the spec columns.', width: 18 },
  { field: 'brand', heading: 'Brand *', aliases: ['brandname', 'make'], note: 'A brand not used before is added.', width: 16 },
  { field: 'modelName', heading: 'Model name *', aliases: ['modelname', 'model'], note: 'As the maker names it, e.g. "Galaxy S24 5G".', width: 22 },
  { field: 'modelNumber', heading: 'Model number', aliases: ['modelno', 'modelid'], note: 'The maker\'s code, e.g. "SM-S921BZKCINS". Up to 60 characters.', width: 18 },
  { field: 'partNumber', heading: 'Part number', aliases: ['partno', 'mpn', 'manufacturerpartnumber'], note: 'Up to 60 characters.', width: 16 },
  {
    field: 'variant',
    heading: 'Variant',
    aliases: ['variantname'],
    note: 'For categories without RAM and storage columns: what sets this version apart, e.g. "650 VA".',
    width: 16,
  },
  {
    field: 'name',
    heading: 'Title',
    aliases: ['producttitle', 'name', 'productname'],
    note: "Leave blank to build the title from the brand's title format. A title written here is kept as written.",
    width: 44,
  },
  {
    field: 'status',
    heading: 'Status',
    aliases: ['listingstatus'],
    note: 'Draft: saved, not on the shop. Active: on the shop. Inactive: taken off the shop. Blank keeps it as it is (Draft for a new product).',
    width: 12,
  },
  { field: 'mrp', heading: 'MRP (₹) *', aliases: ['mrp', 'maximumretailprice'], note: 'In rupees. Ignored for a product linked to a SAP code.', width: 14 },
  {
    field: 'price',
    heading: 'Selling price (₹) *',
    aliases: ['sellingprice', 'price', 'mop', 'offerprice', 'saleprice', 'sp'],
    note: 'In rupees. Ignored for a product linked to a SAP code: the SAP sheet sets its price. The discount is worked out from MRP and selling price.',
    width: 16,
  },
  {
    field: 'inStock',
    heading: 'In stock',
    aliases: ['stock', 'available'],
    note: 'Yes or No. Ignored for a product linked to a SAP code: the SAP sheet sets its stock.',
    width: 10,
  },
  { field: 'ean', heading: 'EAN / barcode *', aliases: ['ean', 'barcode', 'gtin', 'upc', 'eancode'], note: 'The 8, 12, 13 or 14 digits under the barcode. For colours, set on the product page.', width: 18 },
  { field: 'gstRatePercent', heading: 'GST % *', aliases: ['gst', 'gstrate', 'gstpercent', 'taxrate', 'tax', 'taxpercent', 'taxcode'], note: 'One of 0, 5, 12, 18 or 28.', width: 9 },
  { field: 'hsnCode', heading: 'HSN code *', aliases: ['hsn', 'hsncode', 'hsnsac'], note: '4 to 8 digits.', width: 12 },
  {
    field: 'photos',
    heading: 'Photos *',
    aliases: ['photo', 'images', 'image', 'imageurls', 'photourls', 'photolinks', 'mainimageurl'],
    note: 'Web addresses of the photos, one per line: main (front), back, side, diagonal, close-up. Photos can also be uploaded on the product page.',
    width: 40,
  },
  {
    field: 'highlights',
    heading: 'Key highlights *',
    aliases: ['highlights', 'keyfeatures', 'features'],
    note: 'At least 4, one per line (Alt+Enter starts a new line in a cell): RAM and storage, battery, screen size, processor.',
    width: 40,
  },
  { field: 'description', heading: 'Description *', aliases: ['overview', 'productdescription', 'about'], note: 'Up to 8,000 characters.', width: 40 },
  { field: 'inTheBox', heading: "What's in the box *", aliases: ['inthebox', 'whatsinthebox', 'boxcontents', 'inbox'], note: 'e.g. Handset, USB Type-C cable, SIM ejector pin.', width: 24 },
  {
    field: 'otherSpecs',
    heading: 'Other specs',
    aliases: ['specs', 'specifications', 'otherspecifications', 'morespecs'],
    note: 'Any other specs, one per line, as Label: value. For example "Body Material: Glass".',
    width: 40,
  },
  { field: 'warranty', heading: 'Warranty summary', aliases: ['warranty'], note: 'One line: the years covered, and domestic or international.', width: 30 },
  { field: 'warrantyPeriod', heading: 'Warranty period', aliases: ['warrantyperiod'], note: 'e.g. 1 Year.', width: 14 },
  { field: 'warrantyServiceType', heading: 'Warranty service type', aliases: ['warrantyservicetype', 'servicetype'], note: 'How the shopper claims it.', width: 24 },
  { field: 'warrantyCovered', heading: 'Covered in warranty', aliases: ['coveredinwarranty', 'warrantycovers'], note: 'What the warranty covers.', width: 24 },
  { field: 'countryOfOrigin', heading: 'Country of origin *', aliases: ['countryoforigin', 'origin', 'madein'], note: 'Where it was made, or assembled for an import.', width: 16 },
  { field: 'manufacturerDetails', heading: 'Manufacturer details *', aliases: ['manufacturerdetails', 'manufacturer'], note: 'Name and address of the manufacturer.', width: 30 },
  { field: 'packerDetails', heading: 'Packer details', aliases: ['packerdetails', 'packer'], note: 'Name and address, if not the manufacturer.', width: 26 },
  { field: 'importerDetails', heading: 'Importer details', aliases: ['importerdetails', 'importer'], note: 'Name and address, for an imported product.', width: 26 },
  { field: 'packageLengthCm', heading: 'Length (cm)', aliases: ['length', 'lengthcm', 'packagelength'], note: 'Of the box as shipped.', width: 11 },
  { field: 'packageBreadthCm', heading: 'Breadth (cm)', aliases: ['breadth', 'breadthcm', 'width', 'packagebreadth'], note: 'Of the box as shipped.', width: 11 },
  { field: 'packageHeightCm', heading: 'Height (cm)', aliases: ['height', 'heightcm', 'packageheight'], note: 'Of the box as shipped.', width: 11 },
  { field: 'packageWeightKg', heading: 'Weight (kg)', aliases: ['weight', 'weightkg', 'packageweight'], note: 'Of the box as shipped.', width: 11 },
  { field: 'videoUrl', heading: 'Video link', aliases: ['videourl', 'video', 'videolink'], note: 'A web address starting with https://, e.g. a YouTube link.', width: 30 },
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

/** The row of headings: the first of the opening rows with a Product ID,
 *  Title or Model name column, and one more it knows. (Product ID and
 *  Selling price alone is a price update.) */
export function locateBulkHeader(rows: SheetRow[]): BulkHeader | null {
  for (let index = 0; index < Math.min(rows.length, 10); index++) {
    const found = readHeadings(rows[index].cells);
    const recognised = Object.keys(found.columns).length + found.specColumns.length;
    const identifies = found.columns.name !== undefined || found.columns.slug !== undefined || found.columns.modelName !== undefined;
    if (identifies && recognised >= 2) return { index, ...found };
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
  /** The admin's own title formats (the built-in ones are in title-format.ts). */
  titleFormats: TitleFormatRule[];
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

const NEW_PRODUCT = EMPTY_LISTING;

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
    const label = single(cell('name')) || existing?.listing.name || [single(cell('brand')), single(cell('modelName'))].filter(Boolean).join(' ') || slug || null;
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

    // The title: a blank cell builds it from the brand's format (below, once
    // the fields it uses are read); the product's own title, unchanged,
    // keeps whichever it had; any other title is kept as written.
    if (has('name')) {
      const typed = single(cell('name'));
      if (!typed) next.titleAuto = true;
      else if (!existing || typed !== base.name) {
        next.titleAuto = false;
        next.name = typed;
      }
    } else if (!existing) {
      next.titleAuto = true;
    }

    // Category and brand.
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
    type TextField =
      | 'modelName'
      | 'modelNumber'
      | 'partNumber'
      | 'variant'
      | 'warranty'
      | 'warrantyPeriod'
      | 'warrantyServiceType'
      | 'warrantyCovered'
      | 'inTheBox'
      | 'countryOfOrigin'
      | 'manufacturerDetails'
      | 'packerDetails'
      | 'importerDetails';
    const text = (field: TextField, name: string, max: number) => {
      if (!has(field)) return;
      const value = single(cell(field));
      if (value.length > max) errors.push(`${name} is longer than ${max} characters.`);
      next[field] = value || null;
    };
    text('modelName', 'The model name', 120);
    text('modelNumber', 'The model number', 60);
    text('partNumber', 'The part number', 60);
    text('variant', 'The variant', 80);
    text('inTheBox', '"What\'s in the box"', 500);
    text('warranty', 'The warranty summary', 300);
    text('warrantyPeriod', 'The warranty period', 100);
    text('warrantyServiceType', 'The warranty service type', 300);
    text('warrantyCovered', '"Covered in warranty"', 1000);
    text('countryOfOrigin', 'The country of origin', 60);
    text('manufacturerDetails', 'The manufacturer details', 500);
    text('packerDetails', 'The packer details', 500);
    text('importerDetails', 'The importer details', 500);

    // Package size and weight.
    const measure = (field: 'packageLengthCm' | 'packageBreadthCm' | 'packageHeightCm' | 'packageWeightKg', name: string, max: number) => {
      if (!has(field)) return;
      const shown = single(cell(field));
      if (!shown) {
        next[field] = null;
        return;
      }
      const value = toNumber(cell(field));
      if (value === null || value < 0 || value > max) errors.push(`${name} "${shown}" should be a number from 0 to ${max}.`);
      else next[field] = Math.round(value * 1000) / 1000;
    };
    measure('packageLengthCm', 'Length (cm)', 1000);
    measure('packageBreadthCm', 'Breadth (cm)', 1000);
    measure('packageHeightCm', 'Height (cm)', 1000);
    measure('packageWeightKg', 'Weight (kg)', 500);

    if (has('videoUrl')) {
      const url = single(cell('videoUrl'));
      if (!url) next.videoUrl = null;
      else if (!/^https:\/\/[^\s"'<>]{4,500}$/.test(url)) errors.push(`Video link "${url.slice(0, 60)}" should be a web address starting with https://.`);
      else next.videoUrl = url;
    }

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

    // The automatic title, from the brand's format and the fields just read.
    if (next.titleAuto) {
      const { pattern } = pickTitleFormat(next.brandName, next.categorySlug, ctx.titleFormats);
      const built = buildTitle(
        pattern,
        { brand: next.brandName, modelName: next.modelName, modelNumber: next.modelNumber, variant: next.variant, specs: next.specs },
        next.colours[0]?.name ?? null,
      );
      if (built.length >= 3) next.name = built;
    }
    if (next.name.trim().length < 3) errors.push('No title: fill in the brand and model name to build it, or write a title.');
    else if (next.name.length > 200) errors.push(`The title is ${next.name.length} characters; the most is 200.`);

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
      const { blocking } = checkListing(next, existing?.linkedToSap ?? false, base.status !== 'DRAFT' && !!existing);
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
