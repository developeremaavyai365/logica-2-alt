import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import WavePanel, { CAREERS_BLUE } from '../careers/WavePanel';
import { INVESTOR_TABS, categoryForPath } from '../../investor-sections';

/** The Investor Relations hero, in the About page's design: the deep-navy
 *  wave panel, a large white title, and the investor navigation as buttons
 *  inside it — the categories on one row, the pages of the open category on
 *  the next. Choosing a page swaps only what is below the hero. */
export default function InvestorHero({
  pathname,
  eyebrow,
  title,
  subtitle,
}: {
  pathname: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  // The open category follows the page, but can be changed by hand to look
  // through another category without leaving the page you are on.
  const [open, setOpen] = useState<string | null>(() => categoryForPath(pathname));
  useEffect(() => setOpen(categoryForPath(pathname)), [pathname]);

  const group = INVESTOR_TABS.find((g) => g.category === open);
  const overview = pathname === '/investor';

  return (
    <div className="bg-white px-4 pb-10 sm:px-6 md:px-5">
      <WavePanel className="mx-auto max-w-[1300px]">
        <div className="flex min-h-[360px] flex-col items-center px-6 pb-10 pt-10 text-center sm:min-h-[420px]">
          <span className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">{eyebrow}</span>
          <div className="flex flex-1 flex-col items-center justify-center py-8">
            <h1
              className="max-w-4xl font-dm-sans font-bold text-white"
              style={{ fontSize: 'clamp(34px, 5.4vw, 72px)', letterSpacing: '-0.02em', lineHeight: 1.05 }}
            >
              {title}
            </h1>
            {subtitle && <p className="mt-5 max-w-2xl text-base text-white/70 sm:text-lg">{subtitle}</p>}
          </div>

          {/* Categories */}
          <nav aria-label="Investor Relations" className="flex flex-wrap justify-center gap-2">
            <Link
              to="/investor"
              aria-current={overview ? 'page' : undefined}
              className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                overview ? 'text-white' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
              style={overview ? { backgroundColor: CAREERS_BLUE } : undefined}
            >
              Overview
            </Link>
            {INVESTOR_TABS.map((g) => {
              const on = g.category === open;
              return (
                <button
                  key={g.category}
                  type="button"
                  onClick={() => setOpen(on ? null : g.category)}
                  aria-expanded={on}
                  className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                    on ? 'bg-white text-[#061A40]' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {g.category}
                </button>
              );
            })}
          </nav>

          {/* The pages of the open category */}
          {group && (
            <div className="mt-3 flex w-full max-w-4xl flex-wrap justify-center gap-2 border-t border-white/10 pt-3">
              {group.items.map((item) => {
                const on = item.href === pathname;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    aria-current={on ? 'page' : undefined}
                    className={`rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors ${
                      on ? 'text-white' : 'border border-white/15 text-white/75 hover:border-white/40 hover:text-white'
                    }`}
                    style={on ? { backgroundColor: CAREERS_BLUE } : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </WavePanel>
    </div>
  );
}
