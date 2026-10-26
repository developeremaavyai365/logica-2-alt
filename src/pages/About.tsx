import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CAREERS_BLUE, CAREERS_NAVY } from '../components/careers/WavePanel';
import AboutHero, { ABOUT_CARD, AboutHeading } from '../components/about/AboutHero';
import FinancialBanner from '../components/about/FinancialBanner';
import IncorporationTimeline from '../components/about/IncorporationTimeline';
import OfficesPanel from '../components/about/OfficesPanel';
import { scaleStats, nameHistory } from '../data';
import BoardOfDirectors from './about/BoardOfDirectors';
import Committees from './about/Committees';
import Media from './Media';

/** The About page's three tabs. Each keeps its own URL, so a link can open
 *  any of them, but they are one page: switching tabs keeps the header and
 *  the hero where they are and swaps only what is below. */
const TABS = {
  '/about': {
    title: (
      <>
        Building Trust Across India{' '}
        <span className="bg-gradient-to-r from-white via-[#C7D4FF] to-[#8FAEFF] bg-clip-text text-transparent">Since 1995</span>
      </>
    ),
    subtitle: undefined,
    Content: Overview,
  },
  '/about/board-of-directors-and-kmp': {
    title: 'Board of Directors & KMP',
    subtitle: 'The Board and Key Managerial Personnel who lead Logica Infoway.',
    Content: BoardOfDirectors,
  },
  '/about/composition-of-committees': {
    title: 'Composition of Committees',
    subtitle: 'The committees that oversee audit, remuneration, stakeholder relations, workplace conduct and CSR at Logica Infoway.',
    Content: Committees,
  },
  '/about/media': {
    title: (
      <>
        Awards &amp;{' '}
        <span className="bg-gradient-to-r from-white via-[#C7D4FF] to-[#8FAEFF] bg-clip-text text-transparent">Moments</span>
      </>
    ),
    subtitle: 'Recognition from the brands we partner with, and the moments that make Logica Infoway what it is.',
    Content: Media,
  },
} as const;

export default function About() {
  const { pathname } = useLocation();
  const tab = TABS[pathname.replace(/\/+$/, '') as keyof typeof TABS] ?? TABS['/about'];
  const { Content } = tab;

  return (
    <div className="w-full bg-[#F5F8FC]">
      <div className="bg-white">
        <Header />
      </div>

      <AboutHero title={tab.title} subtitle={tab.subtitle} />

      {/* Keyed by tab so the new content fades in when the tab changes. */}
      <div key={pathname} className="animate-fade-up">
        <Content />
      </div>

      <Footer />
    </div>
  );
}

/** The Overview tab. */
function Overview() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:px-10">
        {/* Scale stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {scaleStats.map((stat) => (
            <div key={stat.label} className={`${ABOUT_CARD} p-6 text-center`}>
              <div
                className="font-dm-sans font-bold"
                style={{ color: CAREERS_NAVY, fontSize: 'clamp(34px, 3.6vw, 46px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
              >
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-[#6B7280]">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Was "As of March 31, 2025." That stamp has to go with the figures:
            these are the current operating figures the rest of the site
            publishes, not the ones that stood at that balance-sheet date, and
            leaving the old date under new numbers would attribute them to a
            reporting period they did not come from. */}
        <p className="mt-3 text-xs text-[#6B7280]/80">Current operating scale.</p>

        <FinancialBanner />
      </section>

      {/* Name history timeline */}
      <section className="w-full bg-white px-4 py-16 sm:px-6 sm:py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <AboutHeading eyebrow="Incorporation history">Three decades of name changes, one continuous business</AboutHeading>
          <IncorporationTimeline entries={nameHistory} />
        </div>
      </section>

      {/* Purpose */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:px-10">
        <span className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: CAREERS_BLUE }}>
          Our purpose
        </span>
        {/* The purpose statement, set as the section's headline. */}
        <h2
          className="mt-4 max-w-4xl font-dm-sans font-bold"
          style={{ color: CAREERS_NAVY, fontSize: 'clamp(28px, 3.6vw, 46px)', letterSpacing: '-0.025em', lineHeight: 1.18 }}
        >
          Empowerment through{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(110deg, ${CAREERS_NAVY} 0%, ${CAREERS_BLUE} 70%, #6F86FF 100%)` }}
          >
            Digital Technology
          </span>{' '}
          to make it more accessible, relevant and meaningful in everyday life.
        </h2>
      </section>

      {/* Offices — in the navy wave panel the role page closes on */}
      <OfficesPanel />
    </>
  );
}
