import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { INVESTOR_SECTIONS, INVESTOR_CATEGORIES } from '../../investor-sections';

export default function InvestorHub() {
  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-[#3d5638] text-xs sm:text-sm font-semibold uppercase tracking-wide">Investor Relations</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
            Reports, filings &amp; disclosures
          </h1>
          <p className="mt-4 text-[#4b5b47] text-sm leading-relaxed">
            Logica Infoway Limited — CIN L30007WB1995PLC073218
          </p>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        {INVESTOR_CATEGORIES.map((category) => {
          const sections = INVESTOR_SECTIONS.filter((s) => s.category === category);
          if (sections.length === 0) return null;
          return (
            <div key={category} className="mb-12">
              <h2 className="text-lg font-semibold text-[#1f2a1d] mb-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sections.map((s) => (
                  <Link
                    key={s.slug}
                    to={`/investor/${s.slug}`}
                    className="rounded-xl border border-[#1f2a1d]/10 px-5 py-4 text-sm font-medium text-[#1f2a1d] hover:border-[#1f2a1d]/40 hover:bg-[#f4f8f3] transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <Footer />
    </div>
  );
}
