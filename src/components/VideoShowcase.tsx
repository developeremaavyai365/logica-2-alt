import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

interface VideoShowcaseProps {
  video: string;
  eyebrow?: string;
  headline?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function VideoShowcase({ video, eyebrow, headline, subtext, ctaLabel, ctaHref = '/shop' }: VideoShowcaseProps) {
  // With copy, the CTA anchors left alongside it; with no copy at all (just
  // a bare CTA), fall back to a bottom-center placement so the button
  // doesn't float alone in the middle-left of the frame.
  const hasCopy = Boolean(eyebrow || headline || subtext);

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '21 / 9' }}>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={video}
        autoPlay
        muted
        loop
        playsInline
      />
      <div
        className={
          hasCopy
            ? 'absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent'
            : 'absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30'
        }
      />
      <div
        className={
          hasCopy
            ? 'relative flex h-full flex-col items-start justify-center px-6 text-left sm:px-12 lg:px-20'
            : 'relative flex h-full flex-col items-center justify-end px-6 pb-8 text-center sm:pb-12 lg:pb-16'
        }
      >
        {eyebrow && (
          <p className="font-inter text-xs font-semibold uppercase text-[#5EB4FF] sm:text-sm" style={{ letterSpacing: '0.16em' }}>
            {eyebrow}
          </p>
        )}
        {headline && (
          <h2
            className="font-dm-sans mt-3 max-w-lg font-normal text-white"
            style={{ fontSize: 'clamp(26px, 4.2vw, 52px)', letterSpacing: '-0.04em', lineHeight: 1.08 }}
          >
            {headline}
          </h2>
        )}
        {subtext && (
          <p className="font-inter mt-3 max-w-sm text-sm text-[#CFE6FF] sm:text-base" style={{ letterSpacing: '-0.02em' }}>
            {subtext}
          </p>
        )}
        {ctaLabel && (
          <Link
            to={ctaHref}
            className="btn-liquid font-inter mt-6 flex h-11 w-fit items-center justify-center rounded-full border-2 border-white px-6 text-sm font-medium text-white transition-colors"
            style={{ '--liquid': '#fff', '--liquid-ink': '#000000' } as CSSProperties}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
