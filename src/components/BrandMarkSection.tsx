import { useEffect, useRef, useState } from 'react';

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
const REVEAL_FALLBACK = 2500;
const SECOND_LINE_DELAY = 200;
const BANDS_DELAY = 460;
const LOGO_DELAY = 1020;
/* Rows no longer need staggering against each other — scrolling does that now,
   each one firing as it is reached. This is only the caption trailing its own
   photograph in. */
const CAPTION_DELAY = 260;

const BANDS = [
  { color: '#5BC5F2', left: '2%', delay: '0ms' },
  { color: '#F5E31F', left: '30%', delay: '90ms' },
  { color: '#7DC242', left: '58%', delay: '180ms' },
];

/* The two Logica-branded stores lead, the single-brand Samsung counter closes.

   Every one runs at its own native ratio — nothing is cropped to a common
   shape. These are wide storefronts whose whole point is the fascia and the
   brand strip running across it, and forcing them into a portrait slot threw
   away half of each. Intrinsic width and height are declared so the browser
   reserves the right box before the file arrives and the page doesn't jump.

   Which is also why the Samsung photo here is storefront-2: it is the only
   landscape one of the three, at 1.333. The other two are portrait and would
   break the run. */
const PHOTOS = [
  {
    src: '/images/store/storefront-logica-1.jpg',
    w: 1600,
    h: 994,
    alt: 'Logica Infoway Limited Mobile & IT Store, lit storefront at night',
    title: 'The multi-brand store',
    caption:
      'Every brand worth carrying, under one roof. Phones, laptops, desktops and everything that goes with them — out on display to compare in person, with service handled at the same counter that sold it.',
  },
  {
    src: '/images/store/storefront-logica-2.jpg',
    w: 1600,
    h: 1123,
    alt: 'Logica Infoway Limited storefront, formerly Eastern Logica Infoway Limited',
    title: 'The name over the door',
    caption:
      'One name, one counter, and the same company behind it since the Eastern Logica Infoway years. Pick what you want and pay how it suits you — finance and easy EMI arranged in store.',
  },
  {
    src: '/images/store/storefront-2.jpg',
    w: 1448,
    h: 1086,
    alt: 'Logica Infoway Samsung SmartCafé storefront',
    title: 'The single-brand counter',
    caption:
      'A dedicated Samsung shopfront under the Logica name. The Galaxy range in person, hands on it before you decide, and somewhere close by to come back to long after you have.',
  },
];

const LINE = {
  fontSize: 'clamp(40px, 9.6vw, 138px)',
  letterSpacing: '-0.042em',
} as const;

/* Reports whether the element is on screen, re-firing on every entry and
   exit. The threshold stays low so a block taller than the viewport — which
   can never reach a high visible ratio — still counts as seen. */
function useInView<T extends HTMLElement>(threshold: number) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fallback = setTimeout(() => setInView(true), REVEAL_FALLBACK);
    if (typeof IntersectionObserver === 'undefined') return () => clearTimeout(fallback);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          clearTimeout(fallback);
          setInView(entry.isIntersecting);
        });
      },
      { threshold },
    );
    observer.observe(el);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, [threshold]);

  return [ref, inView] as const;
}

/* Each row watches itself and slides in when it is the one being scrolled to.
   A single trigger on the whole strip cannot work here: the strip is far
   taller than the viewport, so rows two and three would fire while still off
   screen and be over before anyone saw them.

   The photograph comes in from the left and the caption from the right, the
   two closing on each other — the same horizontal move the name above uses,
   so the block reads in one motion vocabulary. */
function PhotoRow({ photo, index }: { photo: (typeof PHOTOS)[number]; index: number }) {
  const [ref, inView] = useInView<HTMLElement>(0.18);
  const [shown, setShown] = useState(false);

  // Scheduled rather than set inline so a reset paints first and the row
  // slides, instead of the two batching into a straight appearance.
  useEffect(() => {
    if (!inView) {
      setShown(false);
      return;
    }
    const t = setTimeout(() => setShown(true), 0);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <figure
      ref={ref}
      className={`m-0 flex flex-col overflow-hidden lg:flex-row lg:items-center ${
        index === 0 ? '' : 'mt-14 sm:mt-20'
      }`}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.w}
        height={photo.h}
        loading="lazy"
        className="block h-auto w-full shrink-0 transition-all ease-out lg:w-2/3"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateX(0)' : 'translateX(-64px)',
          transitionDuration: '900ms',
        }}
      />
      {/* Trails its own image, so each arrives then names itself. Sits in the
          remaining third on desktop, centred against the photo; drops beneath
          it on narrower screens. */}
      <figcaption
        className="px-5 pt-6 transition-all ease-out sm:px-8 sm:pt-7 lg:w-1/3 lg:px-10 lg:pt-0"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateX(0)' : 'translateX(48px)',
          transitionDuration: '820ms',
          transitionDelay: shown ? `${CAPTION_DELAY}ms` : '0ms',
        }}
      >
        <span
          className="font-inter block font-semibold text-[#15803D]"
          style={{ fontSize: 'clamp(10px, 0.85vw, 12px)', letterSpacing: '0.22em' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span
          className="font-dm-sans mt-2 block font-bold text-[#0A0A0A]"
          style={{ fontSize: 'clamp(20px, 2.4vw, 34px)', letterSpacing: '-0.025em' }}
        >
          {photo.title}
        </span>
        {/* Set as running text rather than a label: leading opened up and the
            measure capped, so a long line stays readable. */}
        <span
          className="font-inter mt-3 block max-w-[58ch] text-black/55"
          style={{
            fontSize: 'clamp(14px, 1.2vw, 18px)',
            letterSpacing: '-0.005em',
            lineHeight: 1.62,
            textWrap: 'pretty',
          }}
        >
          {photo.caption}
        </span>
      </figcaption>
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

      {/* One per row: the photograph across two thirds, running off the left
          edge, and its caption set beside it in the last third. Each still
          keeps its own ratio and is never cropped. Stacks below lg, where a
          third of the width is too narrow to set text in. */}
      <div className="mt-16 w-full sm:mt-24">
        {PHOTOS.map((photo, i) => (
          <PhotoRow key={photo.src} photo={photo} index={i} />
        ))}
      </div>
    </section>
  );
}
