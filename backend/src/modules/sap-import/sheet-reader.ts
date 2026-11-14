import ExcelJS from 'exceljs';
import JSZip from 'jszip';
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

const COMMENT_REL_TYPES = [
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing',
];

/** Turns a relationship target into a path inside the zip. Targets are
 *  relative to the folder above the .rels file, or absolute from the root. */
function resolvePartPath(relsPath: string, target: string): string {
  if (target.startsWith('/')) return target.slice(1);
  // xl/worksheets/_rels/sheet1.xml.rels → xl/worksheets
  const parts = relsPath.split('/').slice(0, -2);
  for (const segment of target.split('/')) {
    if (segment === '..') parts.pop();
    else if (segment !== '.' && segment !== '') parts.push(segment);
  }
  return parts.join('/');
}

/** Removes cell comments and the VML drawings that show them from a
 *  workbook. They carry no data, but exceljs fails on some layouts of them
 *  — notably the absolute paths openpyxl writes. Returns null if the file
 *  is not a zip at all. */
async function withoutComments(buffer: Buffer): Promise<Buffer | null> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    return null;
  }

  const removed = new Set<string>();
  for (const relsPath of Object.keys(zip.files).filter((p) => /^xl\/worksheets\/_rels\/[^/]+\.rels$/.test(p))) {
    const xml = await zip.file(relsPath)!.async('string');
    const kept = xml.replace(/<Relationship\b[^>]*?\/>/g, (rel) => {
      const type = /\bType="([^"]*)"/.exec(rel)?.[1];
      if (!type || !COMMENT_REL_TYPES.includes(type)) return rel;
      const target = /\bTarget="([^"]*)"/.exec(rel)?.[1];
      if (target) removed.add(resolvePartPath(relsPath, target));
      return '';
    });
    if (kept === xml) continue;
    zip.file(relsPath, kept);

    // The sheet points at its comment drawing by relationship id; with the
    // relationship gone, the reference has to go too.
    const sheetPath = relsPath.replace('/_rels/', '/').replace(/\.rels$/, '');
    const sheet = zip.file(sheetPath);
    if (sheet) {
      const sheetXml = await sheet.async('string');
      zip.file(sheetPath, sheetXml.replace(/<legacyDrawing\b[^>]*?\/>/g, ''));
    }
  }

  // Anything left that looks like a comment part, in case it was not
  // reachable through a sheet's relationships.
  for (const path of Object.keys(zip.files)) {
    if (/^xl\/(.*\/)?comments?\d*\.xml$/.test(path) || /\.vml$/i.test(path)) removed.add(path);
  }
  removed.forEach((path) => zip.remove(path));

  const contentTypes = zip.file('[Content_Types].xml');
  if (contentTypes) {
    const xml = await contentTypes.async('string');
    zip.file(
      '[Content_Types].xml',
      xml.replace(/<Override\b[^>]*?\/>/g, (override) => {
        const part = /\bPartName="\/?([^"]*)"/.exec(override)?.[1];
        return part && removed.has(part) ? '' : override;
      }),
    );
  }

  return zip.generateAsync({ type: 'nodebuffer' });
}

async function loadWorkbook(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const unreadable = () =>
    new SheetReadError('This file could not be opened as an Excel workbook. It may be damaged or password-protected.');
  // exceljs' own typings predate Node's generic Buffer type; the value is
  // an ordinary Buffer either way.
  const load = async (data: Buffer) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data as unknown as ArrayBuffer);
    return workbook;
  };

  try {
    return await load(buffer);
  } catch {
    // Retry without comments, which people add to sheets but which exceljs
    // cannot always read.
    const stripped = await withoutComments(buffer);
    if (!stripped) throw unreadable();
    try {
      return await load(stripped);
    } catch {
      throw unreadable();
    }
  }
}

async function readXlsx(buffer: Buffer): Promise<SheetRow[]> {
  const workbook = await loadWorkbook(buffer);

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
