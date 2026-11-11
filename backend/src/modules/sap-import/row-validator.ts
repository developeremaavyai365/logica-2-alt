import { FIELD_LABELS, ParsedItem, RowIssue, SapField, SheetRow } from './sap-import.types';

/* Checking each row of the sheet before anything is stored.

   A row with a real problem (no code, no price, MOP above MRP) is left out
   and reported; the rest of the sheet still goes in. A row with something
   merely odd (a negative stock figure, a barcode that is not a barcode) goes
   in with that one value adjusted, and a warning says so. */

const MAX_TEXT = 300;
/** ₹1 crore — far above anything sold here; a figure past it is a typo or a
 *  column mix-up (a barcode read as a price), not a price. */
const MAX_PRICE_RUPEES = 10_000_000;

const text = (value: unknown): string =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

/** A SAP code as text. Excel stores an all-digit code as a number, so
 *  100234 must come back as "100234", not "100234.0"; a code typed as text
 *  keeps any leading zeros it has. */
function toCode(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return text(value);
}

/** A number from a cell that may be a real number or text such as
 *  "52,990", "₹ 52,990.00" or "Rs. 1,29,990/-". Null if it is not a number. */
export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const cleaned = text(value)
    .replace(/₹|rs\.?|inr/gi, '')
    .replace(/\/-$/, '')
    .replace(/[,\s]/g, '');
  if (cleaned === '' || !/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

/** A barcode as its digits, or null if it does not look like one (EAN-8,
 *  UPC-A, EAN-13 or GTIN-14). Excel shows long numbers in scientific
 *  notation but still stores every digit, so a numeric cell is safe. */
function toEan(value: unknown): string | null {
  const digits = typeof value === 'number' && Number.isFinite(value) ? String(Math.round(value)) : text(value).replace(/[\s-]/g, '');
  return /^\d{8}$|^\d{12,14}$/.test(digits) ? digits : null;
}

export interface ValidationResult {
  items: ParsedItem[];
  issues: RowIssue[];
}

export function validateRows(rows: SheetRow[], columns: Partial<Record<SapField, number>>): ValidationResult {
  const items: ParsedItem[] = [];
  const issues: RowIssue[] = [];
  const seen = new Map<string, number>();

  const cell = (row: SheetRow, field: SapField): unknown => {
    const index = columns[field];
    return index === undefined ? '' : row.cells[index];
  };

  for (const row of rows) {
    const sapCode = toCode(cell(row, 'sapCode'));
    const problems: RowIssue[] = [];
    const error = (field: SapField | 'row', message: string) =>
      problems.push({ rowNumber: row.rowNumber, sapCode: sapCode || null, severity: 'error', field, message });
    const warning = (field: SapField | 'row', message: string) =>
      issues.push({ rowNumber: row.rowNumber, sapCode: sapCode || null, severity: 'warning', field, message });

    if (!sapCode) {
      error('sapCode', 'No SAP code.');
    } else if (sapCode.length > 60) {
      error('sapCode', 'SAP code is longer than 60 characters.');
    } else if (seen.has(sapCode.toLowerCase())) {
      error('sapCode', `Duplicate SAP code — already on row ${seen.get(sapCode.toLowerCase())}. This row was skipped.`);
    }

    const modelName = text(cell(row, 'modelName')).slice(0, MAX_TEXT);
    if (!modelName) error('modelName', `No ${FIELD_LABELS.modelName.toLowerCase()}.`);

    // The SAP name is for internal reference only; a blank one is not worth
    // rejecting a product over.
    const sapName = text(cell(row, 'sapName')).slice(0, MAX_TEXT) || modelName;

    // Stock. SAP can report a negative figure when more has been promised
    // than is on the shelf; to a customer that is simply "none available".
    let stock = 0;
    const rawStock = toNumber(cell(row, 'stock'));
    if (rawStock === null) {
      error('stock', text(cell(row, 'stock')) === '' ? 'No stock figure.' : `Stock "${text(cell(row, 'stock'))}" is not a number.`);
    } else if (!Number.isInteger(rawStock)) {
      error('stock', `Stock ${rawStock} is not a whole number.`);
    } else if (rawStock < 0) {
      warning('stock', `Stock was ${rawStock}; stored as 0.`);
    } else {
      stock = rawStock;
    }

    const price = (field: 'mrp' | 'mop'): number | null => {
      const raw = cell(row, field);
      const rupees = toNumber(raw);
      if (rupees === null) {
        error(field, text(raw) === '' ? `No ${FIELD_LABELS[field]}.` : `${FIELD_LABELS[field]} "${text(raw)}" is not a number.`);
        return null;
      }
      if (rupees <= 0) {
        error(field, `${FIELD_LABELS[field]} must be more than zero.`);
        return null;
      }
      if (rupees > MAX_PRICE_RUPEES) {
        error(field, `${FIELD_LABELS[field]} ${rupees} is implausibly high.`);
        return null;
      }
      return Math.round(rupees * 100);
    };
    const mrpInPaise = price('mrp');
    const mopInPaise = price('mop');
    if (mrpInPaise !== null && mopInPaise !== null && mopInPaise > mrpInPaise) {
      error('mop', `MOP (₹${mopInPaise / 100}) is higher than MRP (₹${mrpInPaise / 100}).`);
    }

    let ean: string | null = null;
    const rawEan = cell(row, 'ean');
    if (text(rawEan) !== '') {
      ean = toEan(rawEan);
      if (!ean) warning('ean', `"${text(rawEan)}" is not a valid barcode; left blank.`);
    }

    if (problems.length > 0) {
      issues.push(...problems);
      continue;
    }

    seen.set(sapCode.toLowerCase(), row.rowNumber);
    items.push({
      rowNumber: row.rowNumber,
      sapCode,
      sapName,
      modelName,
      stock,
      mrpInPaise: mrpInPaise as number,
      mopInPaise: mopInPaise as number,
      brand: text(cell(row, 'brand')).slice(0, 80) || null,
      partNumber: text(cell(row, 'partNumber')).slice(0, 80) || null,
      ean,
      itemGroup: text(cell(row, 'itemGroup')).slice(0, 120) || null,
    });
  }

  return { items, issues };
}
