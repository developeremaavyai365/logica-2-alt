const ORDER_TYPES = [
  {
    label: 'Corporate Orders',
    tagline: 'Work in sync with your team',
    image: '/images/corporate-orders.jpg',
    href: '/shop',
  },
  {
    label: 'Educational Orders',
    tagline: 'Experience the new way of learning',
    image: '/images/educational-orders.jpg',
    href: '/shop',
  },
  {
    label: 'Super Soul Foundation',
    tagline: 'For the betterment of the nation',
    image: '/images/supersoul-foundation.jpg',
    href: 'https://www.supersoulfoundation.com/index.php',
    external: true,
  },
];

export default function OrderTypes() {
  return (
    <section className="relative overflow-hidden border-t border-[#1f2a1d]/10">
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {ORDER_TYPES.map((tile) => (
          <a
            key={tile.label}
            href={tile.href}
            {...(tile.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="group relative flex h-[22rem] items-end overflow-hidden sm:h-[26rem]"
          >
            <img
              src={tile.image}
              alt={tile.label}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative z-10 p-6 lg:p-8">
              <p className="text-xl font-bold uppercase tracking-[0.08em] text-white lg:text-2xl">
                {tile.label}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-white/75 lg:text-sm">
                {tile.tagline}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
