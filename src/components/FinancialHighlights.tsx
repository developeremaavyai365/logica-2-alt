import { Link } from 'react-router-dom';
import { INVESTOR_TABS, CATEGORY_ICONS } from '../investor-sections';
import { useInView } from '../use-in-view';

/* Five banners, one per investor category, each linking straight to the
   first page inside it — Performance opens on Annual Report, Shareholder
   Information on Notice, and so on. The categories and their icons are the
   same INVESTOR_TABS and CATEGORY_ICONS the investor pages themselves
   navigate by, so this list and that one cannot drift apart: add a category
   there and it appears here without touching this file. */
const BANNERS = INVESTOR_TABS.map((group) => ({
  category: group.category,
  href: group.items[0]?.href ?? '/investor',
  Icon: CATEGORY_ICONS[group.category],
}));

export default function FinancialHighlights() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);

  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      {/* Centred, full width, above the two columns — the same eyebrow-then-
          heading treatment every other section on the page carries, rather
          than a heading boxed into the right-hand column. */}
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="font-inter font-semibold text-[#15803D]"
          style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.22em' }}
        >
          FOR OUR INVESTORS
        </p>
        <h2
          className="font-dm-sans mt-4 font-bold text-[#111111]"
          style={{ fontSize: 'clamp(24px, 2.8vw, 38px)', letterSpacing: '-0.03em', lineHeight: 1.14 }}
        >
          Everything filed, organised by what it is
        </h2>
      </div>

      <div ref={ref} className="mx-auto mt-12 grid max-w-5xl grid-cols-1 items-center gap-10 sm:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* The banners, stacked. Each is a full link to its category's
            landing page rather than a card that opens something else on
            click, so the row is the navigation, not a preview of it. */}
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {BANNERS.map(({ category, href, Icon }, i) => (
            <li key={category}>
              <Link
                to={href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-6 py-5 transition-all duration-300 ease-out hover:border-[#15803D]/40 hover:bg-[#F4F8F4] hover:shadow-md hover:shadow-black/5 sm:px-7"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateX(0)' : 'translateX(-24px)',
                  transitionProperty: 'opacity, transform, border-color, background-color, box-shadow',
                  transitionDuration: '600ms, 600ms, 300ms, 300ms, 300ms',
                  transitionDelay: inView ? `${i * 90}ms` : '0ms',
                }}
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F2] text-[#15803D] transition-colors duration-300 group-hover:bg-[#15803D] group-hover:text-white sm:h-12 sm:w-12">
                    {Icon && <Icon className="h-5 w-5" strokeWidth={2} />}
                  </span>
                  <span
                    className="font-dm-sans font-bold text-[#0A0A0A]"
                    style={{ fontSize: 'clamp(15px, 1.25vw, 18px)', letterSpacing: '-0.015em' }}
                  >
                    {category}
                  </span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-black/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#15803D]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ol>

        {/* The pitch and the way in, on the right rather than under the
            banners — they are already the main navigation, so this reads as
            what they lead to rather than a caption beneath them. */}
        <div
          className="flex flex-col items-start text-left transition-all duration-700 ease-out"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(18px)' }}
        >
          <p
            className="font-inter max-w-md text-black/55"
            style={{ fontSize: 'clamp(14px, 1.1vw, 16px)', lineHeight: 1.65, textWrap: 'pretty' }}
          >
            Annual reports and results, board and shareholder notices, fund raising records,
            stock exchange filings and the group's other companies — five categories, one page
            each leads to.
          </p>

          {/* Same treatment as the closing tiles' external-link affordance:
              a circled arrow that steps forward and colours in on hover. */}
          <Link
            to="/investor"
            className="group mt-8 inline-flex items-center gap-3 text-[#0A0A0A] outline-none"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/25 transition-colors duration-300 group-hover:border-[#15803D] group-hover:bg-[#15803D] group-hover:text-white group-focus-visible:border-[#15803D] group-focus-visible:bg-[#15803D] group-focus-visible:text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>
            <span
              className="font-inter font-medium transition-colors duration-300 group-hover:text-[#15803D] group-focus-visible:text-[#15803D]"
              style={{ fontSize: 'clamp(14px, 1.05vw, 16px)' }}
            >
              Visit Investor Section
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
