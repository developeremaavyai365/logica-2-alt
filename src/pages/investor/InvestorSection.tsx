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

export default function InvestorSection() {
  const { slug } = useParams<{ slug: string }>();
  const section = INVESTOR_SECTIONS.find((s) => s.slug === slug);
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  // Every document in the section, newest first — no year grouping, so the
  // whole list is visible on one page rather than one financial year at a time.
  const sortedFiltered = useMemo(() => {
    if (!section || section.kind !== 'docs') return [];
    const q = trimmedQuery.toLowerCase();
    const filtered = q ? section.items.filter((d) => d.title.toLowerCase().includes(q)) : section.items;
    return [...filtered].sort((a, b) => sortKey(b) - sortKey(a));
  }, [section, trimmedQuery]);

  // Sections that keep their documents in named groups (Notice holds board
  // meeting and shareholder meeting notices separately). Searching filters
  // inside each group and empty groups drop out.
  const filteredGroups = useMemo(() => {
    if (!section || section.kind !== 'groups') return [];
    const q = trimmedQuery.toLowerCase();
    return section.groups
      .map((g) => ({
        label: g.label,
        items: [...(q ? g.items.filter((d) => d.title.toLowerCase().includes(q)) : g.items)].sort(
          (a, b) => sortKey(b) - sortKey(a),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [section, trimmedQuery]);

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

                {sortedFiltered.length === 0 ? (
                  <p className="text-sm text-[#6b6b6b]">No documents match "{trimmedQuery}".</p>
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

            {isSearching && (
              <h2 className="mb-4 text-lg font-semibold text-[#000000]">
                {groupMatches} {groupMatches === 1 ? 'result' : 'results'} for "{trimmedQuery}"
              </h2>
            )}

            {filteredGroups.length === 0 ? (
              <p className="text-sm text-[#6b6b6b]">No documents match "{trimmedQuery}".</p>
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
