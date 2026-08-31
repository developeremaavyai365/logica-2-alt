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
/* Wide enough that each still clearly lands on its own rather than the three
   arriving as one block, and the caption trails its own image. */
const PHOTO_STAGGER = 420;
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
      'The whole range under one fascia — ten phone brands across the top, six computing brands down the side, and laptops, desktops, accessories and service named at the door.',
  },
  {
    src: '/images/store/storefront-logica-2.jpg',
    w: 1600,
    h: 1123,
    alt: 'Logica Infoway Limited storefront, formerly Eastern Logica Infoway Limited',
    title: 'The name over the door',
    caption:
      'The company name at full width, with the Eastern Logica Infoway name it traded under kept beneath it — and the finance desks, Bajaj Finserv, Pine Labs and HDB, that turn a counter price into instalments.',
  },
  {
    src: '/images/store/storefront-2.jpg',
    w: 1448,
    h: 1086,
    alt: 'Logica Infoway Samsung SmartCafé storefront',
    title: 'The single-brand counter',
    caption:
      'And the other format alongside them: a Samsung shopfront carrying the Logica Infoway name above the door, glass at street level and lit so the whole floor reads before anyone steps inside.',
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

export default function BrandMarkSection() {
  const [nameRef, nameInView] = useInView<HTMLDivElement>(0.3);
  const [photosRef, photosInView] = useInView<HTMLDivElement>(0.12);

  const [lineOne, setLineOne] = useState(false);
  const [lineTwo, setLineTwo] = useState(false);
  const [bandsIn, setBandsIn] = useState(false);
  const [logoIn, setLogoIn] = useState(false);
  const [photosIn, setPhotosIn] = useState<boolean[]>(() => PHOTOS.map(() => false));

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

  useEffect(() => {
    if (!photosInView) {
      setPhotosIn(PHOTOS.map(() => false));
      return;
    }
    const timers = PHOTOS.map((_, i) =>
      setTimeout(() => {
        setPhotosIn((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * PHOTO_STAGGER),
    );
    return () => timers.forEach(clearTimeout);
  }, [photosInView]);

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

      {/* One per row, edge to edge, each at its own ratio and uncropped. */}
      <div ref={photosRef} className="mt-16 w-full sm:mt-24">
        {PHOTOS.map((photo, i) => (
          <figure key={photo.src} className={i === 0 ? 'm-0' : 'm-0 mt-16 sm:mt-24'}>
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.w}
              height={photo.h}
              loading="lazy"
              className="block h-auto w-full transition-all ease-out"
              style={{
                opacity: photosIn[i] ? 1 : 0,
                transform: photosIn[i] ? 'translateY(0)' : 'translateY(26px)',
                transitionDuration: '760ms',
              }}
            />
            {/* Trails its own image, so each arrives then names itself. Held
                to the page's own gutter rather than the image edge, which
                runs to the screen. */}
            <figcaption
              className="px-5 pt-6 transition-all ease-out sm:px-8 sm:pt-7 lg:px-10"
              style={{
                opacity: photosIn[i] ? 1 : 0,
                transform: photosIn[i] ? 'translateY(0)' : 'translateY(12px)',
                transitionDuration: '620ms',
                transitionDelay: photosIn[i] ? `${CAPTION_DELAY}ms` : '0ms',
              }}
            >
              <span
                className="font-inter block font-semibold text-[#15803D]"
                style={{ fontSize: 'clamp(10px, 0.85vw, 12px)', letterSpacing: '0.22em' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className="font-dm-sans mt-2 block font-bold text-[#0A0A0A]"
                style={{ fontSize: 'clamp(20px, 2.4vw, 34px)', letterSpacing: '-0.025em' }}
              >
                {photo.title}
              </span>
              {/* Set as running text rather than a label: leading opened up
                  and the measure capped, so a long line stays readable
                  instead of stretching the full width of the image. */}
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
        ))}
      </div>
    </section>
  );
}
