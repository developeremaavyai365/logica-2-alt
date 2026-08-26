import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Testimonials from '../components/Testimonials';
import { pillars, scaleStats, nameHistory, offices } from '../data';
import { OVERVIEW_FINANCIALS, REGISTERED_OFFICE } from '../about-data';

const aboutLinks = [
  { to: '/about', label: 'Overview' },
  { to: '/about/organization-chart', label: 'Organization Chart' },
  { to: '/about/board-of-directors-and-kmp', label: 'Board of Directors & KMP' },
  { to: '/about/composition-of-committees', label: 'Composition of Committees' },
];

export default function About() {
  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-10">
          <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">About us</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            From Eastern Logica to Logica Infoway
          </h1>
          <p className="mt-5 text-[#6b6b6b] text-sm sm:text-base leading-relaxed">
            Cost-effective computer hardware, networking, and IT solutions for corporate and
            government — trusted since 1995.
          </p>
        </div>
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2 px-4 sm:px-6 md:px-10 pb-10">
          {aboutLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs font-medium px-4 py-2 rounded-full bg-white border border-[#000000]/10 text-[#6b6b6b] hover:text-[#000000] hover:border-[#000000]/30 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <p className="text-[#6b6b6b] text-sm sm:text-base leading-relaxed">
          Logica Infoway Limited was founded in 1995 as Eastern Logica Infoway Limited, registered
          as a public limited company in Kolkata, West Bengal — and has since held 28 Annual
          General Meetings as a listed company.
        </p>
        <p className="mt-4 text-[#6b6b6b] text-sm sm:text-base leading-relaxed">
          Three decades on, the company still operates from its original Kolkata roots while
          serving corporate and government clients across eight cities — Kolkata, Delhi, Noida,
          Gurugram, Lucknow, Hyderabad, Mumbai and Bangalore.
        </p>

        {/* Scale stats */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {scaleStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-[#ECEDEC] border border-[#000000]/10 p-5 text-center">
              <div className="text-2xl font-semibold text-[#000000]">{stat.value}</div>
              <div className="text-xs text-[#6b6b6b] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#6b6b6b]/70">As of March 31, 2025.</p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#000000]/10 p-5">
            <h3 className="text-sm font-semibold text-[#000000] mb-2">Financial performance</h3>
            <p className="text-sm text-[#6b6b6b] leading-relaxed">
              Profit before tax of {OVERVIEW_FINANCIALS.profitBeforeTax} in FY{OVERVIEW_FINANCIALS.year},
              up from {OVERVIEW_FINANCIALS.priorYearProfitBeforeTax} in FY{OVERVIEW_FINANCIALS.priorYear}.
            </p>
          </div>
          <div className="rounded-2xl border border-[#000000]/10 p-5">
            <h3 className="text-sm font-semibold text-[#000000] mb-2">Registered office</h3>
            <p className="text-sm text-[#6b6b6b] leading-relaxed">{REGISTERED_OFFICE.address}</p>
            <p className="mt-1 text-xs text-[#6b6b6b]/70">{REGISTERED_OFFICE.relocatedNote}</p>
          </div>
        </div>
      </section>

      {/* Name history timeline */}
      <section className="w-full bg-[#ECEDEC] py-16 sm:py-20 px-4 sm:px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">Incorporation history</span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            Three decades of name changes, one continuous business
          </h2>
          <div className="mt-10 space-y-0">
            {nameHistory.map((entry, i) => (
              <div
                key={entry.name}
                className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 py-4 ${
                  i !== nameHistory.length - 1 ? 'border-b border-[#000000]/10' : ''
                }`}
              >
                <span className="text-xs font-medium text-black sm:w-32 shrink-0">{entry.date}</span>
                <span className="text-sm font-semibold text-[#000000] sm:w-72 shrink-0">{entry.name}</span>
                <span className="text-sm text-[#6b6b6b]">{entry.event}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purpose + philosophy */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">Our purpose</span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
          Technology that works as hard as you do
        </h2>
        <p className="mt-5 text-[#6b6b6b] text-sm sm:text-base leading-relaxed">
          Our philosophy is that corporate enterprises must be managed not merely in the interests
          of their owners, but equally in those of their employees, of the consumers of their
          products, of the local community and finally of the country as a whole.
        </p>
        <p className="mt-4 text-[#6b6b6b] text-sm sm:text-base leading-relaxed">
          We ensure fair, transparent, accountable and ethical management — motivating every
          employee to play an integral role in the company's growth, and every customer to trust
          what we deliver.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl bg-[#ECEDEC] border border-[#000000]/10 p-6">
              <h3 className="text-base font-semibold text-[#000000] leading-snug">{pillar.title}</h3>
              <p className="mt-3 text-sm text-[#6b6b6b] leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />

      {/* Offices */}
      <section className="w-full bg-[#000000] py-16 sm:py-20 px-4 sm:px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">Where we operate</span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-normal text-white" style={{ letterSpacing: '-0.03em' }}>
            Our offices
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offices.map((office) => (
              <div key={office.city} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <h3 className="text-sm font-semibold text-white">{office.label}</h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">{office.address}</p>
                <p className="mt-3 text-xs text-white/50">{office.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
