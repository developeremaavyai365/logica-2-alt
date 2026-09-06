import { useState } from 'react';

/* A looping row of logos under a small label — the shape both the channel
   partner strip and the retail brand strip take.

   `src` is a file under public/logos, each one cropped to its own artwork so
   the row is not silently sized by whatever transparent padding its source
   shipped with. A brand with no file — or whose file fails to load — falls
   back to its name set as a wordmark, so the row is never a line of broken
   images while artwork is still being collected.

   `scale` is optical, not corrective. Every mark is fitted into the same box,
   which is what stops a 6:1 wordmark and a square icon from being sized by
   their own proportions; scale is only for the ones that still read heavy or
   light once they are in it. */
export type LogoItem = { name: string; src?: string; scale?: number };

/* The track runs to exactly half its own width and starts again, so the first
   half has to be wider than the screen or the loop drags a gap across the
   page before it comes back round. Short lists therefore go round more than
   once before the run is laid down twice. */
const CELL_W = 186;
const HALF_MIN_W = 2800;

function Mark({ item }: { item: LogoItem }) {
  const [failed, setFailed] = useState(false);
  const showLogo = item.src && !failed;

  return (
    <div className="flex w-[150px] shrink-0 items-center justify-center px-4 sm:w-[186px] sm:px-6">
      {showLogo ? (
        /* Full colour on sight rather than grey until hover: a greyed-out
           partner logo reads as a lapsed relationship. Hover only lifts it. */
        <img
          src={item.src}
          alt={item.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-auto max-w-full object-contain transition-transform duration-500 ease-out hover:scale-105"
          style={{ maxHeight: `calc(var(--mark-h) * ${item.scale ?? 1})` }}
        />
      ) : (
        <span
          className="font-dm-sans whitespace-nowrap font-bold text-[#0A0A0A] transition-transform duration-500 ease-out hover:scale-105"
          style={{ fontSize: 'clamp(15px, 1.3vw, 19px)', letterSpacing: '-0.02em' }}
        >
          {item.name}
        </span>
      )}
    </div>
  );
}

export default function LogoMarquee({
  label,
  items,
  reverse = false,
}: {
  label: string;
  items: LogoItem[];
  /** Runs right to left by default; reversed so two strips on one page do not
   *  read as the same object repeated. */
  reverse?: boolean;
}) {
  const half = Array.from(
    { length: Math.max(1, Math.ceil(HALF_MIN_W / (items.length * CELL_W))) },
    () => items,
  ).flat();
  const loop = [...half, ...half];

  return (
    /* Deliberately shorter than the sections either side of it. No border of
       its own — the page already draws a rule between every block. */
    <section className="bg-white py-9 sm:py-11">
      <p
        className="font-inter text-center font-semibold uppercase text-black/45"
        style={{ fontSize: 'clamp(10px, 0.85vw, 12px)', letterSpacing: '0.22em' }}
      >
        {label}
      </p>

      {/* Masked at both ends so marks arrive and leave rather than being cut
          off against the edge of the screen. */}
      <div
        className="mt-7 overflow-hidden sm:mt-8"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
        }}
      >
        {/* One height for the whole row, set here so every mark is measured
            against the same line rather than each carrying its own. Speed is
            held constant by timing the run rather than the list, so a long
            row does not race a short one. */}
        <div
          className="animate-marquee flex w-max items-center [--mark-h:28px] sm:[--mark-h:34px]"
          style={{
            animationDuration: `${half.length * 5}s`,
            animationDirection: reverse ? 'reverse' : undefined,
          }}
        >
          {loop.map((item, i) => (
            <Mark key={`${item.name}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
