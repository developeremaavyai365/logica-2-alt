import { useEffect, useState } from 'react';
import { useInView } from '../use-in-view';
import RevealText from './RevealText';

/* LOGICA slides in, INFOWAY follows beneath it at the same size and weight,
   and the registered mark resolves last at the top right of the pair — sized
   small so it reads as a mark on the name rather than a second logo.

   Behind them the three diagonal bands from the registered logo rake upward,
   held light so the type stays fully legible over them.

   Beneath the name the SmartCafé stills run edge to edge at full width,
   rather than sitting in cards, so the photographs carry the block at their
   own scale. Each arrives on its own and is then named by its caption.

   The name and the stills watch themselves separately. They are close enough
   now to share a trigger, but keeping them apart means the stills reveal when
   the stills are actually reached — no reset can wipe them on the way past,
   however tall this block grows.

   Both replay on every entry and reset on leaving, matching the counting
   stats above. A safety timer covers the case where the observer callback
   never fires, so nothing can be left blank. */
const SECOND_LINE_DELAY = 200;
const BANDS_DELAY = 460;
const LOGO_DELAY = 1020;

const BANDS = [
  { color: '#5BC5F2', left: '2%', delay: '0ms' },
  { color: '#F5E31F', left: '30%', delay: '90ms' },
  { color: '#7DC242', left: '58%', delay: '180ms' },
];

/* The four businesses, one card each.

   Figures and accent colours are the same ones the stats above the fold
   already publish, so the two blocks cannot end up quoting different numbers
   for the same vertical.

   All four images are pre-cropped to 4:3 at 1200px rather than being squeezed
   into shape by the browser: they arrived as a mix of landscape and portrait,
   and choosing the crop at build time keeps the subject rather than whatever
   a centre crop happened to leave. */
const VERTICALS = [
  {
    src: '/images/verticals/retail.jpg',
    name: 'Retail',
    stat: '82+ stores pan India',
    alt: 'A customer paying by contactless phone at a retail counter',
    caption: 'Counters people can walk into, compare at, and come back to.',
    ink: '#D2781E',
  },
  {
    src: '/images/verticals/ecommerce.jpg',
    name: 'E-commerce',
    stat: '24/7 nationwide',
    alt: 'Shopping online on a laptop with a payment card in hand',
    caption: 'The same catalogue and the same warranty, open at any hour.',
    ink: '#6D28D9',
  },
  {
    src: '/images/verticals/distribution.jpg',
    name: 'Distribution',
    stat: '5 distribution centres',
    alt: 'Racking and palletised stock inside a distribution warehouse',
    caption: 'Stock held close to demand, so orders leave sooner.',
    ink: '#15803D',
  },
  {
    src: '/images/verticals/export.jpg',
    name: 'Export',
    stat: '7+ countries served',
    alt: 'A reach stacker moving containers in a shipping yard',
    caption: 'Consignments cleared and shipped beyond the domestic market.',
    ink: '#1D4ED8',
  },
];

const LINE = {
  fontSize: 'clamp(40px, 9.6vw, 138px)',
  letterSpacing: '-0.042em',
} as const;

/* One card per business, in the style of a group holding page: the photograph,
   the name laid over it, and a line underneath saying what the vertical does.

   Each card watches itself rather than the row sharing one trigger, so a card
   reveals when it is actually reached — on a phone the four are stacked well
   over a screen apart. */
function VerticalCard({ item, index }: { item: (typeof VERTICALS)[number]; index: number }) {
  const [ref, inView] = useInView<HTMLElement>(0.2);
  const [shown, setShown] = useState(false);

  // Scheduled rather than set inline so the reset paints first and the card
  // rises, instead of the two batching into a straight appearance.
  useEffect(() => {
    if (!inView) {
      setShown(false);
      return;
    }
    const t = setTimeout(() => setShown(true), index * 90);
    return () => clearTimeout(t);
  }, [inView, index]);

  return (
    <figure
      ref={ref}
      className="group m-0 transition-all ease-out"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(26px)',
        transitionDuration: '760ms',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#F4F4F2]">
        <img
          src={item.src}
          alt={item.alt}
          width={1200}
          height={900}
          loading="lazy"
          className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          style={{ aspectRatio: '4 / 3', objectFit: 'cover' }}
        />
        {/* Enough of a wash for the name to hold at the foot of any of the
            four photographs, which range from a bright warehouse to an
            overcast container yard. */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0) 68%)' }}
        />
        {/* Stacked rather than set side by side: at a quarter of the row the
            card is ~270px, and a name like "E-commerce" beside a pill wraps
            and collides with it. */}
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1.5 p-4">
          <span
            className="font-inter w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
            style={{ backgroundColor: item.ink }}
          >
            {item.stat}
          </span>
          <span
            className="font-dm-sans font-bold leading-tight text-white"
            style={{ fontSize: 'clamp(19px, 1.7vw, 24px)', letterSpacing: '-0.02em' }}
          >
            {item.name}
          </span>
        </figcaption>
      </div>

      {/* Darkens word by word on scroll, the same treatment the Who We Are
          statement uses. */}
      <RevealText
        segments={[{ text: item.caption }]}
        className="font-inter mt-3"
        style={{ fontSize: 'clamp(13px, 1.05vw, 15px)', lineHeight: 1.6, textWrap: 'pretty' }}
      />
    </figure>
  );
}

export default function BrandMarkSection() {
  const [nameRef, nameInView] = useInView<HTMLDivElement>(0.3);

  const [lineOne, setLineOne] = useState(false);
  const [lineTwo, setLineTwo] = useState(false);
  const [bandsIn, setBandsIn] = useState(false);
  const [logoIn, setLogoIn] = useState(false);

  /* Every step is scheduled, including the first, so the reset paints before
     anything flips back on — otherwise React batches the two and the type
     appears instead of sliding. */
  useEffect(() => {
    if (!nameInView) {
      setLineOne(false);
      setLineTwo(false);
      setBandsIn(false);
      setLogoIn(false);
      return;
    }
    const timers = [
      setTimeout(() => setLineOne(true), 0),
      setTimeout(() => setLineTwo(true), SECOND_LINE_DELAY),
      setTimeout(() => setBandsIn(true), BANDS_DELAY),
      setTimeout(() => setLogoIn(true), LOGO_DELAY),
    ];
    return () => timers.forEach(clearTimeout);
  }, [nameInView]);

  return (
    <section className="overflow-hidden bg-white py-24 sm:py-32 lg:py-40">
      <div className="px-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl justify-center">
          {/* Shrink-wrapped to the type so the mark can sit on its true corner */}
          <div ref={nameRef} className="relative inline-block">
            {/* Bands rake upward behind the pair, at the logo's own angle */}
            <div
              className="pointer-events-none absolute -inset-x-[8%] -inset-y-[14%] overflow-hidden"
              aria-hidden="true"
            >
              {BANDS.map((b) => (
                <span
                  key={b.color}
                  className="absolute block transition-all ease-out"
                  style={{
                    left: b.left,
                    bottom: '-45%',
                    width: 'clamp(24px, 4vw, 58px)',
                    height: '215%',
                    backgroundColor: b.color,
                    transform: bandsIn
                      ? 'rotate(38deg) translateY(0)'
                      : 'rotate(38deg) translateY(64%)',
                    opacity: bandsIn ? 0.22 : 0,
                    transformOrigin: 'bottom center',
                    transitionDuration: '900ms',
                    transitionDelay: b.delay,
                  }}
                />
              ))}
            </div>

            <h2 className="relative font-dm-sans font-extrabold uppercase leading-[0.88] text-[#0A0A0A]">
              <span
                className="block transition-all ease-out"
                style={{
                  ...LINE,
                  opacity: lineOne ? 1 : 0,
                  transform: lineOne ? 'translateX(0)' : 'translateX(-56px)',
                  transitionDuration: '820ms',
                }}
              >
                Logica
              </span>
              <span
                className="block transition-all ease-out"
                style={{
                  ...LINE,
                  opacity: lineTwo ? 1 : 0,
                  transform: lineTwo ? 'translateX(0)' : 'translateX(-56px)',
                  transitionDuration: '820ms',
                }}
              >
                Infoway
              </span>
            </h2>

            {/* The mark, miniature, on the top right corner of the pair */}
            <img
              src="/logica-trademark.png"
              alt="Logica registered trademark"
              className="absolute h-auto transition-all ease-out"
              style={{
                width: 'clamp(52px, 8.4vw, 116px)',
                right: 'clamp(-30px, -4vw, -14px)',
                top: 'clamp(-34px, -5vw, -18px)',
                opacity: logoIn ? 1 : 0,
                transform: logoIn ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.86)',
                transitionDuration: '720ms',
              }}
            />
          </div>
        </div>
      </div>

      {/* The four businesses across one row, two up on a tablet and stacked on
          a phone. Held to the page's own gutter rather than running to the
          screen edge, so the row reads as a set of cards. */}
      <div className="mt-16 px-5 sm:mt-24 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-6">
          {VERTICALS.map((item, i) => (
            <VerticalCard key={item.src} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
