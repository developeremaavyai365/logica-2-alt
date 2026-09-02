import { useState } from 'react';
import { Link } from 'react-router-dom';
import { INVESTOR_TABS, categoryForPath } from '../investor-sections';

/* The investor navigation, as a standard IR site lays it out: a row of
   categories, and under it the pages inside whichever category is open.

   This replaces the header dropdown entirely, so it has to reach every page
   that dropdown did — including the four that are not document lists
   (Advertisement, Basis of Allotment, Authorized Person, Grievance
   Redressal), which are folded into INVESTOR_TABS for exactly that reason.

   The open category follows the current page, but can be changed by hand to
   browse another one without leaving the page you are on. */
export default function InvestorTabs({ pathname }: { pathname: string }) {
  const activeCategory = categoryForPath(pathname);
  const [open, setOpen] = useState<string>(activeCategory ?? INVESTOR_TABS[0].category);
  const group = INVESTOR_TABS.find((g) => g.category === open) ?? INVESTOR_TABS[0];

  return (
    <div className="border-b border-[#000000]/10 bg-[#ECEDEC]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 pb-3">
          {INVESTOR_TABS.map((g) => {
            const on = g.category === open;
            return (
              <button
                key={g.category}
                type="button"
                onClick={() => setOpen(g.category)}
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

        {/* Pages inside the open category */}
        <div className="flex flex-wrap gap-2 border-t border-[#000000]/10 py-3">
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
