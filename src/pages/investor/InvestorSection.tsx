import { useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { FileText, Calendar, Building2, ArrowUpRight, Search } from 'lucide-react';
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

function financialYearLabel(year: number): string {
  return `Financial Year ${String(year % 100).padStart(2, '0')}`;
}

/** Groups a flat, sorted doc list into { label, sortKey, docs }[] buckets,
 *  newest first, falling back to "Undated" for docs with no year. */
function groupByYear(docs: AnnualReport[]) {
  const groups = new Map<string, { sortKey: number; docs: AnnualReport[] }>();
  for (const doc of docs) {
    const y = leadingYear(doc.year);
    const label = y === null ? 'Undated' : financialYearLabel(y);
    if (!groups.has(label)) groups.set(label, { sortKey: y ?? -1, docs: [] });
    groups.get(label)!.docs.push(doc);
  }
  return Array.from(groups.entries()).sort((a, b) => b[1].sortKey - a[1].sortKey);
}

function DocGrid({ docs }: { docs: AnnualReport[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc) => (
        <a
          key={doc.url}
          href={doc.url}
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
          <p className="mt-4 flex-1 text-sm font-semibold leading-snug text-[#000000]">{doc.title}</p>
          <div className="mt-4 flex items-center justify-between text-xs">
            {doc.year ? <span className="font-medium text-[#6b6b6b]">FY {doc.year}</span> : <span />}
            <span className="flex items-center gap-1 font-medium text-black opacity-0 transition-opacity group-hover:opacity-100">
              View <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function InvestorSection() {
  const { slug } = useParams<{ slug: string }>();
  const section = INVESTOR_SECTIONS.find((s) => s.slug === slug);
  const [query, setQuery] = useState('');

  const sortedFiltered = useMemo(() => {
    if (!section || section.kind !== 'docs') return [];
    const q = query.trim().toLowerCase();
    const filtered = q ? section.items.filter((d) => d.title.toLowerCase().includes(q)) : section.items;
    return [...filtered].sort((a, b) => (leadingYear(b.year) ?? -1) - (leadingYear(a.year) ?? -1));
  }, [section, query]);

  if (!section) {
    return <Navigate to="/investor" replace />;
  }

  const CategoryIcon = CATEGORY_ICONS[section.category];
  const grouped = section.kind === 'docs' ? groupByYear(sortedFiltered) : [];
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
              <>
                {showSearch && (
                  <div className="relative mb-8 max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b6b]" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Search ${section.items.length} documents…`}
                      className="w-full rounded-full border border-[#000000]/15 bg-white py-2.5 pl-11 pr-4 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
                    />
                  </div>
                )}

                {sortedFiltered.length === 0 ? (
                  <p className="text-sm text-[#6b6b6b]">No documents match "{query}".</p>
                ) : (
                  <div className="space-y-10">
                    {grouped.map(([label, group]) => (
                      <div key={label}>
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">
                          {label}
                          <span className="ml-2 font-normal normal-case text-[#6b6b6b]/60">({group.docs.length})</span>
                        </h2>
                        <DocGrid docs={group.docs} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {section.kind === 'periods' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col rounded-2xl border border-[#000000]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#000000]/30 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ECEDEC] text-black">
                  <Calendar className="w-5 h-5" />
                </span>
                <p className="mt-4 flex-1 text-sm font-semibold leading-snug text-[#000000]">{p.label}</p>
                <span className="mt-4 flex items-center gap-1 self-end text-xs font-medium text-black opacity-0 transition-opacity group-hover:opacity-100">
                  View <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </a>
            ))}
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
