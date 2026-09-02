import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { FileText, Building2, ArrowUpRight, Search, Download } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { INVESTOR_SECTIONS, CATEGORY_ICONS } from '../../investor-sections';
import type { AnnualReport } from '../../investor-data';

/** Extracts the leading 4-digit year from a "year" field like "2025-26",
 *  "2024", or "" — used both to sort newest-first and to group. Raw year
 *  strings on these docs are inconsistently formatted ("2025-26" vs "2025"
 *  vs "2026" for filings from the same fiscal year), so every doc is
 *  folded into a single "Financial Year NN" bucket keyed off this leading
 *  year rather than the raw string, which would otherwise fragment one
 *  fiscal year into three or four near-duplicate headings. */
function leadingYear(year: string): number | null {
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
function sortKey(doc: AnnualReport): number {
  const d = titleDate(doc.title);
  if (d !== null) return d;
  const y = leadingYear(doc.year);
  return y === null ? -1 : y * 10000 + 630;
}

/** Financial-year bucket for the year filter, e.g. "2025-26".
 *
 *  Deliberately keyed off the curated `year` field and never off the date in
 *  the title. Those two disagree on 17 documents, and in most of them the
 *  year field is the correct one: "Financial Results for Half Year FY Ended
 *  March 31 2025" carries year 2025-26 because that is when it was filed —
 *  the March 2025 in its title is the period it reports on. Re-deriving the
 *  year from title dates would quietly move those filings into the wrong
 *  folder, which is exactly what this filter must not do.
 *
 *  Folded by leading year so the same fiscal year written three different
 *  ways ("2024", "2024-25", "2025") does not split into near-duplicate
 *  buckets. Returns null for the handful of documents carrying no year at
 *  all; those stay reachable under "All". */
function fyBucket(doc: AnnualReport): string | null {
  const y = leadingYear(doc.year);
  if (y === null) return null;
  return `${y}-${String((y + 1) % 100).padStart(2, '0')}`;
}

const ALL_YEARS = 'all';

/** Only worth showing on sections long enough to be worth narrowing. Policies
 *  is excluded outright: the company asked for those to sit on one page
 *  rather than be split by financial year. */
const YEAR_FILTER_MIN_DOCS = 12;
const NO_YEAR_FILTER = new Set(['policies']);

/** Clean row-list of documents for one financial year, matching a typical
 *  IR "Financial Information" layout — title left, PDF/download right,
 *  hairline dividers between rows instead of a card grid. */
function DocRows({ docs }: { docs: AnnualReport[] }) {
  return (
    <div className="divide-y divide-[#000000]/10 rounded-2xl border border-[#000000]/10 bg-white">
      {docs.map((doc) =>
        doc.available === false ? (
          <div
            key={doc.url}
            className="flex cursor-not-allowed items-center justify-between gap-4 px-5 py-4 opacity-60"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-[#000000]">
              <FileText className="h-4 w-4 shrink-0 text-[#6b6b6b]" />
              {doc.title}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">
              Document unavailable
            </span>
          </div>
        ) : (
          <a
            key={doc.url}
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#ECEDEC]/60"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-[#000000]">
              <FileText className="h-4 w-4 shrink-0 text-[#6b6b6b]" />
              {doc.title}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b6b6b] transition-colors group-hover:text-black">
              PDF
              <Download className="h-3.5 w-3.5" />
            </span>
          </a>
        ),
      )}
    </div>
  );
}

/** Financial-year selector, in the style of a typical listed-company filings
 *  page: pick a year and the list narrows to it.
 *
 *  Carries an "All" option and a count against every year, which the usual
 *  version of this control does not. Both are on purpose. A year selector
 *  that defaults to the newest year leaves everything older sitting behind a
 *  control the reader has to notice, and this company's filings run back to
 *  2011 — so "All" stays the default and the counts make it plain that
 *  nothing has gone missing. */
function YearFilter({
  years,
  counts,
  total,
  active,
  onChange,
}: {
  years: string[];
  counts: Record<string, number>;
  total: number;
  active: string;
  onChange: (y: string) => void;
}) {
  const options = [ALL_YEARS, ...years];
  const labelFor = (y: string) => (y === ALL_YEARS ? 'All years' : y);
  const countFor = (y: string) => (y === ALL_YEARS ? total : counts[y]);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">
          Financial year
        </span>
        {options.map((y) => {
          const on = y === active;
          return (
            <button
              key={y}
              type="button"
              onClick={() => onChange(y)}
              aria-pressed={on}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                on
                  ? 'border-black bg-black text-white'
                  : 'border-[#000000]/15 bg-white text-[#000000] hover:border-[#000000]/40'
              }`}
            >
              {labelFor(y)}
              <span className={on ? 'ml-1.5 text-white/60' : 'ml-1.5 text-[#6b6b6b]'}>
                {countFor(y)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function InvestorSection() {
  const { slug } = useParams<{ slug: string }>();
  const section = INVESTOR_SECTIONS.find((s) => s.slug === slug);
  const [query, setQuery] = useState('');
  const [year, setYear] = useState<string>(ALL_YEARS);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  // Every document the section holds, whichever shape it stores them in.
  const allDocs = useMemo<AnnualReport[]>(() => {
    if (!section) return [];
    if (section.kind === 'docs') return section.items;
    if (section.kind === 'groups') return section.groups.flatMap((g) => g.items);
    return [];
  }, [section]);

  // Years present in this section, newest first, with a count each.
  const { years, yearCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    allDocs.forEach((d) => {
      const b = fyBucket(d);
      if (b) counts[b] = (counts[b] ?? 0) + 1;
    });
    return {
      years: Object.keys(counts).sort((a, b) => Number(b.slice(0, 4)) - Number(a.slice(0, 4))),
      yearCounts: counts,
    };
  }, [allDocs]);

  const showYearFilter =
    !!section &&
    (section.kind === 'docs' || section.kind === 'groups') &&
    !NO_YEAR_FILTER.has(section.slug) &&
    allDocs.length >= YEAR_FILTER_MIN_DOCS &&
    years.length > 1;

  const matchesYear = (d: AnnualReport) => year === ALL_YEARS || fyBucket(d) === year;

  // Every document in the section, newest first — no year grouping, so the
  // whole list is visible on one page rather than one financial year at a time.
  const sortedFiltered = useMemo(() => {
    if (!section || section.kind !== 'docs') return [];
    const q = trimmedQuery.toLowerCase();
    const filtered = section.items.filter(
      (d) => matchesYear(d) && (!q || d.title.toLowerCase().includes(q)),
    );
    return [...filtered].sort((a, b) => sortKey(b) - sortKey(a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, trimmedQuery, year]);

  // Sections that keep their documents in named groups (Notice holds board
  // meeting and shareholder meeting notices separately). Searching filters
  // inside each group and empty groups drop out.
  const filteredGroups = useMemo(() => {
    if (!section || section.kind !== 'groups') return [];
    const q = trimmedQuery.toLowerCase();
    return section.groups
      .map((g) => ({
        label: g.label,
        items: [
          ...g.items.filter((d) => matchesYear(d) && (!q || d.title.toLowerCase().includes(q))),
        ].sort((a, b) => sortKey(b) - sortKey(a)),
      }))
      .filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, trimmedQuery, year]);

  const groupTotal =
    section?.kind === 'groups' ? section.groups.reduce((n, g) => n + g.items.length, 0) : 0;
  const groupMatches = filteredGroups.reduce((n, g) => n + g.items.length, 0);

  // Every /investor/:slug page is the same component instance, so React keeps
  // this state when the slug changes. Without clearing it, a query typed in
  // one section silently filters the next: searching "bonus" then opening
  // Annual Return (6 docs, too few for a search box) showed "No documents
  // match" with no visible input to clear, hiding the section entirely.
  useEffect(() => {
    setQuery('');
    setYear(ALL_YEARS);
  }, [slug]);

  // The app ships a single static <title>, so every investor page appeared as
  // "Logica Infoway" in tabs, bookmarks and search results. Name each one.
  useEffect(() => {
    if (!section) return;
    const previous = document.title;
    document.title = `${section.label} — Investor Relations | Logica Infoway`;
    return () => {
      document.title = previous;
    };
  }, [section]);

  if (!section) {
    return <Navigate to="/investor" replace />;
  }

  const CategoryIcon = CATEGORY_ICONS[section.category];
  const showSearch = section.kind === 'docs' && section.items.length > 8;

  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <Link to="/investor" className="text-xs font-medium text-black hover:opacity-80 transition-opacity">
            ← Investor Relations
          </Link>
          <div className="mt-4 flex items-center gap-2">
            {CategoryIcon && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-black">
                <CategoryIcon className="h-3.5 w-3.5" />
              </span>
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-black">{section.category}</p>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            {section.label}
          </h1>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-14">
        {section.kind === 'docs' && (
          <>
            {section.items.length === 0 ? (
              <p className="text-sm text-[#6b6b6b]">No documents published yet.</p>
            ) : (
              <div className="min-w-0">
                {showSearch && (
                  <div className="relative mb-6 max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b6b]" />
                    <input
                      type="search"
                      aria-label={`Search ${section.label} documents`}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Search ${section.items.length} documents…`}
                      className="w-full rounded-full border border-[#000000]/15 bg-white py-2.5 pl-11 pr-4 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
                    />
                  </div>
                )}

                {showYearFilter && (
                  <YearFilter
                    years={years}
                    counts={yearCounts}
                    total={allDocs.length}
                    active={year}
                    onChange={setYear}
                  />
                )}

                {sortedFiltered.length === 0 ? (
                  <p className="text-sm text-[#6b6b6b]">
                    {isSearching
                      ? `No documents match "${trimmedQuery}"${year === ALL_YEARS ? '' : ` in ${year}`}.`
                      : `No documents filed in ${year}.`}
                  </p>
                ) : (
                  <>
                    {isSearching && (
                      <h2 className="mb-4 text-lg font-semibold text-[#000000]">
                        {sortedFiltered.length} {sortedFiltered.length === 1 ? 'result' : 'results'} for "{trimmedQuery}"
                      </h2>
                    )}
                    <DocRows docs={sortedFiltered} />
                  </>
                )}
              </div>
            )}
          </>
        )}

        {section.kind === 'groups' && (
          <div className="min-w-0">
            {groupTotal > 8 && (
              <div className="relative mb-8 max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b6b]" />
                <input
                  type="search"
                  aria-label={`Search ${section.label} documents`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${groupTotal} documents…`}
                  className="w-full rounded-full border border-[#000000]/15 bg-white py-2.5 pl-11 pr-4 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
                />
              </div>
            )}

            {showYearFilter && (
              <YearFilter
                years={years}
                counts={yearCounts}
                total={allDocs.length}
                active={year}
                onChange={setYear}
              />
            )}

            {isSearching && (
              <h2 className="mb-4 text-lg font-semibold text-[#000000]">
                {groupMatches} {groupMatches === 1 ? 'result' : 'results'} for "{trimmedQuery}"
              </h2>
            )}

            {filteredGroups.length === 0 ? (
              <p className="text-sm text-[#6b6b6b]">
                {isSearching
                  ? `No documents match "${trimmedQuery}"${year === ALL_YEARS ? '' : ` in ${year}`}.`
                  : `No documents filed in ${year}.`}
              </p>
            ) : (
              filteredGroups.map((g) => (
                <section key={g.label} className="mb-12 last:mb-0">
                  <h2 className="mb-4 text-lg font-semibold text-[#000000]">
                    {g.label}
                    <span className="ml-2 text-sm font-normal text-[#6b6b6b]">({g.items.length})</span>
                  </h2>
                  <DocRows docs={g.items} />
                </section>
              ))
            )}
          </div>
        )}

        {section.kind === 'single' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href={section.doc.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-2xl border border-[#000000]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#000000]/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ECEDEC] text-black">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="rounded-full bg-[#ECEDEC] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#000000]">
                  PDF
                </span>
              </div>
              <p className="mt-4 flex-1 text-sm font-semibold leading-snug text-[#000000]">{section.doc.title}</p>
              <span className="mt-4 flex items-center gap-1 self-end text-xs font-medium text-black opacity-0 transition-opacity group-hover:opacity-100">
                View <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        )}

        {section.kind === 'names' && (
          <>
            <p className="text-sm text-[#6b6b6b] mb-6 leading-relaxed">
              Group companies associated with Logica Infoway Limited.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((name) => (
                <div key={name} className="flex flex-col items-start rounded-2xl border border-[#000000]/10 bg-white p-5 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ECEDEC] text-black">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <p className="mt-4 text-sm font-semibold leading-snug text-[#000000]">{name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
