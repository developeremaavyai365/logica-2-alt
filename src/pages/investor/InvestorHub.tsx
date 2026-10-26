import { Link } from 'react-router-dom';
import { FileText, Building2, ChevronRight, ListChecks } from 'lucide-react';
import { ABOUT_CARD } from '../../components/about/AboutHero';
import { INVESTOR_CATEGORIES, CATEGORY_ICONS, INVESTOR_SECTIONS, INVESTOR_TABS } from '../../investor-sections';

const KIND_ICONS = {
  docs: FileText,
  groups: FileText,
  single: FileText,
  names: Building2,
  // An index of where things are published, not a document itself.
  disclosure: ListChecks,
} as const;

/** The Investor Relations overview: every page, grouped by category. The
 *  body of /investor, under the investor page's hero. */
export default function InvestorHub() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:px-10">
      {INVESTOR_CATEGORIES.map((category) => {
        const pages = INVESTOR_TABS.find((g) => g.category === category)?.items ?? [];
        if (pages.length === 0) return null;
        const CategoryIcon = CATEGORY_ICONS[category];
        return (
          <div key={category} className="mb-12 last:mb-0">
            <div className="mb-5 flex items-center gap-3">
              {CategoryIcon && (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FD] text-[#3D4FE0]">
                  <CategoryIcon className="h-5 w-5" />
                </span>
              )}
              <h2 className="font-dm-sans text-2xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.02em' }}>
                {category}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => {
                const kind = INVESTOR_SECTIONS.find((sec) => sec.slug === page.slug)?.kind;
                const ItemIcon = kind ? KIND_ICONS[kind] : FileText;
                return (
                  <Link
                    key={page.href}
                    to={page.href}
                    className={`group flex items-center gap-3.5 px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-18px_rgba(6,26,64,0.3)] ${ABOUT_CARD}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F8FC] text-[#3D4FE0]">
                      <ItemIcon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[15px] font-semibold text-[#061A40]">{page.label}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#6B7280] transition-transform group-hover:translate-x-0.5 group-hover:text-[#3D4FE0]" />
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
