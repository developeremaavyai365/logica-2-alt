import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, LayoutGrid } from 'lucide-react';
import { SHOP_MEGA } from '../../nav-data';
import { categories } from '../../data';

/** The accent at a given opacity (two hex digits), for the soft tints;
 *  falls back to the accent itself if it is not a six-digit hex colour. */
const tint = (hex: string, alpha: string) => (/^#[0-9a-f]{6}$/i.test(hex) ? hex + alpha : hex);

/** Each category's own icon, by its page — shown only for a category with
 *  no photo below. */
const ICONS = new Map(categories.map((c) => [`/shop/${c.slug}`, c.icon]));

/** A real product from each category, as its picture: picked by hand for a
 *  clean, single product on white that reads at thumbnail size. */
const PHOTOS: Record<string, string> = {
  '/shop/laptops': '/products/hp-laptop14-ep0341tu-silver.jpg',
  '/shop/mobile-phones': '/products/iphone-16-128gb-256-gb-512-gb.jpg',
  '/shop/accessories': '/products/apple-watch-se-2nd-gen-gps-40-mm-smart-watch-2.jpg',
  '/shop/desktops': '/products/hp-slim-desktop-s01-pf2888in-pc.jpg',
  '/shop/monitors': '/products/lenovo-d19-10-18-5-inch-wled-monitor.jpg',
  '/shop/printers': '/products/hp-675-ink-tank-multi-function-colour-wi-fi-printer.jpg',
  '/shop/storage-devices': '/products/wd-desktop-internal-hard-disk-drive-1tb.jpg',
  '/shop/software': '/products/windows-10-pro-32-64-bit-full-verson-single-user-license-english-intl-2023-for-1pc.jpg',
  '/shop/laptop-bags': '/products/lenovo-laptop-bag-15-6-inch-backpack-black-red.jpg',
  '/shop/wireless':
    '/products/samsung-galaxy-buds2-true-wireless-earbuds-noise-cancelling-ambient-sound-bluetooth-lightweight-comfort-fit-to.jpg',
};

/* The "pop" a menu row does under the pointer: it lifts off the panel onto
   its own white card with a shadow, grows a touch and takes the accent
   colour. The movement is motion-safe only; the colour change always shows. */
const POP =
  'relative transition-all duration-200 ease-out hover:z-10 hover:bg-white hover:font-semibold hover:text-[var(--accent)] ' +
  'hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.3)] hover:ring-1 hover:ring-shop-line ' +
  'motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.05]';

/** The category navigation that used to be the header's Shop mega menu, now
 *  a grid of tiles under the shop search bar. Each category is a link to its
 *  own page; the ones with sub-categories open a small menu of them on hover.
 *
 *  Hover is only taken from a real mouse (pointerType) — on touch a tap would
 *  otherwise fire "enter" and then the chevron's click, opening and closing
 *  the menu in one go. Touch and keyboard use the chevron button instead. */
export default function CategoryNavBar({ accent }: { accent: string }) {
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Following any link in a menu should leave it closed on the next page.
  useEffect(() => {
    setOpen(null);
  }, [pathname, search]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    // Each category is a button-like tile: its icon in a tinted square, the
    // name, and a round chevron (or arrow, for categories with nothing to
    // open). On hover the tile lifts and the icon square fills with the accent.
    <nav ref={navRef} aria-label="Shop categories" style={{ '--accent': accent, '--accent-soft': tint(accent, '1F'), '--accent-line': tint(accent, '73') } as CSSProperties}>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {SHOP_MEGA.map((cat, i) => {
          const hasMenu = (cat.children?.length ?? 0) > 0;
          const isOpen = open === cat.href;
          const isCurrent = pathname === cat.href;
          const photo = PHOTOS[cat.href];
          const Icon = ICONS.get(cat.href) ?? LayoutGrid;
          // On the five-column layout, menus under the last two columns hang
          // from their right edge so they stay inside the page.
          const alignRight = i % 5 >= 3;
          const lit = isOpen || isCurrent;

          return (
            // The hover lift is on the tile inside, not on this <li>: a
            // transform here would trap the menu in the tile's own stacking
            // layer and let the next row of tiles paint over it.
            <li
              key={cat.href}
              className={`relative ${isOpen ? 'z-40' : ''}`}
              onPointerEnter={(e) => {
                if (hasMenu && e.pointerType === 'mouse') setOpen(cat.href);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') setOpen((o) => (o === cat.href ? null : o));
              }}
            >
              <div
                className={`group/tile flex h-[64px] items-center gap-3 rounded-2xl border pl-2 pr-2 transition-all duration-300 ease-out motion-safe:hover:-translate-y-0.5 ${
                  isCurrent
                    ? 'border-shop-ink bg-shop-ink text-white shadow-[0_14px_30px_-14px_rgba(14,14,14,0.6)]'
                    : isOpen
                      ? 'border-[var(--accent)] bg-white text-shop-ink shadow-[0_16px_34px_-16px_rgba(61,79,224,0.55)]'
                      : 'border-shop-line bg-white text-shop-ink shadow-[0_4px_14px_-10px_rgba(14,14,14,0.25)] hover:border-[var(--accent-line)] hover:shadow-[0_16px_34px_-16px_rgba(61,79,224,0.45)]'
                }`}
              >
                {/* Icon + name: the link */}
                <Link
                  to={cat.href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2.5 self-stretch outline-none sm:gap-3"
                >
                  {photo ? (
                    // The product on white; the ring turns accent on hover and
                    // the product leans in a little.
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 transition-all duration-300 sm:h-12 sm:w-12 ${
                        lit
                          ? 'ring-2 ring-[var(--accent)]'
                          : 'ring-shop-line group-hover/tile:ring-2 group-hover/tile:ring-[var(--accent)]'
                      }`}
                    >
                      <img
                        src={photo}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain p-1 mix-blend-multiply transition-transform duration-500 ease-out group-hover/tile:scale-110"
                      />
                    </span>
                  ) : (
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:h-12 sm:w-12 ${
                        isCurrent
                          ? 'bg-white/10 text-white'
                          : 'bg-[var(--accent-soft)] text-[var(--accent)] group-hover/tile:bg-[var(--accent)] group-hover/tile:text-white'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                  )}
                  {/* Two lines if a long name needs them, never cut off. */}
                  <span className="line-clamp-2 text-sm font-semibold leading-tight">{cat.label}</span>
                </Link>

                {/* Round chevron (opens the menu) or arrow (goes to the page). Hidden
                    on a phone, where there is no room beside a long name: a
                    tap opens the category page, which lists its types. */}
                {hasMenu ? (
                  <button
                    type="button"
                    aria-label={`${cat.label} sub-categories`}
                    aria-expanded={isOpen}
                    onClick={() => setOpen((o) => (o === cat.href ? null : cat.href))}
                    className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-full outline-none sm:flex transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                      isCurrent
                        ? 'text-white/70'
                        : lit
                          ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                          : 'text-shop-ink/35 group-hover/tile:bg-[var(--accent-soft)] group-hover/tile:text-[var(--accent)]'
                    }`}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    to={cat.href}
                    aria-hidden="true"
                    tabIndex={-1}
                    className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all sm:flex duration-300 ${
                      isCurrent
                        ? 'text-white/70'
                        : 'text-shop-ink/35 group-hover/tile:bg-[var(--accent-soft)] group-hover/tile:text-[var(--accent)] motion-safe:group-hover/tile:rotate-45'
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {/* The top padding bridges the gap between the tile and the
                  panel, so the pointer never leaves the item on the way down.
                  Below the five-column layout the panel simply takes the
                  tile's width. */}
              {hasMenu && isOpen && (
                <div
                  className={`absolute inset-x-0 top-full pt-2 lg:w-64 ${
                    alignRight ? 'lg:left-auto lg:right-0' : 'lg:right-auto'
                  }`}
                >
                  <div className="animate-fade-up rounded-2xl border border-shop-line bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]">
                    {/* Module — header strip */}
                    <div className="border-b border-shop-line px-4 py-2.5">
                      <span className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink">
                        {cat.label}
                      </span>
                    </div>

                    {/* Module — sub-categories */}
                    <ul className="p-2">
                      {cat.children!.map((child) => {
                        const isChildCurrent = `${pathname}${search}` === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              to={child.href}
                              aria-current={isChildCurrent ? 'page' : undefined}
                              className={`${POP} block rounded-lg px-3 py-2 text-sm ${
                                isChildCurrent ? 'font-medium text-[var(--accent)]' : 'text-shop-ink/70'
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Module — footer row */}
                    <div className="border-t border-shop-line p-2">
                      <Link
                        to={cat.href}
                        className={`${POP} flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-shop-ink`}
                      >
                        All {cat.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
