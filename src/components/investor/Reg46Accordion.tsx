import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ChevronDown, Download, FileText } from 'lucide-react';
import { INVESTOR_SECTIONS, INVESTOR_TABS } from '../../investor-sections';
import { AUTHORIZED_PERSON, GRIEVANCE_OFFICER, REGISTRAR, type AnnualReport, type Reg46Row } from '../../investor-data';
import { sortKey } from '../../investor-sort';
import { nameHistory } from '../../data';

/** How many of a section's documents a clause shows before "View all". */
const PREVIEW = 6;

/** Every investor document by URL, for the clauses that name theirs. */
const DOCS_BY_URL = new Map<string, AnnualReport>(
  INVESTOR_SECTIONS.flatMap((s) =>
    s.kind === 'docs' ? s.items : s.kind === 'groups' ? s.groups.flatMap((g) => g.items) : s.kind === 'single' ? [s.doc] : [],
  ).map((d) => [d.url, d]),
);

/** Names for the site pages a clause can point at that are not investor
 *  sections. */
const PAGE_NAMES: Record<string, string> = {
  '/about': 'About Us',
  '/about/board-of-directors-and-kmp': 'Board of Directors & KMP',
  '/about/composition-of-committees': 'Composition of Committees',
};
const pageName = (href: string) =>
  PAGE_NAMES[href] ?? INVESTOR_TABS.flatMap((g) => g.items).find((i) => i.href === href)?.label ?? href;

const SUB_ROW = 'flex items-center gap-3 border-t border-[#EEF1F6] py-3.5 pl-5 pr-5 sm:pl-[4.75rem]';

function DocRow({ title, href }: { title: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`group ${SUB_ROW} transition-colors hover:bg-[#F5F8FC]`}>
      <FileText className="h-4 w-4 shrink-0 text-[#3D4FE0]" />
      <span className="min-w-0 flex-1 text-[15px] text-[#061A40]">{title}</span>
      <span className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#3D4FE0] transition-colors group-hover:border-transparent group-hover:bg-[#3D4FE0] group-hover:text-white">
        PDF
        <Download className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}

function PageRow({ href, label }: { href: string; label: string }) {
  return (
    <Link to={href} className={`group ${SUB_ROW} transition-colors hover:bg-[#F5F8FC]`}>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#3D4FE0]" />
      <span className="min-w-0 flex-1 text-[15px] font-medium text-[#3D4FE0] group-hover:underline group-hover:underline-offset-2">{label}</span>
    </Link>
  );
}

/** Contact details as a short stack of lines, the first (the name) set on a
 *  blue band. */
function ContactLines({ lines }: { lines: ReactNode[] }) {
  return (
    <div className="border-t border-[#EEF1F6] px-5 py-4 sm:pl-[4.75rem]">
      <div className="max-w-xl overflow-hidden rounded-lg border border-[#E5E7EB]">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`px-4 py-3 text-[15px] leading-relaxed ${
              i === 0 ? 'bg-[#3D4FE0] font-semibold text-white' : 'border-t border-[#E5E7EB] text-[#061A40]'
            }`}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function OfficerContact() {
  const o = GRIEVANCE_OFFICER;
  return (
    <ContactLines
      lines={[
        o.name,
        o.designation,
        o.company,
        <>Registered Office: {o.registeredOffice}</>,
        <>
          Email:{' '}
          <a href={`mailto:${o.email}`} className="text-[#3D4FE0] hover:underline">
            {o.email}
          </a>
        </>,
        <>Contact: {o.phone}</>,
      ]}
    />
  );
}

function AuthorizedContact() {
  const a = AUTHORIZED_PERSON;
  return (
    <ContactLines
      lines={[
        a.name,
        a.designation,
        <>
          Email:{' '}
          <a href={`mailto:${a.email}`} className="text-[#3D4FE0] hover:underline">
            {a.email}
          </a>
        </>,
        <>Phone: {a.phone}</>,
      ]}
    />
  );
}

/** A boxed statement where a clause has nothing to file: "Nil Disclosure",
 *  "Not Applicable". */
function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-[#EEF1F6] px-5 py-4 sm:pl-[4.75rem]">
      <div className="flex flex-col gap-3 rounded-xl border border-[#D6DEF5] bg-[#F7F9FE] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-dm-sans text-base font-bold text-[#061A40]">{title}</p>
          <p className="mt-1 text-[15px] leading-relaxed text-[#6B7280]">{text}</p>
        </div>
        <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Disclosed
        </span>
      </div>
    </div>
  );
}

function RegistrarContact() {
  const r = REGISTRAR;
  return (
    <ContactLines
      lines={[
        r.name,
        r.role,
        r.address,
        <>
          Email:{' '}
          <a href={`mailto:${r.email}`} className="text-[#3D4FE0] hover:underline">
            {r.email}
          </a>
        </>,
      ]}
    />
  );
}

/** The current name and the one before it, from the incorporation history. */
function NameChange() {
  const current = nameHistory[nameHistory.length - 1];
  const previous = nameHistory[nameHistory.length - 2];
  return (
    <ContactLines
      lines={[
        <>New name: {current.name}</>,
        <>Old name: {previous.name}</>,
        <>Name changed on {current.date}</>,
      ]}
    />
  );
}

/** What opens under a clause: its contact details, its documents (newest
 *  first, the rest a click away), or the page it points at. */
function ClauseContent({ row }: { row: Reg46Row }) {
  if (row.notice) return <Notice {...row.notice} />;
  if (row.show === 'names') return <NameChange />;
  if (row.show === 'none-yet') {
    return <p className={`${SUB_ROW} text-[15px] text-[#6B7280]`}>Nothing has been published under this item yet.</p>;
  }
  if (row.contact === 'officer') return <OfficerContact />;
  if (row.contact === 'authorized') return <AuthorizedContact />;
  if (row.contact === 'officials') {
    return (
      <>
        <OfficerContact />
        <RegistrarContact />
      </>
    );
  }
  // A clause that names its documents shows exactly those, in its order.
  if (row.docs) {
    return (
      <>
        {row.docs.map((d) => (
          <DocRow key={d.url} title={d.title ?? DOCS_BY_URL.get(d.url)?.title ?? d.url} href={d.url} />
        ))}
      </>
    );
  }
  if (!row.href.startsWith('/')) return <DocRow title={row.docTitle ?? row.particulars} href={row.href} />;

  const section = row.href.startsWith('/investor/')
    ? INVESTOR_SECTIONS.find((s) => s.slug === row.href.slice('/investor/'.length))
    : undefined;
  if (section?.kind === 'single') return <DocRow title={section.doc.title} href={section.doc.url} />;
  if (section?.kind === 'docs' || section?.kind === 'groups') {
    // The section's documents, less any filed there that are not what the
    // clause asks for, plus any filed elsewhere that are.
    const excluded = new Set(row.exclude ?? []);
    const included = (row.include ?? []).map((url) => DOCS_BY_URL.get(url)).filter((d): d is AnnualReport => !!d);
    const docs: AnnualReport[] = [...(section.kind === 'docs' ? section.items : section.groups.flatMap((g) => g.items)), ...included]
      .filter((d) => d.available !== false && !excluded.has(d.url))
      .sort((a, b) => sortKey(b) - sortKey(a));
    if (docs.length === 0) return <PageRow href={row.href} label={`${section.label} page`} />;
    return (
      <>
        {docs.slice(0, PREVIEW).map((d) => (
          <DocRow key={d.url} title={d.title} href={d.url} />
        ))}
        {docs.length > PREVIEW && <PageRow href={row.href} label={`View all on the ${section.label} page`} />}
      </>
    );
  }
  return <PageRow href={row.href} label={pageName(row.href)} />;
}

/** The Regulation 46 disclosures as a list of clauses, each opening onto
 *  what is published under it — the layout listed companies commonly use
 *  for this page. */
export default function Reg46Accordion({ rows }: { rows: Reg46Row[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const toggle = (clause: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(clause)) next.delete(clause);
      else next.add(clause);
      return next;
    });

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const on = open.has(row.clause);
        const id = `reg46-${row.clause.replace(/[^a-z0-9]/gi, '')}`;
        return (
          <div
            key={row.clause}
            className={`overflow-hidden rounded-xl border bg-white transition-shadow duration-300 ${
              on ? 'border-[#C9D3F2] shadow-[0_14px_34px_-18px_rgba(6,26,64,0.28)]' : 'border-[#E5E7EB] shadow-[0_6px_18px_-14px_rgba(6,26,64,0.2)]'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(row.clause)}
              aria-expanded={on}
              aria-controls={id}
              className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F5F8FC]"
            >
              <span className="w-12 shrink-0 pt-px text-[15px] font-semibold tabular-nums text-[#3D4FE0] sm:w-14">{row.clause}</span>
              <span className="min-w-0 flex-1 text-[15px] font-medium leading-relaxed text-[#061A40] sm:text-base">{row.particulars}</span>
              <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-[#6B7280] transition-transform duration-300 ${on ? 'rotate-180 text-[#3D4FE0]' : ''}`} />
            </button>
            {on && (
              <div id={id} className="motion-safe:animate-fade-up">
                <ClauseContent row={row} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
