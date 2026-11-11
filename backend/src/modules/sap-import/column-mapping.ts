import { REQUIRED_FIELDS, SapField, SheetRow } from './sap-import.types';

/* Working out which column of the sheet is which field.

   The headings in a SAP export are whatever that SAP was set up to call
   them — "Item No.", "Material", "ItemCode" — so the columns are matched by
   meaning rather than by one fixed spelling. Each heading is reduced to its
   letters and digits ("Model Name for Website" → "modelnameforwebsite") and
   compared against the names below; if none matches exactly, a looser
   second pass looks for a telling word inside the heading. */

const normalise = (heading: unknown) =>
  String(heading ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/** Headings that mean exactly this field. */
const EXACT: Record<SapField, string[]> = {
  sapCode: ['sapcode', 'itemcode', 'itemno', 'itemnumber', 'materialcode', 'material', 'materialno', 'materialnumber', 'code', 'sapitemcode', 'sapno', 'sapid'],
  sapName: ['sapname', 'itemname', 'itemdescription', 'materialdescription', 'materialname', 'description', 'sapdescription', 'sapitemname', 'name'],
  modelName: ['modelnameforwebsite', 'modelname', 'websitename', 'websitemodelname', 'webname', 'model', 'websitetitle', 'producttitle', 'displayname'],
  stock: ['availablestock', 'stock', 'available', 'availableqty', 'availablequantity', 'qty', 'quantity', 'instock', 'stockqty', 'freestock', 'onhand', 'closingstock'],
  mrp: ['mrp', 'maximumretailprice', 'mrpinr', 'mrprs'],
  mop: ['mop', 'marketoperatingprice', 'sellingprice', 'saleprice', 'offerprice', 'mopinr', 'moprs', 'price'],
  brand: ['brand', 'brandname', 'manufacturer', 'make', 'mfr'],
  partNumber: ['partnumber', 'partno', 'mpn', 'manufacturerpartnumber', 'manufacturerpartno', 'mfrpartno', 'mfrpartnumber', 'mfgpartno', 'partcode'],
  ean: ['ean', 'eancode', 'ean13', 'barcode', 'gtin', 'upc', 'eanno', 'eannumber'],
  itemGroup: ['itemgroup', 'sapitemgroup', 'itemgroupname', 'materialgroup', 'group', 'productgroup', 'category', 'itemcategory'],
};

/** A word inside a heading that points to a field, tried in this order —
 *  the order matters: "EAN Code" has to be claimed as a barcode before the
 *  word "code" can claim it as the SAP code, and "Model Name" as the model
 *  before "name" can claim it as the SAP name. */
const LOOSE: [SapField, RegExp][] = [
  ['ean', /ean|barcode|gtin|upc/],
  ['partNumber', /partno|partnumber|mpn/],
  ['mrp', /mrp/],
  ['mop', /mop/],
  ['stock', /stock|qty|quantity/],
  ['modelName', /website|model/],
  ['itemGroup', /group/],
  ['brand', /brand/],
  ['sapCode', /code|itemno|material/],
  ['sapName', /name|description/],
];

export interface ColumnMap {
  /** Field → index of its column in the row. */
  columns: Partial<Record<SapField, number>>;
  /** Required fields no column was found for. */
  missing: SapField[];
  /** Headings that were not recognised as any field — reported back so a
   *  mis-named column is easy to spot. */
  unrecognised: string[];
}

/** Matches a row of headings to the fields. */
export function mapColumns(headings: unknown[]): ColumnMap {
  const columns: Partial<Record<SapField, number>> = {};
  const taken = new Set<number>();
  const keys = headings.map(normalise);

  // First pass: exact names.
  for (const field of Object.keys(EXACT) as SapField[]) {
    const index = keys.findIndex((key, i) => !taken.has(i) && key !== '' && EXACT[field].includes(key));
    if (index >= 0) {
      columns[field] = index;
      taken.add(index);
    }
  }

  // Second pass: a telling word, for the fields still unmatched.
  for (const [field, pattern] of LOOSE) {
    if (columns[field] !== undefined) continue;
    const index = keys.findIndex((key, i) => !taken.has(i) && key !== '' && pattern.test(key));
    if (index >= 0) {
      columns[field] = index;
      taken.add(index);
    }
  }

  return {
    columns,
    missing: REQUIRED_FIELDS.filter((field) => columns[field] === undefined),
    unrecognised: headings
      .map((heading, i) => ({ text: String(heading ?? '').trim(), i }))
      .filter(({ text, i }) => text !== '' && !taken.has(i))
      .map(({ text }) => text),
  };
}

export interface HeaderLocation {
  /** Index into the rows array of the heading row. */
  index: number;
  map: ColumnMap;
}

/** Finds the row of headings. Exports often open with a title, a date or a
 *  blank line before the real headings, so this looks through the first
 *  rows for the one that matches the most fields rather than assuming it is
 *  the first. */
export function locateHeader(rows: SheetRow[]): HeaderLocation | null {
  let best: HeaderLocation | null = null;
  let bestScore = 0;

  for (let index = 0; index < Math.min(rows.length, 25); index++) {
    const map = mapColumns(rows[index].cells);
    const score = Object.keys(map.columns).length;
    if (score > bestScore) {
      best = { index, map };
      bestScore = score;
    }
  }

  // A row matching fewer than three fields is more likely data that
  // happened to contain a word like "stock" than a row of headings.
  return bestScore >= 3 ? best : null;
}
