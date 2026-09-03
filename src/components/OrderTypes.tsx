/* Accents are the same four the homepage stats and the vertical frames
   already publish, so the closing row reads as part of the same page rather
   than a strip borrowed from somewhere else. */
const ORDER_TYPES = [
  {
    label: 'Corporate Orders',
    tagline: 'Work in sync with your team',
    image: '/images/corporate-orders.jpg',
    href: '/shop',
    ink: '#1D4ED8',
  },
  {
    label: 'Educational Orders',
    tagline: 'Experience the new way of learning',
    image: '/images/educational-orders.jpg',
    href: '/shop',
    ink: '#6D28D9',
  },
  {
    label: 'Super Soul Foundation',
    tagline: 'For the betterment of the nation',
    image: '/images/supersoul-foundation.jpg',
    href: 'https://www.supersoulfoundation.com/index.php',
    external: true,
    ink: '#15803D',
  },
];

/* Carries no border of its own — Home already draws a divider between its
   sections, and having one here too doubled the line.

   Every hover state is mirrored on focus-visible, so a tile reached by
   keyboard shows the same thing a pointer would, and the press state is on
   the whole tile rather than the label, since the whole tile is the link. */
export default function OrderTypes() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {ORDER_TYPES.map((tile) => (
          <a
            key={tile.label}
            href={tile.href}
            {...(tile.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="group relative flex h-[22rem] items-end overflow-hidden outline-none transition-transform duration-200 ease-out active:scale-[0.99] sm:h-[26rem]"
          >
            <img
              src={tile.image}
              alt={tile.label}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[850ms] ease-out group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
            />

            {/* The base wash, deepened on hover so the type gains contrast as
                the photograph moves behind it. */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500" />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />

            {/* The tile's own colour, washing up from the foot. */}
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 opacity-0 transition-opacity duration-500 group-hover:opacity-70 group-focus-visible:opacity-70"
              style={{ background: `linear-gradient(to top, ${tile.ink}, transparent)` }}
            />

            {/* Drawn rather than a border, so it can grow from the left edge
                instead of fading in place. */}
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
              style={{ backgroundColor: tile.ink }}
            />

            <div className="relative z-10 p-6 transition-transform duration-500 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1 lg:p-8">
              <p className="flex items-center gap-2 text-xl font-bold uppercase tracking-[0.08em] text-white lg:text-2xl">
                {tile.label}
                <span
                  aria-hidden="true"
                  className="inline-block -translate-x-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    {tile.external ? (
                      // Leaves the site, so it says so rather than implying
                      // another page of ours.
                      <>
                        <path d="M14 4h6v6" />
                        <path d="M20 4L10 14" />
                        <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
                      </>
                    ) : (
                      <>
                        <path d="M4 12h15" />
                        <path d="M13 6l6 6-6 6" />
                      </>
                    )}
                  </svg>
                </span>
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-white/75 transition-colors duration-500 group-hover:text-white group-focus-visible:text-white lg:text-sm">
                {tile.tagline}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
