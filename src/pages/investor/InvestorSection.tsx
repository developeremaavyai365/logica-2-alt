import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Building2, ArrowUpRight, Search, Download, ChevronDown, Check } from 'lucide-react';
import { CAREERS_BLUE, CAREERS_NAVY } from '../../components/careers/WavePanel';
import { ABOUT_CARD } from '../../components/about/AboutHero';
import type { InvestorSection as InvestorSectionData } from '../../investor-sections';
import type { AnnualReport } from '../../investor-data';
import { leadingYear, sortKey } from '../../investor-sort';
import Reg46Accordion from '../../components/investor/Reg46Accordion';

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
    <div className={`divide-y divide-[#EEF1F6] overflow-hidden ${ABOUT_CARD}`}>
      {docs.map((doc) =>
        doc.available === false ? (
          <div
            key={doc.url}
            className="flex cursor-not-allowed items-center justify-between gap-4 px-6 py-4 opacity-60"
          >
            <span className="flex items-center gap-3 text-[15px] font-medium" style={{ color: CAREERS_NAVY }}>
              <FileText className="h-4 w-4 shrink-0 text-[#6B7280]" />
              {doc.title}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Document unavailable
            </span>
          </div>
        ) : (
          <a
            key={doc.url}
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#F5F8FC]"
          >
            <span className="flex items-center gap-3 text-[15px] font-medium" style={{ color: CAREERS_NAVY }}>
              <FileText className="h-4 w-4 shrink-0" style={{ color: CAREERS_BLUE }} />
              {doc.title}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#3D4FE0] transition-colors group-hover:border-transparent group-hover:bg-[#3D4FE0] group-hover:text-white">
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
 *  Carries an "All years" option, which that control usually does not, and
 *  keeps it as the default. Filings here run back to 2011-12, so opening on
 *  the newest year would leave everything older sitting behind a control the
 *  reader has to notice first. */
function YearFilter({
  years,
  active,
  onChange,
}: {
  years: string[];
  active: string;
  onChange: (y: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const options = [ALL_YEARS, ...years];
  const labelFor = (y: string) => (y === ALL_YEARS ? 'All years' : y);

  // A dropdown that only closed on selection would trap the reader whenever
  // they opened it to look and changed their mind.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Financial year</span>

      <div ref={wrap} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-md py-2 pl-4 pr-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: CAREERS_BLUE }}
        >
          {labelFor(active)}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            aria-label="Financial year"
            className="absolute left-0 top-full z-30 mt-1.5 max-h-72 min-w-[13rem] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-[0_20px_40px_-16px_rgba(6,26,64,0.3)]"
          >
            {options.map((y) => {
              const on = y === active;
              return (
                <li key={y}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      onChange(y);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-[#F5F8FC] ${
                      on ? 'font-semibold text-[#3D4FE0]' : 'text-[#6B7280]'
                    }`}
                  >
                    {on ? (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}
                    {labelFor(y)}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/** One investor section's documents: the body of /investor/:slug, under the
 *  investor page's hero (which carries the title and the navigation). */
export default function InvestorSection({ section }: { section: InvestorSectionData }) {
  const slug = section.slug;
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

  // Financial years present in this section, newest first.
  const years = useMemo(() => {
    const seen = new Set<string>();
    allDocs.forEach((d) => {
      const b = fyBucket(d);
      if (b) seen.add(b);
    });
    return [...seen].sort((a, b) => Number(b.slice(0, 4)) - Number(a.slice(0, 4)));
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

  const showSearch = section.kind === 'docs' && section.items.length > 8;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:px-10">
        {section.kind === 'docs' && (
          <>
            {section.items.length === 0 ? (
              <p className={`${ABOUT_CARD} px-6 py-10 text-center text-[15px] text-[#6B7280]`}>No documents published yet.</p>
            ) : (
              <div className="min-w-0">
                {showSearch && (
                  <div className="relative mb-6 max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="search"
                      aria-label={`Search ${section.label} documents`}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Search ${section.items.length} documents…`}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#061A40] shadow-[0_6px_18px_-12px_rgba(6,26,64,0.2)] outline-none transition-colors placeholder:text-[#6B7280]/70 focus:border-[#3D4FE0] focus:ring-2 focus:ring-[#3D4FE0]/15"
                    />
                  </div>
                )}

                {showYearFilter && (
                  <YearFilter years={years} active={year} onChange={setYear} />
                )}

                {sortedFiltered.length === 0 ? (
                  <p className={`${ABOUT_CARD} px-6 py-10 text-center text-[15px] text-[#6B7280]`}>
                    {isSearching
                      ? `No documents match "${trimmedQuery}"${year === ALL_YEARS ? '' : ` in ${year}`}.`
                      : `No documents filed in ${year}.`}
                  </p>
                ) : (
                  <>
                    {isSearching && (
                      <h2 className="mb-4 font-dm-sans text-xl font-bold text-[#061A40]">
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
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="search"
                  aria-label={`Search ${section.label} documents`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${groupTotal} documents…`}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#061A40] shadow-[0_6px_18px_-12px_rgba(6,26,64,0.2)] outline-none transition-colors placeholder:text-[#6B7280]/70 focus:border-[#3D4FE0] focus:ring-2 focus:ring-[#3D4FE0]/15"
                />
              </div>
            )}

            {showYearFilter && (
              <YearFilter years={years} active={year} onChange={setYear} />
            )}

            {isSearching && (
              <h2 className="mb-4 font-dm-sans text-xl font-bold text-[#061A40]">
                {groupMatches} {groupMatches === 1 ? 'result' : 'results'} for "{trimmedQuery}"
              </h2>
            )}

            {filteredGroups.length === 0 ? (
              <p className={`${ABOUT_CARD} px-6 py-10 text-center text-[15px] text-[#6B7280]`}>
                {isSearching
                  ? `No documents match "${trimmedQuery}"${year === ALL_YEARS ? '' : ` in ${year}`}.`
                  : `No documents filed in ${year}.`}
              </p>
            ) : (
              filteredGroups.map((g) => (
                <section key={g.label} className="mb-12 last:mb-0">
                  <h2 className="mb-4 font-dm-sans text-xl font-bold text-[#061A40]">
                    {g.label}
                    <span className="ml-2 text-sm font-normal text-[#6B7280]">({g.items.length})</span>
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
              className={`group flex flex-col p-6 transition-all hover:-translate-y-0.5 ${ABOUT_CARD}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FD] text-[#3D4FE0]">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="rounded-md border border-[#E5E7EB] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  PDF
                </span>
              </div>
              <p className="mt-4 flex-1 text-base font-semibold leading-snug text-[#061A40]">{section.doc.title}</p>
              <span className="mt-4 flex items-center gap-1 self-end text-sm font-medium text-[#3D4FE0]">
                View <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        )}

        {section.kind === 'names' && (
          <>
            <p className="mb-6 text-[15px] leading-relaxed text-[#6B7280]">
              Group companies associated with Logica Infoway Limited.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((name) => (
                <div key={name} className={`flex flex-col items-start p-6 ${ABOUT_CARD}`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FD] text-[#3D4FE0]">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <p className="mt-4 text-base font-semibold leading-snug text-[#061A40]">{name}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {section.kind === 'disclosure' && <Reg46Accordion rows={section.rows} />}
    </section>
  );
}
