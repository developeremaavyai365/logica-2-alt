import { Link } from 'react-router-dom';
import { INVESTOR_TABS, CATEGORY_ICONS } from '../investor-sections';

/* Five banners, naming the investor categories rather than linking to them —
   the single "Visit Investor Section" CTA is the only way into those pages
   from here. The categories and their icons still come from INVESTOR_TABS
   and CATEGORY_ICONS, the same two exports the investor pages' own tab bar
   navigates by, so this list cannot list a category that page does not
   have, or in a different order. */
const BANNERS = INVESTOR_TABS.map((group) => ({
  category: group.category,
  Icon: CATEGORY_ICONS[group.category],
}));

export default function FinancialHighlights() {
  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      {/* One heading, centred, full width, above the two columns — no
          eyebrow over it. Every other section on the page pairs a small
          green label with its heading, but there the label names the
          section ("WHO WE ARE") and the heading says something about it;
          here the categories underneath already do that naming, so a label
          above would only have repeated "investors" a second time.

          Wording deliberately reaches for real IR vocabulary — "disclosure"
          is the term for exactly what these five categories are — rather
          than a generic "for our investors", and "one destination" is a
          literal description of what the banners below actually do, not a
          slogan bolted on for effect. */}
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="font-dm-sans font-bold text-[#111111]"
          style={{ fontSize: 'clamp(24px, 2.8vw, 38px)', letterSpacing: '-0.03em', lineHeight: 1.14 }}
        >
          Complete Disclosure. One Destination.
        </h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 items-stretch gap-10 sm:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* The banners, stacked — a naming of the five categories rather
            than five more links to click through, so nothing here promises
            a destination it does not lead to. The one way into the investor
            pages is the single CTA on the right.

            The hover is .btn-liquid, the same rise-from-the-bottom fill the
            careers page's own buttons use elsewhere on the site, rather than
            a treatment invented just for this row. No entry animation —
            visible immediately, nothing waiting on any state to reveal it. */}
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {BANNERS.map(({ category, Icon }) => (
            <li key={category}>
              <div
                className="group btn-liquid flex items-center gap-4 rounded-2xl border border-black/10 px-6 py-5 sm:px-7"
                style={{ '--liquid': '#15803D', '--liquid-ink': '#ffffff' } as React.CSSProperties}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F2] text-[#15803D] transition-colors duration-300 group-hover:bg-white/90 sm:h-12 sm:w-12">
                  {Icon && <Icon className="h-5 w-5" strokeWidth={2} />}
                </span>
                <span
                  className="font-dm-sans font-bold"
                  style={{ fontSize: 'clamp(15px, 1.25vw, 18px)', letterSpacing: '-0.015em' }}
                >
                  {category}
                </span>
              </div>
            </li>
          ))}
        </ol>

        {/* The pitch and the way in, carried on the investor desk photograph
            rather than on plain white — the same wash-over-photo treatment
            the closing tiles use (photograph, gradient wash, white text),
            so this reads as one more instance of a pattern the page already
            has rather than a new one invented for this segment alone.
            Photo sized 4:5 and object-cover, so it holds its shape at any
            column height the grid gives it rather than needing a fixed
            height set here. */}
        <div className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl sm:min-h-[26rem]">
          <img
            src="/images/investor-desk.jpg"
            alt="Reviewing market and portfolio data on a laptop and phone at a desk"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[850ms] ease-out group-hover:scale-[1.04]"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

          <div className="relative z-10 p-7 sm:p-8">
            <p
              className="font-inter max-w-md font-semibold text-white"
              style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', lineHeight: 1.65, textWrap: 'pretty' }}
            >
              Annual reports and results, board and shareholder notices, fund raising records,
              stock exchange filings and the group's other companies — five categories, one page
              each leads to.
            </p>

            {/* Circle and label inverted for the dark photo behind them —
                same shape and motion as the closing tiles' arrow, filled
                white on a light card there, white-on-transparent here. */}
            <Link
              to="/investor"
              className="mt-6 inline-flex items-center gap-3 text-white outline-none"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 transition-colors duration-300 group-hover:border-[#15803D] group-hover:bg-[#15803D]">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
              <span
                className="font-inter font-medium"
                style={{ fontSize: 'clamp(14px, 1.05vw, 16px)' }}
              >
                Visit Investor Section
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
