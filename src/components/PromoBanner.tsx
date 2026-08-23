import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface PromoBannerProps {
  image: string;
  eyebrow?: string;
  headline: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function PromoBanner({ image, eyebrow, headline, subtext, ctaLabel, ctaHref = '/shop' }: PromoBannerProps) {
  return (
    <section className="px-5 sm:px-8 lg:px-10">
      <Link
        to={ctaHref}
        className="group relative block h-[220px] w-full overflow-hidden rounded-2xl sm:h-[280px] lg:h-[340px]"
      >
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
        <div className="relative flex h-full flex-col justify-center px-6 sm:px-10 lg:px-14">
          {eyebrow && (
            <p className="font-inter text-xs uppercase text-white/70 sm:text-sm" style={{ letterSpacing: '0.12em' }}>
              {eyebrow}
            </p>
          )}
          <h3
            className="font-dm-sans mt-2 max-w-md font-normal text-white"
            style={{ fontSize: 'clamp(22px, 3.2vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1.1 }}
          >
            {headline}
          </h3>
          {subtext && (
            <p className="font-inter mt-2 max-w-sm text-sm text-white/80 sm:text-base" style={{ letterSpacing: '-0.02em' }}>
              {subtext}
            </p>
          )}
          {ctaLabel && (
            <span
              className="btn-liquid font-inter mt-5 inline-flex w-fit items-center gap-1 rounded-full border-2 border-white px-5 py-2.5 text-sm font-medium text-white transition-colors group-hover:![--p:100%] group-hover:![--t:0.3s] group-hover:!text-black"
              style={{ '--liquid': '#fff', '--liquid-ink': '#000000' } as CSSProperties}
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </Link>
    </section>
  );
}
