import { useEffect, useState } from 'react';
import { useInView } from '../use-in-view';

/* The order journey played out rather than listed: a mock screen on the left
   that runs the actual stage — a grid being browsed, an item dropping into
   the cart, an order being paid, a van on the road — against a stepper on the
   right that can be driven by hand or left to run itself.

   The screen is keyed on the active step, so every element inside it remounts
   and its entry animation replays with no JS resetting anything. */
type MarkProps = { className?: string; style?: React.CSSProperties };

const svg = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 48 48',
};

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

function ChooseMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <rect x="13" y="5" width="22" height="38" rx="3.5" />
      <path d="M21 10.5h6" />
      <path d="M18.5 25.5l4 4 8.5-8.5" />
    </svg>
  );
}

function CartMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <path d="M5 8h5.5l5 21h20L40 14.5H14" />
      <circle cx="19.5" cy="37.5" r="2.8" />
      <circle cx="34" cy="37.5" r="2.8" />
    </svg>
  );
}

function CheckoutMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <path d="M24 4.5l14.5 5.2v11.4c0 9.7-6.2 17-14.5 21.4-8.3-4.4-14.5-11.7-14.5-21.4V9.7z" />
      <path d="M17.5 23.5l4.8 4.8L31 19" />
    </svg>
  );
}

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

const CYCLE = 3600;

/* Neutral furniture for the mock: grey bars stand in for copy so the screen
   reads as a product surface without inventing prices or model names. */
function Bar({ w, h = 8, tone = '#E6E6E3', delay = 0 }: { w: string; h?: number; tone?: string; delay?: number }) {
  return (
    <span
      className="animate-journey-rise block rounded-full"
      style={{ width: w, height: h, backgroundColor: tone, animationDelay: `${delay}ms` }}
    />
  );
}

function BrowseScreen() {
  const tones = ['#DCEBFF', '#EDE4FF', '#FDE8D8', '#DFF5E3', '#FCE7F3', '#E6F1FB'];
  return (
    <div className="flex h-full flex-col gap-3">
      <div
        className="animate-journey-rise flex items-center gap-2 rounded-full bg-[#F4F4F2] px-3 py-2"
        style={{ animationDelay: '40ms' }}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="#9A9A93" strokeWidth="2.4">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" strokeLinecap="round" />
        </svg>
        <Bar w="46%" h={5} tone="#DCDCD6" delay={90} />
      </div>
      <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-2.5">
        {tones.map((t, i) => (
          <div
            key={t + i}
            className="animate-journey-pop flex flex-col gap-1.5 rounded-xl border border-black/[0.06] p-2"
            style={{ animationDelay: `${140 + i * 80}ms` }}
          >
            <span className="block flex-1 rounded-lg" style={{ backgroundColor: t }} />
            <span className="block h-1.5 w-3/4 rounded-full bg-[#E6E6E3]" />
            <span className="block h-1.5 w-1/2 rounded-full bg-[#EFEFEC]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChooseScreen() {
  return (
    <div className="flex h-full gap-4">
      <div
        className="animate-journey-pop w-[44%] rounded-2xl"
        style={{ backgroundColor: '#EDE4FF', animationDelay: '60ms' }}
      />
      <div className="flex flex-1 flex-col justify-center gap-2.5">
        <Bar w="85%" h={10} tone="#DCDCD6" delay={140} />
        <Bar w="60%" h={7} delay={210} />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="animate-journey-pop font-dm-sans text-[19px] font-extrabold text-[#0A0A0A]" style={{ animationDelay: '300ms' }}>
            ₹••,•••
          </span>
          <span className="animate-journey-rise text-[12px] text-black/35 line-through" style={{ animationDelay: '380ms' }}>
            MRP
          </span>
        </div>
        <span
          className="animate-journey-rise mt-1 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ backgroundColor: '#DFF5E3', color: '#15803D', animationDelay: '460ms' }}
        >
          <span className="block h-1.5 w-1.5 rounded-full bg-[#15803D]" />
          In stock
        </span>
      </div>
    </div>
  );
}

function CartScreen() {
  return (
    <div className="relative flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <Bar w="34%" h={8} tone="#DCDCD6" delay={40} />
        <span className="relative">
          <CartMark className="h-5 w-5 text-[#0A0A0A]" />
          <span
            className="animate-journey-pop absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: '#D2781E', animationDelay: '620ms' }}
          >
            1
          </span>
        </span>
      </div>
      <div
        className="animate-journey-rise flex items-center gap-3 rounded-xl border border-black/[0.06] p-2.5"
        style={{ animationDelay: '160ms' }}
      >
        <span className="block h-11 w-11 shrink-0 rounded-lg" style={{ backgroundColor: '#EDE4FF' }} />
        <span className="flex flex-1 flex-col gap-1.5">
          <span className="block h-2 w-4/5 rounded-full bg-[#E6E6E3]" />
          <span className="block h-2 w-2/5 rounded-full bg-[#EFEFEC]" />
        </span>
        <span className="flex items-center gap-2 rounded-full border border-black/10 px-2 py-1 text-[11px] font-semibold text-[#0A0A0A]">
          <span className="text-black/30">−</span>1<span className="text-black/30">+</span>
        </span>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-black/[0.07] pt-3">
        <Bar w="26%" h={7} delay={300} />
        <span className="animate-journey-pop font-dm-sans text-[15px] font-extrabold text-[#0A0A0A]" style={{ animationDelay: '380ms' }}>
          ₹••,•••
        </span>
      </div>
      <span
        className="animate-journey-toast absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-semibold text-white"
        style={{ backgroundColor: '#15803D', animationDelay: '700ms' }}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
        Added to cart
      </span>
    </div>
  );
}

function CheckoutScreen() {
  return (
    <div className="flex h-full flex-col gap-2.5">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="animate-journey-rise rounded-lg border border-black/[0.08] px-3 py-2.5"
          style={{ animationDelay: `${60 + i * 90}ms` }}
        >
          <span className="block h-1.5 w-1/3 rounded-full bg-[#E6E6E3]" />
        </div>
      ))}
      <div className="mt-1 flex flex-col gap-2 rounded-xl bg-[#F7F7F5] p-3">
        {['52%', '38%'].map((w, i) => (
          <span key={w} className="flex items-center justify-between">
            <Bar w={w} h={6} tone="#DFDFDA" delay={260 + i * 80} />
            <Bar w="18%" h={6} tone="#DFDFDA" delay={300 + i * 80} />
          </span>
        ))}
        <span className="mt-1 flex items-center justify-between border-t border-black/[0.07] pt-2">
          <span className="animate-journey-rise text-[11px] font-semibold text-black/50" style={{ animationDelay: '440ms' }}>
            Total
          </span>
          <span className="animate-journey-pop font-dm-sans text-[15px] font-extrabold text-[#0A0A0A]" style={{ animationDelay: '520ms' }}>
            ₹••,•••
          </span>
        </span>
      </div>
      <span
        className="animate-journey-pop mt-auto flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-semibold text-white"
        style={{ backgroundColor: '#BE185D', animationDelay: '640ms' }}
      >
        <CheckoutMark className="h-3.5 w-3.5" />
        Place order securely
      </span>
    </div>
  );
}

function ShippedScreen() {
  const legs = ['Packed', 'In transit', 'Delivered'];
  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="relative mx-1 h-[2px] rounded-full bg-[#E6E6E3]">
        <span
          className="animate-journey-progress absolute inset-y-0 left-0 w-full rounded-full"
          style={{ backgroundColor: '#15803D', animationDuration: '2.6s' }}
        />
        <span className="animate-journey-van absolute -top-[13px]" style={{ marginLeft: '-14px' }}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#15803D] text-white shadow-sm">
            <ShipMark className="h-4 w-4" />
          </span>
        </span>
      </div>
      <div className="flex items-start justify-between">
        {legs.map((l, i) => (
          <span key={l} className="flex flex-col items-center gap-2" style={{ width: '33%' }}>
            <span
              className="animate-journey-pop flex h-5 w-5 items-center justify-center rounded-full"
              style={{ backgroundColor: '#DFF5E3', color: '#15803D', animationDelay: `${300 + i * 620}ms` }}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
            </span>
            <span
              className="animate-journey-rise text-[11px] font-semibold text-black/55"
              style={{ animationDelay: `${380 + i * 620}ms` }}
            >
              {l}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

const SCREENS = [BrowseScreen, ChooseScreen, CartScreen, CheckoutScreen, ShippedScreen];

export default function BuyingJourney() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const [active, setActive] = useState(0);
  // Set once the viewer picks a step, so the reel stops fighting them.
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!inView || held) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), CYCLE);
    return () => clearInterval(id);
  }, [inView, held]);

  const Screen = SCREENS[active];
  const step = STEPS[active];

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

        <div ref={ref} className="mt-14 grid items-center gap-10 sm:mt-20 lg:grid-cols-2 lg:gap-16">
          {/* The screen, playing whichever step is live. */}
          <div className="order-1 lg:order-none">
            <div
              className="relative rounded-[22px] border border-black/10 bg-white p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] transition-colors duration-500"
              style={{ backgroundColor: step.chip }}
            >
              <div className="rounded-[16px] bg-white p-3">
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="block h-2 w-2 rounded-full bg-black/10" />
                  <span className="block h-2 w-2 rounded-full bg-black/10" />
                  <span className="block h-2 w-2 rounded-full bg-black/10" />
                  <span className="ml-2 block h-3 flex-1 rounded-full bg-black/[0.05]" />
                </div>
                {/* Keyed on the step so every entry animation inside replays. */}
                <div key={active} style={{ aspectRatio: '4 / 3' }}>
                  <Screen />
                </div>
              </div>
            </div>
          </div>

          {/* The stepper, drivable by hand. */}
          <ol className="order-2 m-0 flex list-none flex-col gap-2 p-0 lg:order-none">
            {STEPS.map((s, i) => {
              const on = i === active;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(i);
                      setHeld(true);
                    }}
                    aria-current={on ? 'step' : undefined}
                    className="relative w-full overflow-hidden rounded-2xl px-4 py-4 text-left transition-all duration-500 sm:px-5"
                    style={{ backgroundColor: on ? s.chip : 'transparent' }}
                  >
                    <span className="flex items-start gap-4">
                      <span
                        className="flex shrink-0 items-center justify-center rounded-full transition-all duration-500"
                        style={{
                          height: 'clamp(42px, 3.6vw, 50px)',
                          width: 'clamp(42px, 3.6vw, 50px)',
                          backgroundColor: on ? '#fff' : '#F4F4F2',
                          color: on ? s.ink : '#B4B2A9',
                          transform: on ? 'scale(1.06)' : 'scale(1)',
                        }}
                      >
                        <s.mark
                          key={on ? `on-${i}` : `off-${i}`}
                          className={on ? 'animate-journey-draw' : undefined}
                          style={{ height: '55%', width: '55%' }}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="font-inter block font-semibold transition-colors duration-500"
                          style={{ fontSize: '11px', letterSpacing: '0.2em', color: on ? s.ink : '#B4B2A9' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="font-dm-sans mt-1 block font-bold text-[#0A0A0A]"
                          style={{ fontSize: 'clamp(17px, 1.5vw, 21px)', letterSpacing: '-0.02em' }}
                        >
                          {s.title}
                        </span>
                        {/* Only the live step carries its copy, so the column
                            stays a list rather than a wall of text. */}
                        <span
                          className="font-inter grid transition-all duration-500"
                          style={{
                            gridTemplateRows: on ? '1fr' : '0fr',
                            opacity: on ? 1 : 0,
                          }}
                        >
                          <span className="overflow-hidden">
                            <span
                              className="mt-2 block max-w-[46ch] text-black/60"
                              style={{ fontSize: 'clamp(13px, 1.05vw, 15px)', lineHeight: 1.6, textWrap: 'pretty' }}
                            >
                              {s.body}
                            </span>
                          </span>
                        </span>
                      </span>
                    </span>

                    {/* Runs the length of the dwell, so the reel shows its hand. */}
                    {on && !held && (
                      <span
                        key={`bar-${active}`}
                        className="animate-journey-progress absolute inset-x-0 bottom-0 block h-[3px] w-full"
                        style={{ backgroundColor: s.ink, animationDuration: `${CYCLE}ms`, opacity: 0.5 }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
