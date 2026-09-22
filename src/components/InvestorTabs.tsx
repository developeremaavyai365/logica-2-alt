import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { INVESTOR_TABS, categoryForPath } from '../investor-sections';

const INVESTOR_GREEN = '#15803D';
const LIQUID_GREEN = { '--liquid': INVESTOR_GREEN, '--liquid-ink': '#ffffff' } as CSSProperties;

/* The investor navigation, as a standard IR site lays it out: a row of
   categories, and under it the pages inside whichever category is open.

   This replaces the header dropdown entirely, so it has to reach every page
   that dropdown did — including the four that are not document lists
   (Advertisement, Basis of Allotment, Authorized Person, Grievance
   Redressal), which are folded into INVESTOR_TABS for exactly that reason.

   The open category follows the current page, but can be changed by hand to
   browse another one without leaving the page you are on.

   Split into CategoryRow / SubRow so a page with its own hero photo (the
   Investor hub) can float the category row on top of the image instead of
   the plain grey bar every other investor page uses, while still sharing
   the exact same open-category state and page-row markup. */

interface CategoryRowProps {
  open: string;
  onOpenChange: (category: string) => void;
  /** "bar" (default): the plain grey-bar look every investor page uses.
   *  "photo": transparent pill buttons meant to sit on a photo. */
  variant?: 'bar' | 'photo';
}

export function CategoryRow({ open, onOpenChange, variant = 'bar' }: CategoryRowProps) {
  if (variant === 'photo') {
    return (
      <div className="flex flex-wrap justify-center gap-2.5">
        {INVESTOR_TABS.map((g) => {
          const on = g.category === open;
          return (
            <button
              key={g.category}
              type="button"
              onClick={() => onOpenChange(g.category)}
              aria-pressed={on}
              style={LIQUID_GREEN}
              className={`btn-liquid rounded-full border-2 px-4 py-2 text-xs font-semibold backdrop-blur-sm transition-colors sm:text-sm ${
                on ? 'border-[#15803D] bg-[#15803D] text-white' : 'border-white/40 bg-white/10 text-white'
              }`}
            >
              {g.category}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
      <div className="flex flex-wrap gap-2 pb-3">
        {INVESTOR_TABS.map((g) => {
          const on = g.category === open;
          return (
            <button
              key={g.category}
              type="button"
              onClick={() => onOpenChange(g.category)}
              aria-pressed={on}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                on
                  ? 'border-black bg-black text-white'
                  : 'border-[#000000]/15 bg-white text-[#000000] hover:border-[#000000]/40'
              }`}
            >
              {g.category}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SubRow({
  pathname,
  open,
  className,
  variant = 'bar',
}: {
  pathname: string;
  open: string;
  className?: string;
  variant?: 'bar' | 'photo';
}) {
  const group = INVESTOR_TABS.find((g) => g.category === open) ?? INVESTOR_TABS[0];

  if (variant === 'photo') {
    return (
      <div className={`flex flex-wrap justify-center gap-2 ${className ?? ''}`}>
        {group.items.map((item) => {
          const on = item.href === pathname;
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={on ? 'page' : undefined}
              style={LIQUID_GREEN}
              className={`btn-liquid rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors ${
                on ? 'border-[#15803D] bg-[#15803D] text-white' : 'border-white/30 bg-white/5 text-white/85'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`border-b border-[#000000]/10 bg-[#ECEDEC] ${className ?? ''}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <div className="flex flex-wrap gap-2 py-3">
          {group.items.map((item) => {
            const on = item.href === pathname;
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={on ? 'page' : undefined}
                className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  on
                    ? 'border-[#15803D] bg-[#DFF5E3] text-[#15803D]'
                    : 'border-[#000000]/15 bg-white text-[#6b6b6b] hover:border-[#000000]/40 hover:text-[#000000]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function useInvestorTabsState(pathname: string) {
  const activeCategory = categoryForPath(pathname);
  return useState<string>(activeCategory ?? INVESTOR_TABS[0].category);
}

export default function InvestorTabs({ pathname }: { pathname: string }) {
  const [open, setOpen] = useInvestorTabsState(pathname);

  return (
    <div className="border-b border-[#000000]/10 bg-[#ECEDEC]">
      <CategoryRow open={open} onOpenChange={setOpen} />
      <SubRow pathname={pathname} open={open} className="border-b-0 border-t border-[#000000]/10" />
    </div>
  );
}
