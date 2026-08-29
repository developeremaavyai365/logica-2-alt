import { Link } from 'react-router-dom';
import { FileText, Building2, ChevronRight } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { INVESTOR_SECTIONS, INVESTOR_CATEGORIES, CATEGORY_ICONS } from '../../investor-sections';

const KIND_ICONS = {
  docs: FileText,
  groups: FileText,
  single: FileText,
  names: Building2,
} as const;

export default function InvestorHub() {
  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">Investor Relations</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            Reports, filings &amp; disclosures
          </h1>
          <p className="mt-4 text-[#6b6b6b] text-sm leading-relaxed">
            Logica Infoway Limited — CIN L30007WB1995PLC073218
          </p>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        {INVESTOR_CATEGORIES.map((category) => {
          const sections = INVESTOR_SECTIONS.filter((s) => s.category === category);
          if (sections.length === 0) return null;
          const CategoryIcon = CATEGORY_ICONS[category];
          return (
            <div key={category} className="mb-12">
              <div className="mb-4 flex items-center gap-2.5">
                {CategoryIcon && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ECEDEC] text-black">
                    <CategoryIcon className="h-4 w-4" />
                  </span>
                )}
                <h2 className="text-lg font-semibold text-[#000000]">{category}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sections.map((s) => {
                  const ItemIcon = KIND_ICONS[s.kind];
                  return (
                    <Link
                      key={s.slug}
                      to={`/investor/${s.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-[#000000]/10 px-5 py-4 text-sm font-medium text-[#000000] hover:border-[#000000]/40 hover:bg-[#ECEDEC] transition-colors"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ECEDEC] text-black">
                        <ItemIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1">{s.label}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#6b6b6b]" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <Footer />
    </div>
  );
}
