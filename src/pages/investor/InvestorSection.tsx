import { useParams, Link, Navigate } from 'react-router-dom';
import { FileText, ExternalLink } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { INVESTOR_SECTIONS } from '../../investor-sections';

export default function InvestorSection() {
  const { slug } = useParams<{ slug: string }>();
  const section = INVESTOR_SECTIONS.find((s) => s.slug === slug);

  if (!section) {
    return <Navigate to="/investor" replace />;
  }

  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <Link to="/investor" className="text-xs font-medium text-[#3d5638] hover:opacity-80 transition-opacity">
            ← Investor Relations
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#3d5638]">{section.category}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
            {section.label}
          </h1>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-14">
        {section.kind === 'docs' && (
          <div className="rounded-2xl border border-[#1f2a1d]/10 overflow-hidden">
            {section.items.length === 0 && (
              <p className="p-6 text-sm text-[#4b5b47]">No documents published yet.</p>
            )}
            {section.items.map((doc, i) => (
              <a
                key={doc.url}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between gap-4 px-5 py-4 text-sm hover:bg-[#f4f8f3] transition-colors ${
                  i !== section.items.length - 1 ? 'border-b border-[#1f2a1d]/10' : ''
                }`}
              >
                <span className="flex items-center gap-3 text-[#1f2a1d] font-medium">
                  <FileText className="w-4 h-4 text-[#3d5638] shrink-0" />
                  {doc.title} {doc.year && <span className="text-[#4b5b47] font-normal">({doc.year})</span>}
                </span>
                <ExternalLink className="w-4 h-4 text-[#4b5b47] shrink-0" />
              </a>
            ))}
          </div>
        )}

        {section.kind === 'periods' && (
          <div className="rounded-2xl border border-[#1f2a1d]/10 overflow-hidden">
            {section.items.map((p, i) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between gap-4 px-5 py-4 text-sm hover:bg-[#f4f8f3] transition-colors ${
                  i !== section.items.length - 1 ? 'border-b border-[#1f2a1d]/10' : ''
                }`}
              >
                <span className="text-[#1f2a1d] font-medium">{p.label}</span>
                <ExternalLink className="w-4 h-4 text-[#4b5b47] shrink-0" />
              </a>
            ))}
          </div>
        )}

        {section.kind === 'single' && (
          <a
            href={section.doc.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#1f2a1d]/10 px-5 py-4 text-sm hover:bg-[#f4f8f3] transition-colors"
          >
            <span className="flex items-center gap-3 text-[#1f2a1d] font-medium">
              <FileText className="w-4 h-4 text-[#3d5638] shrink-0" />
              {section.doc.title}
            </span>
            <ExternalLink className="w-4 h-4 text-[#4b5b47] shrink-0" />
          </a>
        )}

        {section.kind === 'names' && (
          <>
            <p className="text-sm text-[#4b5b47] mb-6 leading-relaxed">
              Group companies associated with Logica Infoway Limited.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.items.map((name) => (
                <div key={name} className="rounded-xl border border-[#1f2a1d]/10 px-5 py-4 text-sm font-medium text-[#1f2a1d]">
                  {name}
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
