import { useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/* The moving picture behind the express-delivery banner: a short looping
   film in which an order is placed, a rider crosses the city at night while
   a sixty-minute clock runs down, and the parcel reaches the door with time
   still on the clock.

   One requestAnimationFrame loop drives everything from a single position in
   the loop (0 → 1), writing transforms straight onto the elements through
   refs — nothing re-renders per frame, and every moving part stays in step
   with the clock. React state holds only the phase of the story (ordered,
   riding, delivered), which changes twice a loop and recolours the clock.

   The "camera" follows the rider: the rider stays put on screen and the city
   scrolls past in four layers at different speeds (far skyline, near
   skyline, street lights, road), which is what gives the scene depth.

   The clock is a dramatisation — it runs an hour in about twelve seconds —
   and the scene is decoration, hidden from assistive technology. For
   visitors who ask for reduced motion it is drawn once, on the delivered
   frame, and does not move. */

const GLOW = '#FFD43B';

const LOOP_MS = 16000;
/** Positions in the loop (0 → 1) where the ride starts and the rider arrives. */
const T_START = 0.07;
const T_ARRIVE = 0.8;
/** The frame drawn when motion is switched off: just after delivery. */
const STATIC_T = 0.9;

/** Seconds on the clock at the start, and how many have run off by the time
 *  the rider arrives — so it stops with 13:27 still showing. */
const CLOCK_START = 60 * 60;
const CLOCK_USED = 46 * 60 + 33;

/** How far the road scrolls over one ride, in px. */
const RIDE_DISTANCE = 2600;

const FAR = { width: 640, height: 96 };
const NEAR = { width: 860, height: 150 };
const LIGHTS = { width: 440, height: 132 };
const ROAD = { width: 160, height: 56 };
const BIKE_WIDTH = 170;
const RING_LENGTH = 2 * Math.PI * 92;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/** Speed along easeInOutCubic, scaled so the fastest point is 1. */
const speedAt = (p: number) => (p < 0.5 ? 4 * p * p : 4 * (1 - p) * (1 - p));
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

function clockText(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Small seeded random-number generator, so the skylines are the same on
 *  every load instead of reshuffling. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** A strip of generic buildings that tiles left-to-right. */
function skylineTile(size: { width: number; height: number }, seed: number, fill: string, windows: boolean) {
  const rand = seeded(seed);
  let x = 0;
  let out = '';
  while (x < size.width) {
    const w = Math.min(size.width - x, Math.round(34 + rand() * (windows ? 52 : 34)));
    const h = Math.round(size.height * (0.35 + rand() * 0.62));
    const y = size.height - h;
    out += `<rect x="${x}" y="${y}" width="${w + 0.5}" height="${h}" fill="${fill}"/>`;
    // The odd rooftop detail: a water tank or an aerial.
    if (rand() > 0.6 && w > 30) {
      out += `<rect x="${x + 6}" y="${y - 7}" width="12" height="7" fill="${fill}"/>`;
    } else if (rand() > 0.7) {
      out += `<rect x="${x + w / 2}" y="${y - 14}" width="1.5" height="14" fill="${fill}"/>`;
    }
    if (windows) {
      for (let wy = y + 9; wy < size.height - 10; wy += 13) {
        for (let wx = x + 7; wx < x + w - 8; wx += 11) {
          const r = rand();
          if (r > 0.7) out += `<rect x="${wx}" y="${wy}" width="5" height="6" rx="0.6" fill="${GLOW}" opacity="${r > 0.9 ? 0.95 : 0.6}"/>`;
          else if (r > 0.58) out += `<rect x="${wx}" y="${wy}" width="5" height="6" rx="0.6" fill="#5B6CF5" opacity="0.5"/>`;
        }
      }
    }
    x += w;
  }
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}">${out}</svg>`);
}

const FAR_TILE = skylineTile(FAR, 11, '#0E1558', false);
const NEAR_TILE = skylineTile(NEAR, 29, '#070A2E', true);

/** One street light and one tree per tile. */
const LIGHTS_TILE = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${LIGHTS.width}" height="${LIGHTS.height}">
    <defs><radialGradient id="h"><stop offset="0" stop-color="${GLOW}" stop-opacity="0.55"/><stop offset="1" stop-color="${GLOW}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="96" cy="88" r="20" fill="#0A0E36"/><circle cx="80" cy="98" r="15" fill="#0A0E36"/><circle cx="112" cy="100" r="14" fill="#0A0E36"/>
    <rect x="94" y="100" width="4" height="32" fill="#0A0E36"/>
    <rect x="300" y="22" width="4" height="110" fill="#1C2466"/>
    <path d="M302 24 q4 -12 26 -10" stroke="#1C2466" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="330" cy="16" r="40" fill="url(#h)"/>
    <ellipse cx="330" cy="16" rx="8" ry="4" fill="#FFF3B0"/>
  </svg>`,
);

const ROAD_TILE = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${ROAD.width}" height="${ROAD.height}">
    <rect width="${ROAD.width}" height="${ROAD.height}" fill="#04061A"/>
    <rect width="${ROAD.width}" height="3" fill="#232C7A"/>
    <rect x="0" y="27" width="80" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/>
  </svg>`,
);

/** A few stars, as [left %, top %, size px]. */
const STARS: [number, number, number][] = [
  [5, 12, 2], [12, 34, 1.5], [21, 8, 2], [29, 24, 1.5], [37, 10, 2.5], [45, 30, 1.5], [52, 6, 2],
  [60, 20, 1.5], [68, 9, 2], [76, 28, 1.5], [84, 12, 2.5], [91, 32, 1.5], [96, 7, 2],
];

/** Confetti for the delivery, as [angle°, distance px, colour, size px]. */
const CONFETTI: [number, number, string, number][] = [
  [-160, 70, GLOW, 7], [-145, 104, '#ffffff', 5], [-130, 84, '#7C8BFF', 7], [-118, 122, GLOW, 5],
  [-104, 92, '#ffffff', 7], [-92, 132, '#FF8FA8', 6], [-80, 100, GLOW, 7], [-68, 126, '#7C8BFF', 5],
  [-56, 88, '#ffffff', 6], [-44, 112, GLOW, 7], [-30, 76, '#FF8FA8', 5], [-18, 96, '#7C8BFF', 7],
];

type Phase = 'ordered' | 'riding' | 'delivered';

const LAYER = 'pointer-events-none absolute left-0 bg-repeat-x will-change-transform';

export default function ExpressScene() {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('ordered');

  const rootRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const lightsRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const homeLightsRef = useRef<SVGGElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);
  const bikeRef = useRef<HTMLDivElement>(null);
  const wheelARef = useRef<SVGGElement>(null);
  const wheelBRef = useRef<SVGGElement>(null);
  const boxRef = useRef<SVGGElement>(null);
  const streaksRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const parcelRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const bigClockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let width = root.clientWidth;
    let currentPhase: Phase | null = null;

    function draw(t: number, ms: number) {
      // Everything on the street is drawn at one size and scaled down on a
      // phone, so the rider, the shop and the house keep their proportions.
      const k = width < 640 ? 0.7 : 1;
      const bikeX = Math.max(18, Math.min(width * 0.2, 280));

      const ride = clamp01((t - T_START) / (T_ARRIVE - T_START));
      const travelled = easeInOutCubic(ride) * RIDE_DISTANCE;
      const speed = t < T_START || t >= T_ARRIVE ? 0 : speedAt(ride);

      const nextPhase: Phase = t < T_START ? 'ordered' : t < T_ARRIVE ? 'riding' : 'delivered';
      if (nextPhase !== currentPhase) {
        currentPhase = nextPhase;
        setPhase(nextPhase);
      }

      // The loop fades in from black and back out again at the join.
      if (filmRef.current) {
        const fade = Math.min(clamp01(t / 0.03), clamp01((1 - t) / 0.04));
        filmRef.current.style.opacity = String(fade);
      }

      // The city, in four layers. Each layer is one tile wider than the
      // banner and slides left by its offset modulo the tile width, so it
      // scrolls for ever without a seam.
      const slide = (el: HTMLDivElement | null, factor: number, tile: number) => {
        if (el) el.style.transform = `translate3d(${-((travelled * factor) % tile)}px, 0, 0)`;
      };
      slide(farRef.current, 0.1, FAR.width);
      slide(nearRef.current, 0.28, NEAR.width);
      slide(lightsRef.current, 0.72, LIGHTS.width);
      slide(roadRef.current, 1, ROAD.width);

      // The shop the rider leaves from, and the house they arrive at.
      if (storeRef.current) {
        storeRef.current.style.transform = `translate3d(${bikeX - 104 * k - travelled}px, 0, 0) scale(${k})`;
      }
      const homeX = bikeX + (BIKE_WIDTH + 34) * k + (RIDE_DISTANCE - travelled);
      if (homeRef.current) homeRef.current.style.transform = `translate3d(${homeX}px, 0, 0) scale(${k})`;

      // The rider: a slight bob that grows with speed, wheels that turn with
      // the distance covered, and speed streaks behind.
      if (bikeRef.current) {
        const bob = Math.sin(ms / 70) * 1.3 * speed;
        const lean = -1.5 * speed;
        bikeRef.current.style.transform = `translate3d(${bikeX}px, ${bob}px, 0) scale(${k}) rotate(${lean}deg)`;
      }
      // 12.5px is the wheel's radius as drawn, tyre included.
      const wheelTurn = (travelled / (2 * Math.PI * 12.5 * k)) * 360;
      if (wheelARef.current) wheelARef.current.setAttribute('transform', `rotate(${wheelTurn})`);
      if (wheelBRef.current) wheelBRef.current.setAttribute('transform', `rotate(${wheelTurn})`);
      if (streaksRef.current) {
        streaksRef.current.style.opacity = String(speed);
        streaksRef.current.style.transform = `scaleX(${0.25 + speed})`;
      }

      // The clock runs down while the rider is on the road, and stops the
      // moment they arrive.
      const remaining = CLOCK_START - CLOCK_USED * ride;
      const text = clockText(remaining);
      if (bigClockRef.current && bigClockRef.current.textContent !== text) bigClockRef.current.textContent = text;
      if (bubbleRef.current && bubbleRef.current.textContent !== text) bubbleRef.current.textContent = text;
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING_LENGTH * (1 - remaining / CLOCK_START));

      // Delivery: the parcel hops from the rack to the doorstep, the house
      // lights come on and confetti goes up.
      const hop = clamp01((t - T_ARRIVE) / 0.045);
      if (boxRef.current) boxRef.current.style.opacity = hop > 0 ? '0' : '1';
      if (parcelRef.current) {
        const fromX = bikeX + 17 * k;
        const toX = homeX + 51 * k;
        const x = fromX + (toX - fromX) * easeOutCubic(hop);
        // Starts at rack height, ends on the doorstep (the house stands 41px
        // above the rider's wheels), with an arc between.
        const y = -(46 * k) * (1 - hop) - 41 * hop - Math.sin(hop * Math.PI) * 44 * k;
        parcelRef.current.style.opacity = hop > 0 ? '1' : '0';
        parcelRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k}) rotate(${hop * 200}deg)`;
      }
      const lit = clamp01((t - T_ARRIVE - 0.035) / 0.03);
      if (homeLightsRef.current) homeLightsRef.current.style.opacity = String(lit);
      if (confettiRef.current) {
        const burst = clamp01((t - T_ARRIVE - 0.04) / 0.11);
        const flown = easeOutCubic(burst);
        const pieces = confettiRef.current.children;
        for (let i = 0; i < pieces.length; i++) {
          const [angle, distance] = CONFETTI[i];
          const a = (angle * Math.PI) / 180;
          const x = Math.cos(a) * distance * flown;
          const y = Math.sin(a) * distance * flown + burst * burst * 60;
          const piece = pieces[i] as HTMLElement;
          piece.style.opacity = burst === 0 ? '0' : String(1 - burst * burst);
          piece.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${burst * (300 + i * 40)}deg)`;
        }
      }
    }

    const resize = new ResizeObserver(() => {
      width = root.clientWidth;
      if (reducedMotion) draw(STATIC_T, 0);
    });
    resize.observe(root);

    if (reducedMotion) {
      draw(STATIC_T, 0);
      return () => resize.disconnect();
    }

    // Only run while the banner is actually on screen.
    let onScreen = true;
    const watcher = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting), { threshold: 0.05 });
    watcher.observe(root);

    let raf = 0;
    let last = performance.now();
    // Start just past the loop's fade-in, so the very first frame painted is
    // the full scene rather than an empty sky.
    let elapsed = LOOP_MS * 0.03;
    const frame = (now: number) => {
      // Capped, so a tab that was in the background resumes where it left
      // off instead of jumping ahead — but loosely enough that a slow device
      // drawing only a few frames a second still plays at real speed.
      const dt = Math.min(250, now - last);
      last = now;
      if (onScreen && !document.hidden) {
        elapsed = (elapsed + dt) % LOOP_MS;
        draw(elapsed / LOOP_MS, elapsed);
      }
      raf = requestAnimationFrame(frame);
    };
    draw(elapsed / LOOP_MS, elapsed);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      watcher.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Sky */}
      {STARS.map(([left, top, size], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white motion-safe:animate-pulse"
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, opacity: 0.7, animationDelay: `${(i % 5) * 0.6}s` }}
        />
      ))}

      <div ref={filmRef} className="absolute inset-0">
        {/* The sixty-minute clock (desktop): a ring that drains as the
            minutes run off, with the promise turning around it. */}
        <div className="absolute bottom-[164px] left-[52%] hidden h-[236px] w-[236px] -translate-x-1/2 xl:block">
          <svg viewBox="0 0 236 236" className="express-spin absolute inset-0 h-full w-full">
            <defs>
              <path id="express-orbit" d="M 118,118 m -110,0 a 110,110 0 1,1 220,0 a 110,110 0 1,1 -220,0" />
            </defs>
            <text fill="rgba(255,255,255,0.55)" fontSize="9.5" fontFamily='"JetBrains Mono", monospace' letterSpacing="6">
              <textPath href="#express-orbit">
                AT YOUR DOORSTEP IN 1 HOUR · DELHI NCR · EXPRESS DELIVERY ·
              </textPath>
            </text>
          </svg>
          <div
            className="absolute inset-[18px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 35%, rgba(40,52,170,0.92) 0%, rgba(8,11,48,0.96) 70%)',
              boxShadow: `0 0 0 1px rgba(255,255,255,0.12), 0 0 70px 6px ${phase === 'delivered' ? 'rgba(255,212,59,0.5)' : 'rgba(77,95,242,0.55)'}`,
              transition: 'box-shadow 0.6s ease',
            }}
          />
          <svg viewBox="0 0 236 236" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="118" cy="118" r="92" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
            <circle
              ref={ringRef}
              cx="118"
              cy="118"
              r="92"
              fill="none"
              stroke={GLOW}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              style={{ filter: `drop-shadow(0 0 6px ${GLOW})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
              <Zap className="h-3 w-3" fill="currentColor" style={{ color: GLOW }} />
              {phase === 'delivered' ? 'Delivered with' : 'Time left'}
            </span>
            <span
              ref={bigClockRef}
              className="mt-1 font-mono text-[46px] font-bold leading-none tabular-nums"
              style={{ letterSpacing: '-0.04em', color: phase === 'delivered' ? GLOW : '#ffffff', transition: 'color 0.4s ease' }}
            >
              60:00
            </span>
            <span className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
              {phase === 'delivered' ? 'still on the clock' : 'of 60 minutes'}
            </span>
          </div>
        </div>

        {/* The city, back to front */}
        <div
          ref={farRef}
          className={LAYER}
          style={{ bottom: ROAD.height + 34, height: FAR.height, width: `calc(100% + ${FAR.width}px)`, backgroundImage: FAR_TILE, backgroundSize: `${FAR.width}px ${FAR.height}px`, opacity: 0.9 }}
        />
        <div
          ref={nearRef}
          className={LAYER}
          style={{ bottom: ROAD.height, height: NEAR.height, width: `calc(100% + ${NEAR.width}px)`, backgroundImage: NEAR_TILE, backgroundSize: `${NEAR.width}px ${NEAR.height}px` }}
        />
        <div
          ref={lightsRef}
          className={LAYER}
          style={{ bottom: ROAD.height - 4, height: LIGHTS.height, width: `calc(100% + ${LIGHTS.width}px)`, backgroundImage: LIGHTS_TILE, backgroundSize: `${LIGHTS.width}px ${LIGHTS.height}px` }}
        />
        <div
          ref={roadRef}
          className={LAYER}
          style={{ bottom: 0, height: ROAD.height, width: `calc(100% + ${ROAD.width}px)`, backgroundImage: ROAD_TILE, backgroundSize: `${ROAD.width}px ${ROAD.height}px` }}
        />

        {/* The shop the order leaves from */}
        <div ref={storeRef} className="absolute left-0 origin-bottom-left will-change-transform" style={{ bottom: ROAD.height - 6, width: 130, height: 120 }}>
          <svg viewBox="0 0 130 120" className="h-full w-full">
            <rect x="10" y="46" width="110" height="74" fill="#141C66" />
            <rect x="16" y="12" width="98" height="20" rx="4" fill="#070A2E" />
            <text x="65" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily='"JetBrains Mono", monospace' letterSpacing="2" fill={GLOW}>
              LOGICA
            </text>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d={`M${8 + i * 19} 34 h19 v10 q-9.5 9 -19 0 z`} fill={i % 2 === 0 ? '#4D5FF2' : '#F4F5FF'} />
            ))}
            <rect x="20" y="62" width="50" height="34" rx="3" fill={GLOW} opacity="0.9" />
            <rect x="44" y="62" width="2" height="34" fill="#141C66" />
            <rect x="82" y="62" width="28" height="58" rx="3" fill="#070A2E" />
            <circle cx="88" cy="92" r="1.8" fill={GLOW} />
          </svg>
        </div>

        {/* The house the order arrives at */}
        <div ref={homeRef} className="absolute left-0 origin-bottom-left will-change-transform" style={{ bottom: ROAD.height - 6, width: 120, height: 120 }}>
          <svg viewBox="0 0 120 120" className="h-full w-full">
            <rect x="78" y="22" width="12" height="24" fill="#1D2785" />
            <path d="M6 58 L60 14 L114 58 Z" fill="#3547D6" />
            <rect x="16" y="56" width="88" height="64" fill="#1D2785" />
            <rect x="26" y="68" width="18" height="18" rx="2" fill="#070A2E" />
            <rect x="76" y="68" width="18" height="18" rx="2" fill="#070A2E" />
            <rect x="50" y="76" width="22" height="44" rx="2" fill="#070A2E" />
            <g ref={homeLightsRef} style={{ opacity: 0 }}>
              <rect x="26" y="68" width="18" height="18" rx="2" fill={GLOW} />
              <rect x="76" y="68" width="18" height="18" rx="2" fill={GLOW} />
              <rect x="50" y="76" width="22" height="44" rx="2" fill="#FFF3B0" />
              <circle cx="60" cy="70" r="46" fill={GLOW} opacity="0.12" />
            </g>
            <circle cx="67" cy="100" r="1.8" fill="#141C66" />
          </svg>
          <div ref={confettiRef} className="absolute left-[60px] top-[40px]">
            {CONFETTI.map(([, , colour, size], i) => (
              <span key={i} className="absolute rounded-[2px]" style={{ width: size, height: size * 0.55, backgroundColor: colour, opacity: 0 }} />
            ))}
          </div>
        </div>

        {/* The rider */}
        <div ref={bikeRef} className="absolute left-0 origin-bottom-left will-change-transform" style={{ bottom: 9, width: BIKE_WIDTH, height: BIKE_WIDTH * 0.48 }}>
          {/* speed streaks, trailing off behind */}
          <div ref={streaksRef} className="absolute right-full top-[30%] mr-1 flex origin-right flex-col items-end gap-[6px]" style={{ opacity: 0 }}>
            <span className="h-[2px] w-16 rounded-full bg-gradient-to-l from-white/70 to-transparent" />
            <span className="h-[2px] w-24 rounded-full bg-gradient-to-l from-white/50 to-transparent" />
            <span className="h-[2px] w-12 rounded-full bg-gradient-to-l from-white/70 to-transparent" />
            <span className="h-[2px] w-20 rounded-full bg-gradient-to-l from-white/40 to-transparent" />
          </div>

          <svg viewBox="0 0 200 96" className="h-full w-full overflow-visible">
            <defs>
              <linearGradient id="express-beam" x1="0" x2="1">
                <stop offset="0" stopColor="#FFF3B0" stopOpacity="0.6" />
                <stop offset="1" stopColor="#FFF3B0" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* headlight beam */}
            <polygon points="124,50 250,26 250,92 124,58" fill="url(#express-beam)" />
            {/* delivery box on the rack */}
            <g ref={boxRef}>
              <rect x="14" y="20" width="36" height="30" rx="5" fill={GLOW} />
              <path d="M34 25 l-8 12 h6.5 l-3 9 l10 -13 h-6.5 z" fill="#0E0E0E" />
            </g>
            <rect x="14" y="50" width="40" height="4" rx="2" fill="#AEB6EE" />
            {/* scooter */}
            <path d="M36 76 Q38 56 58 56 L84 56 Q92 56 94 66 L96 76 Z" fill="#F4F5FF" />
            <path d="M70 76 L106 76 Q114 76 116 68 L122 40" stroke="#F4F5FF" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M114 37 L130 35" stroke="#AEB6EE" strokeWidth="5" strokeLinecap="round" />
            <circle cx="125" cy="53" r="5" fill="#FFF3B0" />
            <rect x="52" y="48" width="36" height="8" rx="4" fill="#1B1F4B" />
            {/* rider */}
            <path d="M68 50 L92 58 L98 78" stroke="#1B1F4B" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M64 50 L72 24 Q74 18 80 19 L90 21 Q95 23 93 29 L86 50 Z" fill="#4D5FF2" />
            <path d="M84 28 L116 37" stroke="#4D5FF2" strokeWidth="7" strokeLinecap="round" />
            <circle cx="86" cy="11" r="11" fill={GLOW} />
            <path d="M88 8 h10 a3.5 3.5 0 0 1 0 7 h-8 z" fill="#0E0E0E" opacity="0.85" />
            {/* wheels */}
            <g transform="translate(40 80)">
              <circle r="13" fill="#070A2E" stroke="#E8EAFF" strokeWidth="3.5" />
              <g ref={wheelARef}>
                <path d="M-9 0 H9 M0 -9 V9" stroke="#8D94C9" strokeWidth="2" strokeLinecap="round" />
              </g>
              <circle r="2.8" fill="#E8EAFF" />
            </g>
            <g transform="translate(118 80)">
              <circle r="13" fill="#070A2E" stroke="#E8EAFF" strokeWidth="3.5" />
              <g ref={wheelBRef}>
                <path d="M-9 0 H9 M0 -9 V9" stroke="#8D94C9" strokeWidth="2" strokeLinecap="round" />
              </g>
              <circle r="2.8" fill="#E8EAFF" />
            </g>
          </svg>

          {/* the clock, riding along above the rider */}
          <span
            className="absolute -top-8 left-[38%] flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-[#070A2E]/85 px-2.5 py-1 font-mono text-xs font-bold tabular-nums text-white shadow-lg backdrop-blur-sm"
            style={{ color: phase === 'delivered' ? GLOW : '#ffffff' }}
          >
            <Zap className="h-3 w-3" fill="currentColor" style={{ color: GLOW }} />
            <span ref={bubbleRef}>60:00</span>
          </span>
        </div>

        {/* the parcel, in the air between the rack and the doorstep */}
        <span
          ref={parcelRef}
          className="absolute left-0 flex h-5 w-5 origin-center items-center justify-center rounded-[5px] will-change-transform"
          style={{ bottom: 9, backgroundColor: GLOW, opacity: 0 }}
        >
          <Zap className="h-3 w-3 text-shop-ink" fill="currentColor" />
        </span>
      </div>
    </div>
  );
}
