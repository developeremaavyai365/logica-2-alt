import { useEffect, useState } from 'react';
import { useInView } from '../use-in-view';

/* The order journey, end to end, as a track the eye can follow: five stops
   with a line that fills between them and a marker that travels along it.

   The steps reveal one after another as the section is reached, then the
   track keeps cycling on its own so the segment is never sitting still.
   Everything resets on the way out so it replays on the next visit. */
type MarkProps = { className?: string; style?: React.CSSProperties };

const svg = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 48 48',
};

/** Browse — a catalogue grid with a lens over it. */
function BrowseMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <rect x="6" y="6" width="13" height="13" rx="2.5" />
      <rect x="6" y="27" width="13" height="13" rx="2.5" />
      <rect x="27" y="27" width="13" height="13" rx="2.5" />
      <circle cx="32.5" cy="13.5" r="7" />
      <path d="M37.8 18.8L43 24" />
    </svg>
  );
}

/** Choose — the product page: a device, checked over. */
function ChooseMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <rect x="13" y="5" width="22" height="38" rx="3.5" />
      <path d="M21 10.5h6" />
      <path d="M18.5 25.5l4 4 8.5-8.5" />
    </svg>
  );
}

/** Cart — the basket it drops into. */
function CartMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <path d="M5 8h5.5l5 21h20L40 14.5H14" />
      <circle cx="19.5" cy="37.5" r="2.8" />
      <circle cx="34" cy="37.5" r="2.8" />
    </svg>
  );
}

/** Checkout — a shield, because this is the step that takes your details. */
function CheckoutMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <path d="M24 4.5l14.5 5.2v11.4c0 9.7-6.2 17-14.5 21.4-8.3-4.4-14.5-11.7-14.5-21.4V9.7z" />
      <path d="M17.5 23.5l4.8 4.8L31 19" />
    </svg>
  );
}

/** Shipped — out of the warehouse and onto the road. */
function ShipMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <rect x="4" y="13" width="21" height="17" rx="2" />
      <path d="M25 19h7.8L40 25.5V30H25z" />
      <circle cx="13" cy="34.5" r="3.2" />
      <circle cx="33.5" cy="34.5" r="3.2" />
      <path d="M9.5 21.5h10" />
    </svg>
  );
}

/* Written against what the site actually does — the catalogue, the product
   page's own stock line, the cart, the sign-in the cart requires, and
   despatch from the distribution network. */
const STEPS = [
  {
    mark: BrowseMark,
    title: 'Browse',
    body: 'Start in the catalogue. Phones, laptops, desktops and the accessories around them, sorted by category and by brand.',
    chip: '#DCEBFF',
    ink: '#1D4ED8',
  },
  {
    mark: ChooseMark,
    title: 'Choose',
    body: 'Open the product for the specification, the price against MRP, and whether it is in stock right now.',
    chip: '#EDE4FF',
    ink: '#6D28D9',
  },
  {
    mark: CartMark,
    title: 'Add to cart',
    body: 'Drop it in the cart, or park it in the wishlist. Adjust quantities and watch the total update as you go.',
    chip: '#FDE8D8',
    ink: '#D2781E',
  },
  {
    mark: CheckoutMark,
    title: 'Checkout',
    body: 'Sign in to your account, confirm the order against the summary, and set the address it should go to.',
    chip: '#FCE7F3',
    ink: '#BE185D',
  },
  {
    mark: ShipMark,
    title: 'Shipped',
    body: 'Picked and packed from the distribution network, then out for delivery — genuine stock, brand warranty intact.',
    chip: '#DFF5E3',
    ink: '#15803D',
  },
];

const STEP_STAGGER = 170;
const CYCLE = 2400;

/* The rail is drawn between the first and last marker rather than edge to
   edge, so it never runs on past either end of the journey.

   That has to account for the grid's column gap: with gaps, a column centre
   is not simply (i + 0.5) / n of the width, and assuming it is leaves the
   rail short of both markers. One column is (100% - the gaps) / n, so the
   first centre sits half a column in and the span is the width less one
   whole column. GAP_PX tracks lg:gap-x-6. */
const GAP_PX = 24;
const COL = `((100% - ${(STEPS.length - 1) * GAP_PX}px) / ${STEPS.length})`;
const RAIL_LEFT = `calc(${COL} / 2)`;
const RAIL_SPAN = `calc(100% - ${COL})`;

export default function BuyingJourney() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const [shown, setShown] = useState<boolean[]>(() => STEPS.map(() => false));
  const [active, setActive] = useState(0);

  // Reveal the stops in order once the section is reached.
  useEffect(() => {
    if (!inView) {
      setShown(STEPS.map(() => false));
      setActive(0);
      return;
    }
    const timers = STEPS.map((_, i) =>
      setTimeout(() => {
        setShown((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * STEP_STAGGER),
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  // Then keep the marker moving, so the track reads as a journey rather than
  // a row of icons. Starts after the last stop has landed.
  useEffect(() => {
    if (!inView) return;
    const start = setTimeout(() => {
      setActive(1);
    }, STEPS.length * STEP_STAGGER + 400);
    const id = setInterval(
      () => setActive((a) => (a + 1) % STEPS.length),
      CYCLE,
    );
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [inView]);

  const progress = active / (STEPS.length - 1);

  return (
    <section className="overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-40">
      <div className="mx-auto max-w-6xl">
        <p
          className="animate-fade-up font-inter text-center font-semibold text-[#15803D]"
          style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.22em' }}
        >
          HOW IT WORKS
        </p>

        <h2
          className="animate-fade-up font-dm-sans mx-auto mt-8 max-w-4xl text-center font-bold text-[#111111]"
          style={{ fontSize: 'clamp(28px, 4vw, 54px)', letterSpacing: '-0.03em', lineHeight: 1.14 }}
        >
          From the first click to the doorstep
        </h2>

        <p
          className="animate-fade-up font-inter mx-auto mt-6 max-w-2xl text-center text-black/55"
          style={{ fontSize: 'clamp(15px, 1.3vw, 19px)', lineHeight: 1.6 }}
        >
          Five steps, no surprises in between — the same stock and the same warranty you
          would get across the counter, routed to you instead.
        </p>

        <div ref={ref} className="relative mt-16 sm:mt-24">
          {/* The rail, behind the markers. Horizontal from lg, where five
              stops actually fit; a left-hand spine below that. */}
          {/* Mobile: a spine down the left, behind the markers. */}
          <div
            className="pointer-events-none absolute left-[27px] top-0 h-full w-[2px] bg-black/10 lg:hidden"
            aria-hidden="true"
          />
          {/* Desktop: drawn only between the first and last marker, so the
              rail never runs on past either end of the journey. */}
          <div
            className="pointer-events-none absolute top-[38px] hidden h-[2px] bg-black/10 lg:block"
            aria-hidden="true"
            style={{ left: RAIL_LEFT, width: RAIL_SPAN }}
          />

          {/* The travelled part of the rail, and the marker riding its end. */}
          <div
            className="pointer-events-none absolute top-[38px] hidden h-[2px] lg:block"
            aria-hidden="true"
            style={{ left: RAIL_LEFT, width: RAIL_SPAN }}
          >
            {/* Snaps back rather than animating on the wrap: a progress bar
                sliding backwards reads as the order being undone. Forward
                moves still ease. */}
            <div
              className="relative h-full bg-[#15803D] transition-all ease-out"
              style={{
                width: `${progress * 100}%`,
                transitionDuration: active === 0 ? '0ms' : '700ms',
              }}
            >
              <span
                className="absolute -top-[5px] right-0 block h-3 w-3 translate-x-1/2 rounded-full bg-[#15803D]"
                style={{ boxShadow: '0 0 0 5px rgba(21,128,61,0.16)' }}
              />
            </div>
          </div>

          <ol className="relative m-0 grid list-none grid-cols-1 gap-y-10 p-0 lg:grid-cols-5 lg:gap-x-6">
            {STEPS.map((step, i) => {
              const on = i <= active;
              return (
                <li
                  key={step.title}
                  className="flex items-start gap-5 transition-all ease-out lg:block lg:text-center"
                  style={{
                    opacity: shown[i] ? 1 : 0,
                    transform: shown[i] ? 'translateY(0)' : 'translateY(24px)',
                    transitionDuration: '700ms',
                  }}
                >
                  <span
                    className="relative z-10 flex shrink-0 items-center justify-center rounded-full transition-all duration-500 ease-out lg:mx-auto"
                    style={{
                      height: 'clamp(56px, 5.6vw, 76px)',
                      width: 'clamp(56px, 5.6vw, 76px)',
                      backgroundColor: on ? step.chip : '#F4F4F4',
                      color: on ? step.ink : '#B4B2A9',
                      transform: i === active ? 'scale(1.09)' : 'scale(1)',
                      boxShadow: i === active ? `0 0 0 6px ${step.chip}` : 'none',
                      outline: '4px solid #fff',
                    }}
                  >
                    <step.mark
                      style={{ height: 'clamp(26px, 2.6vw, 34px)', width: 'clamp(26px, 2.6vw, 34px)' }}
                    />
                  </span>

                  <div className="lg:mt-7">
                    <span
                      className="font-inter block font-semibold transition-colors duration-500"
                      style={{
                        fontSize: 'clamp(10px, 0.85vw, 12px)',
                        letterSpacing: '0.22em',
                        color: on ? step.ink : '#B4B2A9',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className="font-dm-sans mt-2 font-bold text-[#0A0A0A]"
                      style={{ fontSize: 'clamp(18px, 1.7vw, 23px)', letterSpacing: '-0.02em' }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="font-inter mx-auto mt-2.5 max-w-[34ch] text-black/55"
                      style={{ fontSize: 'clamp(13px, 1.05vw, 15px)', lineHeight: 1.6, textWrap: 'pretty' }}
                    >
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
