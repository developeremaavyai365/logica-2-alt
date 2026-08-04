import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { NEW_ARRIVALS } from '../new-arrivals-data';

/** Always shows the newest entry — swap in the next product by adding a
 *  new entry to the top of NEW_ARRIVALS in new-arrivals-data.ts. */
export default function NewArrivalSpotlight() {
  const latest = NEW_ARRIVALS[0];
  if (!latest) return null;

  return (
    <section className="bg-black px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="animate-scale-in overflow-hidden rounded-md bg-white/5">
          <video
            src={latest.video}
            autoPlay
            loop
            muted
            playsInline
            className="aspect-video w-full object-cover"
          />
        </div>

        <div className="animate-fade-up">
          {latest.preorderOpen && (
            <span
              className="font-inter inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white sm:text-sm"
              style={{ letterSpacing: '-0.02em' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Preorder Open
            </span>
          )}

          <p className="font-inter mt-4 text-sm text-white/50 sm:text-base" style={{ letterSpacing: '-0.02em' }}>
            {latest.tagline}
          </p>
          <h2
            className="font-dm-sans mt-2 font-normal text-white"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.05em', lineHeight: 1.05 }}
          >
            {latest.name}
          </h2>
          <p
            className="font-inter mt-4 max-w-md text-sm text-white/70 sm:text-base lg:text-lg"
            style={{ lineHeight: 1.45, letterSpacing: '-0.03em' }}
          >
            {latest.description}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link
              to={latest.href}
              className="btn-liquid flex h-14 w-full items-center justify-center gap-2 rounded-md border-2 border-white font-inter font-medium text-white transition-colors sm:h-16 sm:w-[220px]"
              style={{ letterSpacing: '-0.03em', fontSize: 'clamp(16px, 2vw, 20px)', '--liquid': '#fff', '--liquid-ink': '#000000' } as CSSProperties}
            >
              Preorder Now
              <ArrowUpRight className="h-5 w-5" />
            </Link>
            <span className="font-inter text-sm text-white/50" style={{ letterSpacing: '-0.02em' }}>
              {latest.eta}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
