import { useEffect, useRef, useState } from 'react';

/* The name lands first and the trademark follows a beat later, so the mark
   reads as something earned rather than decoration set beside it.

   The entrance is driven by an IntersectionObserver, because the section sits
   well down the page and a load-time animation would have finished before
   anyone scrolled to it. A safety timer reveals the content regardless after
   REVEAL_FALLBACK, so the section can never be left blank by an observer that
   does not fire. */
const REVEAL_FALLBACK = 2500;
const MARK_DELAY = 780;

/** The circled TM from the registered wordmark, redrawn so it stays crisp at
 *  any size and takes its colour from the parent. */
function TrademarkMark({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" style={style} aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M8.5 14.5h9M13 14.5V25M21 25V14.5l3.6 6 3.6-6V25"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BrandMarkSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [nameIn, setNameIn] = useState(false);
  const [markIn, setMarkIn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    let markTimer: ReturnType<typeof setTimeout>;

    const reveal = () => {
      setNameIn(true);
      markTimer = setTimeout(() => setMarkIn(true), MARK_DELAY);
    };

    // Whatever happens with the observer, the section shows itself.
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
      clearTimeout(markTimer);
      observer?.disconnect();
    };
  }, []);

  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-40">
      <div ref={ref} className="mx-auto flex max-w-6xl flex-col items-center">
        <div className="flex items-start justify-center">
          <h2
            className="font-dm-sans font-extrabold uppercase text-[#0A0A0A] transition-all ease-out"
            style={{
              fontSize: 'clamp(56px, 13vw, 188px)',
              letterSpacing: '-0.045em',
              lineHeight: 0.9,
              opacity: nameIn ? 1 : 0,
              transform: nameIn ? 'translateY(0)' : 'translateY(20px)',
              transitionDuration: '780ms',
            }}
          >
            Logica
          </h2>

          {/* Held back until the name has settled */}
          <span
            className="shrink-0 text-[#15803D] transition-all ease-out"
            style={{
              width: 'clamp(15px, 2.2vw, 34px)',
              height: 'clamp(15px, 2.2vw, 34px)',
              marginLeft: 'clamp(6px, 0.9vw, 14px)',
              marginTop: 'clamp(6px, 1.4vw, 22px)',
              opacity: markIn ? 1 : 0,
              transform: markIn ? 'scale(1)' : 'scale(0.7)',
              transitionDuration: '520ms',
            }}
          >
            <TrademarkMark style={{ width: '100%', height: '100%' }} />
          </span>
        </div>

        {/* INFOWAY, set wide and light beneath — the Trent "LIMITED" register */}
        <p
          className="font-dm-sans font-medium uppercase text-black/55 transition-all ease-out"
          style={{
            fontSize: 'clamp(15px, 3.1vw, 46px)',
            letterSpacing: 'clamp(0.24em, 0.5vw, 0.42em)',
            marginTop: 'clamp(4px, 0.8vw, 14px)',
            marginLeft: 'clamp(0.24em, 0.5vw, 0.42em)',
            opacity: nameIn ? 1 : 0,
            transform: nameIn ? 'translateY(0)' : 'translateY(14px)',
            transitionDuration: '780ms',
            transitionDelay: '120ms',
          }}
        >
          Infoway
        </p>

        {/* The three stripes carried in the registered mark, drawn as a thin
            rule so the section closes on brand colour without competing. */}
        <div
          className="mt-10 flex h-[3px] w-full max-w-[240px] overflow-hidden rounded-full transition-all ease-out sm:mt-14"
          style={{
            opacity: markIn ? 1 : 0,
            transform: markIn ? 'scaleX(1)' : 'scaleX(0.4)',
            transitionDuration: '700ms',
            transitionDelay: '120ms',
          }}
        >
          <span className="h-full flex-1 bg-[#5BC5F2]" />
          <span className="h-full flex-1 bg-[#F5E31F]" />
          <span className="h-full flex-1 bg-[#7DC242]" />
        </div>
      </div>
    </section>
  );
}
