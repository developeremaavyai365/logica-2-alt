import { useEffect, useRef, useState } from 'react';

/* LOGICA slides in, INFOWAY follows beneath it at the same size and weight,
   and the registered mark resolves last at the top right of the pair — sized
   small so it reads as a mark on the name rather than a second logo.

   Behind them the three diagonal bands from the registered logo rake upward,
   held light so the type stays fully legible over them.

   The Samsung SmartCafé photographs land after the name, so the block reads
   as the identity first and the evidence of it second — same three shots the
   homepage hero rotates through.

   An IntersectionObserver drives the sequence, with a safety timer so a
   callback that never fires cannot leave the section blank. */
const REVEAL_FALLBACK = 2500;
const SECOND_LINE_DELAY = 200;
const BANDS_DELAY = 460;
const LOGO_DELAY = 1020;
const PHOTOS_DELAY = 1280;
const PHOTO_STAGGER = 150;

const BANDS = [
  { color: '#5BC5F2', left: '2%', delay: '0ms' },
  { color: '#F5E31F', left: '30%', delay: '90ms' },
  { color: '#7DC242', left: '58%', delay: '180ms' },
];

/* Exterior, interior, exterior — the interior sits in the middle so the strip
   reads front / inside / front rather than two of a kind side by side. */
const PHOTOS = [
  { src: '/images/store/storefront-2.jpg', alt: 'Logica Infoway Samsung SmartCafé storefront' },
  { src: '/images/store/store-interior-1.jpg', alt: 'Inside the Logica Infoway Samsung SmartCafé' },
  { src: '/images/store/storefront-1.jpg', alt: 'Logica Infoway Samsung SmartCafé storefront' },
];

const LINE = {
  fontSize: 'clamp(40px, 9.6vw, 138px)',
  letterSpacing: '-0.042em',
} as const;

export default function BrandMarkSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [lineOne, setLineOne] = useState(false);
  const [lineTwo, setLineTwo] = useState(false);
  const [bandsIn, setBandsIn] = useState(false);
  const [logoIn, setLogoIn] = useState(false);
  const [photosIn, setPhotosIn] = useState<boolean[]>(() => PHOTOS.map(() => false));

  useEffect(() => {
    const el = ref.current;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const reveal = () => {
      setLineOne(true);
      timers.push(setTimeout(() => setLineTwo(true), SECOND_LINE_DELAY));
      timers.push(setTimeout(() => setBandsIn(true), BANDS_DELAY));
      timers.push(setTimeout(() => setLogoIn(true), LOGO_DELAY));
      PHOTOS.forEach((_, i) => {
        timers.push(
          setTimeout(() => {
            setPhotosIn((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, PHOTOS_DELAY + i * PHOTO_STAGGER),
        );
      });
    };

    const fallback = setTimeout(reveal, REVEAL_FALLBACK);

    let observer: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              clearTimeout(fallback);
              reveal();
            }
          });
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
    }

    return () => {
      clearTimeout(fallback);
      timers.forEach(clearTimeout);
      observer?.disconnect();
    };
  }, []);

  return (
    <section className="overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center">
          {/* Shrink-wrapped to the type so the mark can sit on its true corner */}
          <div ref={ref} className="relative inline-block">
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

        {/* The stores themselves, arriving once the name has settled. */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-3 sm:gap-5 lg:gap-6">
          {PHOTOS.map((photo, i) => (
            <div
              key={photo.src}
              className="overflow-hidden bg-[#EFEFEF] transition-all ease-out"
              style={{
                aspectRatio: '4 / 3',
                opacity: photosIn[i] ? 1 : 0,
                transform: photosIn[i] ? 'translateY(0)' : 'translateY(26px)',
                transitionDuration: '760ms',
              }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
