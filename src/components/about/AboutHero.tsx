import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import WavePanel, { CAREERS_BLUE } from '../careers/WavePanel';

export const ABOUT_LINKS = [
  { to: '/about', label: 'Overview' },
  { to: '/about/board-of-directors-and-kmp', label: 'Board of Directors & KMP' },
  { to: '/about/composition-of-committees', label: 'Composition of Committees' },
  { to: '/about/media', label: 'Media' },
];

/** The About pages' hero, in the careers role page's design: the deep-navy
 *  wave panel, a large white title, and the four About pages as tabs. Other
 *  pages (Contact) reuse it with their own eyebrow and no tabs. */
export default function AboutHero({
  title,
  subtitle,
  eyebrow = 'About us',
  tabs = true,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  tabs?: boolean;
}) {
  const { pathname } = useLocation();

  return (
    <div className="bg-white px-4 pb-10 sm:px-6 md:px-5">
      <WavePanel className="mx-auto max-w-[1300px]">
        <div
          className={`flex flex-col items-center px-6 pt-10 text-center ${
            tabs ? 'min-h-[360px] pb-10 sm:min-h-[440px]' : 'min-h-[300px] pb-6 sm:min-h-[360px]'
          }`}
        >
          <span className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">{eyebrow}</span>
          <div className="flex flex-1 flex-col items-center justify-center py-8">
            <h1
              className="max-w-4xl font-dm-sans font-bold text-white"
              style={{ fontSize: 'clamp(36px, 6vw, 80px)', letterSpacing: '-0.02em', lineHeight: 1.05 }}
            >
              {title}
            </h1>
            {subtitle && <p className="mt-5 max-w-2xl text-base text-white/70 sm:text-lg">{subtitle}</p>}
          </div>
          {tabs && <nav aria-label="About us" className="flex flex-wrap justify-center gap-2">
            {ABOUT_LINKS.map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'text-white' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                  style={active ? { backgroundColor: CAREERS_BLUE } : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>}
        </div>
      </WavePanel>
    </div>
  );
}

/** A section title in the role page's style: bold DM Sans in navy. */
export function AboutHeading({ eyebrow, children, light = false }: { eyebrow?: string; children: ReactNode; light?: boolean }) {
  return (
    <div>
      {eyebrow && (
        <span
          className="text-sm font-semibold uppercase tracking-[0.18em]"
          style={{ color: light ? 'rgba(255,255,255,0.7)' : CAREERS_BLUE }}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-dm-sans font-bold ${eyebrow ? 'mt-3' : ''}`}
        style={{ color: light ? '#ffffff' : '#061A40', fontSize: 'clamp(24px, 2.6vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
      >
        {children}
      </h2>
    </div>
  );
}

/** The role page's card: white, hairline border, soft navy shadow. */
export const ABOUT_CARD = 'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.15)]';
/** The soft blue behind people's photos. The headshots are on white;
 *  multiplied over this the white drops out, so everyone stands on the same
 *  studio backdrop. */
export const ABOUT_BACKDROP = 'linear-gradient(165deg, #F1F4FF 0%, #E2E9FC 55%, #D3DDF8 100%)';
/** The role page's body text. */
export const ABOUT_TEXT = 'text-base leading-relaxed text-[#6B7280] sm:text-[17px]';
