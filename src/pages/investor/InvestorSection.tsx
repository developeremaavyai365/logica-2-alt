import { useParams, Link, Navigate } from 'react-router-dom';
import { FileText, Calendar, Building2, ArrowUpRight } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { INVESTOR_SECTIONS, CATEGORY_ICONS } from '../../investor-sections';

export default function InvestorSection() {
  const { slug } = useParams<{ slug: string }>();
  const section = INVESTOR_SECTIONS.find((s) => s.slug === slug);

  if (!section) {
    return <Navigate to="/investor" replace />;
  }

  const CategoryIcon = CATEGORY_ICONS[section.category];

  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <Link to="/investor" className="text-xs font-medium text-[#3d5638] hover:opacity-80 transition-opacity">
            ← Investor Relations
          </Link>
          <div className="mt-4 flex items-center gap-2">
            {CategoryIcon && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#3d5638]">
                <CategoryIcon className="h-3.5 w-3.5" />
              </span>
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-[#3d5638]">{section.category}</p>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
            {section.label}
          </h1>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-14">
        {section.kind === 'docs' && (
          <>
            {section.items.length === 0 ? (
              <p className="text-sm text-[#4b5b47]">No documents published yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((doc) => (
                  <a
                    key={doc.url}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col rounded-2xl border border-[#1f2a1d]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1f2a1d]/30 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4f8f3] text-[#3d5638]">
                        <FileText className="w-5 h-5" />
                      </span>
                      <span className="rounded-full bg-[#dbe8d6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#336443]">
                        PDF
                      </span>
                    </div>
                    <p className="mt-4 flex-1 text-sm font-semibold leading-snug text-[#1f2a1d]">{doc.title}</p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      {doc.year ? <span className="font-medium text-[#4b5b47]">FY {doc.year}</span> : <span />}
                      <span className="flex items-center gap-1 font-medium text-[#3d5638] opacity-0 transition-opacity group-hover:opacity-100">
                        View <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
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
                className="group flex flex-col rounded-2xl border border-[#1f2a1d]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1f2a1d]/30 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4f8f3] text-[#3d5638]">
                  <Calendar className="w-5 h-5" />
                </span>
                <p className="mt-4 flex-1 text-sm font-semibold leading-snug text-[#1f2a1d]">{p.label}</p>
                <span className="mt-4 flex items-center gap-1 self-end text-xs font-medium text-[#3d5638] opacity-0 transition-opacity group-hover:opacity-100">
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
              className="group flex flex-col rounded-2xl border border-[#1f2a1d]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1f2a1d]/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4f8f3] text-[#3d5638]">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="rounded-full bg-[#dbe8d6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#336443]">
                  PDF
                </span>
              </div>
              <p className="mt-4 flex-1 text-sm font-semibold leading-snug text-[#1f2a1d]">{section.doc.title}</p>
              <span className="mt-4 flex items-center gap-1 self-end text-xs font-medium text-[#3d5638] opacity-0 transition-opacity group-hover:opacity-100">
                View <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        )}

        {section.kind === 'names' && (
          <>
            <p className="text-sm text-[#4b5b47] mb-6 leading-relaxed">
              Group companies associated with Logica Infoway Limited.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((name) => (
                <div key={name} className="flex flex-col items-start rounded-2xl border border-[#1f2a1d]/10 bg-white p-5 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4f8f3] text-[#3d5638]">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <p className="mt-4 text-sm font-semibold leading-snug text-[#1f2a1d]">{name}</p>
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
