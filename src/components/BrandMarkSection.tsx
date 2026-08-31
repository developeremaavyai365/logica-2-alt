import { useEffect, useRef, useState } from 'react';

/* LOGICA slides in, INFOWAY follows beneath it at the same size and weight,
   and the registered mark resolves last at the top right of the pair — sized
   small so it reads as a mark on the name rather than a second logo.

   Behind them the three diagonal bands from the registered logo rake upward,
   held light so the type stays fully legible over them.

   Beneath the name: the store film full bleed, then the SmartCafé stills at
   full width. Both run edge to edge rather than sitting in cards, so the
   footage and the photographs carry the block at their own scale.

   The name and the stills each watch themselves. They have to: the film
   between them is a full viewport tall, so the name is long gone by the time
   the stills arrive, and a single shared trigger would reset the stills to
   invisible exactly when they came into view.

   Both replay on every entry and reset on leaving, matching the counting
   stats above. A safety timer covers the case where the observer callback
   never fires, so nothing can be left blank. */
const REVEAL_FALLBACK = 2500;
const SECOND_LINE_DELAY = 200;
const BANDS_DELAY = 460;
const LOGO_DELAY = 1020;
const PHOTO_STAGGER = 150;

const BANDS = [
  { color: '#5BC5F2', left: '2%', delay: '0ms' },
  { color: '#F5E31F', left: '30%', delay: '90ms' },
  { color: '#7DC242', left: '58%', delay: '180ms' },
];

/* Exterior, interior, exterior — the interior sits in the middle so the strip
   reads front / inside / front rather than two of a kind side by side.

   storefront-2 is the one landscape source (1448x1086). In a 4:5 slot its
   full height is kept and the width is cropped instead, so a centred crop
   cuts the fascia down to "SAMS". Holding it right keeps the wordmark whole.
   The other two are near-4:5 already and need no nudging. */
const PHOTOS = [
  { src: '/images/store/storefront-2.jpg', alt: 'Logica Infoway Samsung SmartCafé storefront', position: '85% 50%' },
  { src: '/images/store/store-interior-1.jpg', alt: 'Inside the Logica Infoway Samsung SmartCafé' },
  { src: '/images/store/storefront-1.jpg', alt: 'Logica Infoway Samsung SmartCafé storefront' },
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

      {/* The store itself, full bleed and full height. */}
      <div className="mt-16 w-full bg-black sm:mt-24" style={{ height: '100dvh' }}>
        <video
          className="h-full w-full object-cover"
          src="/videos/logica-store-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Inside the Logica Infoway store"
        />
      </div>

      {/* The stills, edge to edge at full width — no frame around them. */}
      <div
        ref={photosRef}
        className="mt-2 grid w-full grid-cols-1 gap-2 sm:mt-3 sm:grid-cols-3 sm:gap-3"
      >
        {PHOTOS.map((photo, i) => (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-all ease-out"
            style={{
              aspectRatio: '4 / 5',
              objectPosition: photo.position ?? '50% 50%',
              opacity: photosIn[i] ? 1 : 0,
              transform: photosIn[i] ? 'translateY(0)' : 'translateY(26px)',
              transitionDuration: '760ms',
            }}
          />
        ))}
      </div>
    </section>
  );
}
