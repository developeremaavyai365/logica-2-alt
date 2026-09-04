import { useEffect, useRef, useState } from 'react';
import { useInView } from '../use-in-view';
import RevealText, { useScrollProgress } from './RevealText';


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

/* One business per frame: the photograph bare — no card, no badge, nothing
   laid over it — with the line Logica would put beside it underneath.

   The four share a single trigger and come in one after another rather than
   each watching itself. On a wide screen they sit on one line, where
   independent triggers would all fire at once and lose the sequence
   entirely; the shared one sweeps across the row instead. */
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

      <figcaption className="mt-4">
        <span
          className="font-inter block font-semibold uppercase"
          style={{ color: item.ink, fontSize: 'clamp(10px, 0.85vw, 12px)', letterSpacing: '0.22em' }}
        >
          {item.name}
        </span>
        <span
          className="font-dm-sans mt-2 block font-bold text-[#0A0A0A]"
          style={{ fontSize: 'clamp(16px, 1.25vw, 19px)', letterSpacing: '-0.025em', lineHeight: 1.25 }}
        >
          {item.headline}
        </span>
        {/* Darkens word by word on scroll, the same treatment the Who We Are
            statement uses. */}
        <RevealText
          segments={[{ text: item.caption }]}
          className="font-inter mt-2.5"
          style={{ fontSize: 'clamp(12.5px, 0.85vw, 14px)', lineHeight: 1.6, textWrap: 'pretty' }}
        />
      </figcaption>
    </figure>
  );
}

export default function BrandMarkSection() {
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



  return (
    <section className="overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      {/* One centred line, the same treatment every other section on this
          page carries. */}
      <div className="px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="animate-fade-up font-dm-sans font-bold text-[#111111]"
            style={{ fontSize: 'clamp(24px, 2.8vw, 38px)', letterSpacing: '-0.03em', lineHeight: 1.12 }}
          >
            Four Verticals. One Powerful Ecosystem.
          </h2>
        </div>
      </div>

      <div ref={framesRef} className="mt-12 px-5 sm:mt-16 sm:px-8 lg:px-10">
        {/* All four on one line from lg up. Two up put each 4:3 photograph at
            556px wide and stacked the set two rows deep, which made this the
            tallest block on the page for the least it had to say. One row of
            four is about 264px each and a third of the height. Two up on a
            tablet and stacked on a phone, where a quarter-width column would
            leave the captions unreadable. */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          {VERTICALS.map((item, i) => (
            <VerticalFrame key={item.src} item={item} index={i} shown={framesIn} />
          ))}
        </div>
      </div>
    </section>
  );
}
