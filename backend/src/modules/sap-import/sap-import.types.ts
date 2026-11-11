/** The fields the SAP sheet carries. The first six are required; the last
 *  four are optional extras that make the catalogue easier to enrich. */
export type SapField =
  | 'sapCode'
  | 'sapName'
  | 'modelName'
  | 'stock'
  | 'mrp'
  | 'mop'
  | 'brand'
  | 'partNumber'
  | 'ean'
  | 'itemGroup';

export const REQUIRED_FIELDS: SapField[] = ['sapCode', 'sapName', 'modelName', 'stock', 'mrp', 'mop'];
export const OPTIONAL_FIELDS: SapField[] = ['brand', 'partNumber', 'ean', 'itemGroup'];

/** What each field is called when talking to the person who uploaded the
 *  sheet. */
export const FIELD_LABELS: Record<SapField, string> = {
  sapCode: 'SAP code',
  sapName: 'SAP name',
  modelName: 'Model name for website',
  stock: 'Available stock',
  mrp: 'MRP',
  mop: 'MOP',
  brand: 'Brand',
  partNumber: 'Manufacturer part number',
  ean: 'EAN / barcode',
  itemGroup: 'SAP item group',
};

/** One row of the sheet as read from the file: its row number as Excel
 *  shows it, and its cells left to right. */
export interface SheetRow {
  rowNumber: number;
  cells: unknown[];
}

/** One product from the sheet, checked and ready to store. Money is in
 *  paise (integers), as everywhere else in this backend. */
export interface ParsedItem {
  rowNumber: number;
  sapCode: string;
  sapName: string;
  modelName: string;
  stock: number;
  mrpInPaise: number;
  mopInPaise: number;
  brand: string | null;
  partNumber: string | null;
  ean: string | null;
  itemGroup: string | null;
}

/** A problem found in the sheet. An `error` means the row was left out of
 *  the import; a `warning` means the row went in, with something adjusted. */
export interface RowIssue {
  rowNumber: number;
  sapCode: string | null;
  severity: 'error' | 'warning';
  field: SapField | 'row';
  message: string;
}

/** The product fields an import can change, as stored. */
export interface StoredItem {
  sapCode: string;
  sapName: string;
  modelName: string;
  stock: number;
  mrpInPaise: number;
  mopInPaise: number;
  brand: string | null;
  partNumber: string | null;
  ean: string | null;
  itemGroup: string | null;
  inLatestFeed: boolean;
}

export type ImportMode = 'partial' | 'full';
