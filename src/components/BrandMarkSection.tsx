import { useEffect, useRef, useState } from 'react';
import { useInView } from '../use-in-view';
import RevealText, { useScrollProgress } from './RevealText';

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

/* The four businesses, one photograph each.

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
    alt: 'A customer paying by contactless phone at a retail counter',
    headline: 'See it. Hold it. Take it home.',
    caption:
      '82+ counters across India — and the same counter that sold it handles the service afterwards.',
    ink: '#D2781E',
  },
  {
    src: '/images/verticals/ecommerce.jpg',
    name: 'E-commerce',
    alt: 'Shopping online on a laptop with a payment card in hand',
    headline: 'The counter that never closes.',
    caption:
      'The same catalogue, the same warranty, the same price — open whenever you are.',
    ink: '#6D28D9',
  },
  {
    src: '/images/verticals/distribution.jpg',
    name: 'Distribution',
    alt: 'Racking and palletised stock inside a distribution warehouse',
    headline: 'Stocked closer to you.',
    caption:
      'Five distribution centres holding inventory near demand, so an order moves sooner.',
    ink: '#15803D',
  },
  {
    src: '/images/verticals/export.jpg',
    name: 'Export',
    alt: 'A reach stacker moving containers in a shipping yard',
    headline: 'We do not stop at the border.',
    caption: 'Cleared, packed and shipped to 7+ countries beyond the domestic market.',
    ink: '#1D4ED8',
  },
];

const LINE = {
  fontSize: 'clamp(30px, 6vw, 82px)',
  letterSpacing: '-0.042em',
} as const;

/* One business per frame: the photograph bare — no card, no badge, nothing
   laid over it — with the line Logica would put beside it underneath.

   The four share a single trigger and come in one after another rather than
   each watching itself. They sit two by two, close enough that independent
   triggers would fire together and lose the sequence. */
const CASCADE = 320;

function VerticalFrame({
  item,
  index,
  shown,
}: {
  item: (typeof VERTICALS)[number];
  index: number;
  shown: boolean;
}) {
  const figureRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  /* Colour is scrubbed in as the frame is scrolled through, the same window
     and the same hook the captions below use, so the photograph and its line
     fill together rather than on two different clocks. Hovering takes it to
     full colour outright, wherever the scroll happens to have reached.

     Unfilled means grey, not hidden — if the scroll listener never runs, the
     worst case is a black-and-white photograph rather than a missing one, so
     this needs no safety timer the way the reveals do. */
  const scrolled = useScrollProgress(figureRef);
  const fill = hovered ? 1 : scrolled;

  return (
    <figure
      ref={figureRef}
      className="group m-0 transition-all ease-out"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(34px)',
        transitionDuration: '820ms',
        transitionDelay: shown ? `${index * CASCADE}ms` : '0ms',
      }}
    >
      <div className="overflow-hidden bg-[#F4F4F2]">
        <img
          src={item.src}
          alt={item.alt}
          width={1200}
          height={900}
          loading="lazy"
          className="block h-auto w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
          style={{
            aspectRatio: '4 / 3',
            objectFit: 'cover',
            filter: `grayscale(${(1 - fill).toFixed(3)})`,
            transition: 'transform 900ms ease-out, filter 320ms linear',
          }}
        />
      </div>

      <figcaption className="mt-5">
        <span
          className="font-inter block font-semibold uppercase"
          style={{ color: item.ink, fontSize: 'clamp(10px, 0.85vw, 12px)', letterSpacing: '0.22em' }}
        >
          {item.name}
        </span>
        <span
          className="font-dm-sans mt-2.5 block font-bold text-[#0A0A0A]"
          style={{ fontSize: 'clamp(17px, 1.5vw, 22px)', letterSpacing: '-0.025em', lineHeight: 1.2 }}
        >
          {item.headline}
        </span>
        {/* Darkens word by word on scroll, the same treatment the Who We Are
            statement uses. */}
        <RevealText
          segments={[{ text: item.caption }]}
          className="font-inter mt-3 max-w-[46ch]"
          style={{ fontSize: 'clamp(13px, 0.95vw, 15px)', lineHeight: 1.6, textWrap: 'pretty' }}
        />
      </figcaption>
    </figure>
  );
}

export default function BrandMarkSection() {
  const [nameRef, nameInView] = useInView<HTMLDivElement>(0.3);
  // One trigger for all four frames, so they arrive in order instead of each
  // firing on its own and losing the sequence.
  const [framesRef, framesInView] = useInView<HTMLDivElement>(0.15);
  const [framesIn, setFramesIn] = useState(false);

  // Scheduled rather than set inline so the reset paints before the cascade
  // restarts, otherwise React batches the two and they simply appear.
  useEffect(() => {
    if (!framesInView) {
      setFramesIn(false);
      return;
    }
    const t = setTimeout(() => setFramesIn(true), 0);
    return () => clearTimeout(t);
  }, [framesInView]);

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
    <section className="overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
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
                    width: 'clamp(20px, 2.6vw, 36px)',
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

            {/* The mark, miniature, on the top right corner of the pair.

                The image is 1400x838, so its height is width / 1.67 — at the
                old 116px it stood 69px tall while hanging only 18px clear,
                which put two thirds of it across the letters. That passed
                when the type was 138px; at 82px it read as a collision. Both
                the size and the clearance are now set against the type it
                sits on, and the top offset always exceeds the mark's own
                height, so it rests above the line rather than on it. */}
            <img
              src="/logica-trademark.png"
              alt="Logica registered trademark"
              className="absolute h-auto transition-all ease-out"
              style={{
                width: 'clamp(30px, 4.4vw, 60px)',
                right: 'clamp(-26px, -3.2vw, -12px)',
                top: 'clamp(-42px, -5vw, -22px)',
                opacity: logoIn ? 1 : 0,
                transform: logoIn ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.86)',
                transitionDuration: '720ms',
              }}
            />
          </div>
        </div>
      </div>

      {/* Two by two rather than four across, so each photograph is roughly
          twice the width it had in a single row. */}
      <div ref={framesRef} className="mt-16 px-5 sm:mt-24 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-10">
          {VERTICALS.map((item, i) => (
            <VerticalFrame key={item.src} item={item} index={i} shown={framesIn} />
          ))}
        </div>
      </div>
    </section>
  );
}
