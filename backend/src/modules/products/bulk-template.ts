import ExcelJS from 'exceljs';
import { BULK_COLUMNS, BulkField, SPEC_PREFIX } from './bulk-listing';
import { GST_RATES, Listing, SpecField } from './listing-rules';

/* The sheet admins download to add or edit products in bulk: the columns the
   upload reads, a note on each heading, dropdowns where there is a fixed
   choice, and — when asked for — the products already listed, ready to edit. */

export interface TemplateInput {
  categories: { slug: string; name: string }[];
  /** The category whose spec fields get columns of their own; null for all. */
  category: { slug: string; name: string } | null;
  specFields: SpecField[];
  products: { slug: string; listing: Listing; linkedToSap: boolean }[];
}

const STATUS_LABEL: Record<Listing['status'], string> = { DRAFT: 'Draft', ACTIVE: 'Active', INACTIVE: 'Inactive' };
const NAVY = 'FF061A40';
const GREY = 'FF6B7280';
/** Empty rows given dropdowns below the products, for new ones. */
const SPARE_ROWS = 500;

interface Column {
  heading: string;
  note: string;
  width: number;
  field?: BulkField;
  spec?: string;
  /** Usual values, offered as a dropdown that still takes others. */
  options?: string[];
}

const rupees = (paise: number | null) => (paise === null || paise === 0 ? null : paise / 100);

export async function buildTemplate(input: TemplateInput): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Logica admin';
  const sheet = workbook.addWorksheet('Products', { views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }] });
  const help = workbook.addWorksheet('How to fill');
  const lists = workbook.addWorksheet('Lists', { state: 'hidden' });

  // In the order of the product page: the variant's specs (RAM, storage)
  // after Variant, the category's other specs after "What's in the box".
  const specColumn = (f: SpecField): Column => ({
    heading: `${SPEC_PREFIX}${f.label}${f.required ? ' *' : ''}`,
    note: `${f.group ? `${f.group}. ` : ''}${f.placeholder}.${f.required ? ' Needed before a new product can be Active.' : ''}`,
    width: 24,
    spec: f.label,
    options: f.options,
  });
  const columns: Column[] = BULK_COLUMNS.flatMap((c) => {
    const own: Column = { heading: c.heading, note: c.note, width: c.width, field: c.field };
    if (c.field === 'variant') return [own, ...input.specFields.filter((f) => f.variant).map(specColumn)];
    if (c.field === 'inTheBox') return [own, ...input.specFields.filter((f) => !f.variant).map(specColumn)];
    return [own];
  });
  const at = (field: BulkField) => columns.findIndex((c) => c.field === field) + 1;

  sheet.columns = columns.map((c) => ({ header: c.heading, width: c.width }));
  const header = sheet.getRow(1);
  header.height = 32;
  columns.forEach((c, i) => {
    const cell = header.getCell(i + 1);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.note = c.note;
  });

  // Codes stay text, so Excel keeps their digits and leading zeros.
  for (const field of ['slug', 'ean', 'hsnCode', 'modelNumber', 'partNumber', 'modelName'] as BulkField[]) sheet.getColumn(at(field)).numFmt = '@';
  const wrapped = new Set((['highlights', 'description', 'photos', 'otherSpecs', 'manufacturerDetails', 'warrantyCovered'] as BulkField[]).map(at));
  for (const column of wrapped) sheet.getColumn(column).alignment = { wrapText: true, vertical: 'top' };

  const templateLabels = new Set(input.specFields.map((f) => f.label.toLowerCase()));
  const categoryName = new Map(input.categories.map((c) => [c.slug, c.name]));
  for (const { slug, listing, linkedToSap } of input.products) {
    const specValue = (label: string) => listing.specs.find((s) => s.label.toLowerCase() === label.toLowerCase())?.value ?? null;
    const values = columns.map((c) => {
      if (c.spec) return specValue(c.spec);
      switch (c.field) {
        case 'slug': return slug;
        case 'name': return listing.name;
        case 'category': return categoryName.get(listing.categorySlug) ?? listing.categorySlug;
        case 'brand': return listing.brandName || null;
        case 'status': return STATUS_LABEL[listing.status];
        case 'price': return rupees(listing.priceInPaise);
        case 'mrp': return rupees(listing.mrpInPaise);
        case 'inStock': return listing.inStock ? 'Yes' : 'No';
        case 'modelName': return listing.modelName;
        case 'modelNumber': return listing.modelNumber;
        case 'partNumber': return listing.partNumber;
        case 'variant': return listing.variant;
        case 'ean': return listing.ean;
        case 'hsnCode': return listing.hsnCode;
        case 'gstRatePercent': return listing.gstRatePercent;
        case 'warranty': return listing.warranty;
        case 'warrantyPeriod': return listing.warrantyPeriod;
        case 'warrantyServiceType': return listing.warrantyServiceType;
        case 'warrantyCovered': return listing.warrantyCovered;
        case 'inTheBox': return listing.inTheBox;
        case 'countryOfOrigin': return listing.countryOfOrigin;
        case 'manufacturerDetails': return listing.manufacturerDetails;
        case 'packerDetails': return listing.packerDetails;
        case 'importerDetails': return listing.importerDetails;
        case 'packageLengthCm': return listing.packageLengthCm;
        case 'packageBreadthCm': return listing.packageBreadthCm;
        case 'packageHeightCm': return listing.packageHeightCm;
        case 'packageWeightKg': return listing.packageWeightKg;
        case 'videoUrl': return listing.videoUrl;
        case 'highlights': return listing.highlights.join('\n') || null;
        case 'description': return listing.description || null;
        case 'photos': return listing.gallery.join('\n') || null;
        case 'otherSpecs':
          return listing.specs.filter((s) => !templateLabels.has(s.label.toLowerCase())).map((s) => `${s.label}: ${s.value}`).join('\n') || null;
        default: return null;
      }
    });
    const row = sheet.addRow(values);
    row.height = 48;
    columns.forEach((_, i) => (row.getCell(i + 1).alignment = { vertical: 'top', wrapText: wrapped.has(i + 1) }));
    row.getCell(at('slug')).font = { color: { argb: GREY } };
    if (linkedToSap) {
      for (const field of ['price', 'mrp', 'inStock'] as BulkField[]) row.getCell(at(field)).font = { italic: true, color: { argb: GREY } };
      row.getCell(at('price')).note = 'Linked to a SAP code: the SAP sheet sets its price, MRP and stock.';
    }
  }

  // Dropdowns, for the products and for spare rows below them.
  input.categories.forEach((c, i) => (lists.getCell(i + 1, 1).value = c.name));
  const lastRow = input.products.length + 1 + SPARE_ROWS;
  const dropdowns: [BulkField, string, string][] = [
    ['category', `Lists!$A$1:$A$${Math.max(1, input.categories.length)}`, 'Pick a category from the list.'],
    ['status', '"Draft,Active,Inactive"', 'Draft, Active or Inactive.'],
    ['inStock', '"Yes,No"', 'Yes or No.'],
    ['gstRatePercent', `"${GST_RATES.join(',')}"`, `One of ${GST_RATES.join(', ')}.`],
  ];
  for (const [field, formula, error] of dropdowns) {
    const column = at(field);
    for (let r = 2; r <= lastRow; r++) {
      sheet.getCell(r, column).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [formula],
        showErrorMessage: true,
        errorTitle: 'Not in the list',
        error,
      };
    }
  }
  // Spec fields with usual values: a dropdown that still takes another value.
  columns.forEach((c, i) => {
    if (!c.options?.length) return;
    for (let r = 2; r <= lastRow; r++) {
      sheet.getCell(r, i + 1).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${c.options.join(',')}"`], showErrorMessage: false };
    }
  });

  help.getColumn(1).width = 110;
  const guide = [
    'Adding and editing products with this sheet',
    '',
    `This sheet is for ${input.category ? `the ${input.category.name} category` : 'all categories'}.`,
    'One row is one product. Fill in the Products tab, save the file, and upload it on the Bulk upload page.',
    'Nothing changes until you have checked the upload and pressed Apply.',
    '',
    'Adding products',
    '• Leave Product ID blank. Fill in at least Category, Brand and Model name.',
    "• Leave Title blank to build it from the brand's title format (set on the Title formats page), from the brand, model, variant and specs.",
    '• New products are saved as Draft unless you set Status to Active.',
    '• To be Active, a new product needs every column marked *: model, variant, MRP, selling price (or a linked SAP code), EAN, GST, HSN, a photo, 4 highlights, description, box contents, country of origin and manufacturer.',
    '• Colours, and the SAP code (SKU) of each, are added on the product page after the upload.',
    '',
    'Editing products',
    '• Download the sheet "with the products already listed". Do not change the Product ID.',
    '• A blank cell clears that field. A column you delete from the sheet is left as it is on every product.',
    '• So to change only prices, keep just the Product ID and Selling price columns.',
    '• Status and In stock: a blank cell keeps them as they are.',
    "• Title: leave a product's title as it is to keep it; clear the cell to have it built from the brand's format instead.",
    '• Products linked to a SAP code take their price, MRP and stock from the SAP sheet; those cells are ignored.',
    '• Colours and their photos are edited on each product\'s own page, not in this sheet.',
    '',
    'Columns',
    ...columns.map((c) => `• ${c.heading.replace(/ \*$/, '')}: ${c.note}`),
    '',
    'Columns marked * are needed before a new product can be Active. Products already on the shop are only reminded of them.',
  ];
  guide.forEach((line, i) => {
    const cell = help.getCell(i + 1, 1);
    cell.value = line;
    cell.alignment = { wrapText: true, vertical: 'top' };
    if (i === 0) cell.font = { bold: true, size: 14, color: { argb: NAVY } };
    else if (['Adding products', 'Editing products', 'Columns'].includes(line)) cell.font = { bold: true, color: { argb: NAVY } };
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
