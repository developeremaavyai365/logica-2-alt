import ExcelJS from 'exceljs';
import { SheetRow } from './sap-import.types';

/** Thrown for a file that cannot be read as a sheet at all — the wrong
 *  kind of file, or a damaged one. The message is written for the person
 *  who uploaded it. */
export class SheetReadError extends Error {}

/** Excel hands a cell back in several shapes — plain values, formulas with
 *  a cached result, rich text, hyperlinks, dates, errors. This flattens any
 *  of them to the text or number a person sees in the cell. */
function cellToPrimitive(value: unknown): unknown {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if ('error' in v) return '';
    if ('result' in v) return cellToPrimitive(v.result);
    if (Array.isArray(v.richText)) {
      return (v.richText as { text?: string }[]).map((part) => part.text ?? '').join('');
    }
    if ('text' in v) return cellToPrimitive(v.text);
    // A formula whose result was never calculated and saved.
    if ('formula' in v || 'sharedFormula' in v) return '';
  }
  return String(value);
}

const isBlank = (cell: unknown) => cell === '' || cell === null || cell === undefined || (typeof cell === 'string' && cell.trim() === '');

async function readXlsx(buffer: Buffer): Promise<SheetRow[]> {
  const workbook = new ExcelJS.Workbook();
  try {
    // exceljs' own typings predate Node's generic Buffer type; the value is
    // an ordinary Buffer either way.
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  } catch {
    throw new SheetReadError('This file could not be opened as an Excel workbook. It may be damaged or password-protected.');
  }

  // The first sheet that has anything in it — exports sometimes lead with
  // an empty or cover sheet.
  const sheet = workbook.worksheets.find((ws) => ws.actualRowCount > 0);
  if (!sheet) return [];

  const rows: SheetRow[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cells: unknown[] = [];
    // row.values is 1-based; index 0 is always empty.
    const values = row.values as unknown[];
    for (let col = 1; col < values.length; col++) {
      cells.push(cellToPrimitive(values[col]));
    }
    rows.push({ rowNumber, cells });
  });
  return rows;
}

/** A small CSV reader: quoted fields, doubled quotes inside them, line
 *  breaks inside quotes, and whichever of comma, semicolon or tab the file
 *  uses as its separator. */
export function parseCsv(text: string): SheetRow[] {
  const source = text.replace(/^﻿/, '');
  const firstLine = source.split(/\r?\n/, 1)[0] ?? '';
  const count = (ch: string) => firstLine.split(ch).length - 1;
  const delimiter = [',', ';', '\t'].sort((a, b) => count(b) - count(a))[0];

  const rows: SheetRow[] = [];
  let cells: string[] = [];
  let field = '';
  let quoted = false;
  let rowNumber = 1;
  let rowStartLine = 1;

  const endRow = () => {
    cells.push(field);
    rows.push({ rowNumber: rowStartLine, cells });
    cells = [];
    field = '';
  };

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        if (ch === '\n') rowNumber++;
        field += ch;
      }
      continue;
    }
    if (ch === '"' && field === '') {
      quoted = true;
    } else if (ch === delimiter) {
      cells.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++;
      endRow();
      rowNumber++;
      rowStartLine = rowNumber;
    } else {
      field += ch;
    }
  }
  if (field !== '' || cells.length > 0) endRow();

  return rows;
}

/** Reads an uploaded sheet into rows of cells, dropping rows that are
 *  entirely empty. Supports .xlsx and .csv. */
export async function readSheet(buffer: Buffer, fileName: string): Promise<SheetRow[]> {
  const extension = fileName.toLowerCase().split('.').pop() ?? '';

  let rows: SheetRow[];
  if (extension === 'xlsx' || extension === 'xlsm') {
    rows = await readXlsx(buffer);
  } else if (extension === 'csv' || extension === 'txt') {
    rows = parseCsv(buffer.toString('utf8'));
  } else if (extension === 'xls') {
    throw new SheetReadError(
      'This is an old-format Excel file (.xls). Open it in Excel, choose Save As, pick "Excel Workbook (.xlsx)", and upload that.',
    );
  } else {
    throw new SheetReadError('Upload an Excel workbook (.xlsx) or a CSV file.');
  }

  return rows.filter((row) => row.cells.some((cell) => !isBlank(cell)));
}
