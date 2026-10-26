import type { AnnualReport } from './investor-data';

/** Extracts the leading 4-digit year from a "year" field like "2025-26",
 *  "2024", or "" — used both to sort newest-first and to group. Raw year
 *  strings on these docs are inconsistently formatted ("2025-26" vs "2025"
 *  vs "2026" for filings from the same fiscal year), so every doc is
 *  folded into a single "Financial Year NN" bucket keyed off this leading
 *  year rather than the raw string, which would otherwise fragment one
 *  fiscal year into three or four near-duplicate headings. */
export function leadingYear(year: string): number | null {
  const m = year.match(/\d{4}/);
  return m ? Number(m[0]) : null;
}

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/** Best-effort date embedded in a document title, as a sortable number
 *  (YYYYMMDD). Most of these filings name their date — "March 13, 2026",
 *  "30-09-2023", "14.11.2024" — and the `year` field alone can't order
 *  documents inside one financial year, which is where the bulk of them
 *  sit. Returns null when no date is present so callers fall back to year. */
function titleDate(title: string): number | null {
  const named = title.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b[,\s]+(\d{4})/i,
  );
  if (named) {
    const mm = MONTHS[named[1].toLowerCase()];
    return Number(named[3]) * 10000 + mm * 100 + Number(named[2]);
  }
  // dd-mm-yyyy / dd.mm.yyyy / dd mm yyyy (Indian filing convention)
  const numeric = title.match(/\b(\d{1,2})[-./\s](\d{1,2})[-./\s](\d{4})\b/);
  if (numeric) {
    const d = Number(numeric[1]);
    const mm = Number(numeric[2]);
    if (d >= 1 && d <= 31 && mm >= 1 && mm <= 12) {
      return Number(numeric[3]) * 10000 + mm * 100 + d;
    }
  }
  return null;
}

/** Sort key: real date when the title carries one, otherwise the financial
 *  year placed mid-year so undated docs interleave sensibly rather than
 *  always sinking below dated ones from the same year. */
export function sortKey(doc: AnnualReport): number {
  // An explicit filing date wins over anything read out of the title, which
  // is what lets a document keep a verbatim title — a BSE announcement
  // headline carries no date, and without this it would sort to the middle of
  // the financial year and sink below older filings that happen to name
  // theirs.
  if (doc.date) {
    const [y, m, d] = doc.date.split('-').map(Number);
    if (y && m && d) return y * 10000 + m * 100 + d;
  }
  const d = titleDate(doc.title);
  if (d !== null) return d;
  const y = leadingYear(doc.year);
  return y === null ? -1 : y * 10000 + 630;
}
