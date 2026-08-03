import { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Header from './Header';

const PRODUCT_IMAGE = '/logica-logo-shine.png';

export default function LogicaHero() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      {/* ================= NAVBAR ================= */}
      <Header />
      {/* ================= HERO CONTENT ================= */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <h1
          className="animate-word-reveal font-dm-sans font-normal text-white"
          style={{
            letterSpacing: '-0.04em',
            fontSize: 'clamp(22px, 3.6vw, 56px)',
            lineHeight: 1.1,
          }}
        >
          <span className="block overflow-hidden">
            <span className="inline-block" style={{ animationDelay: '1.8s' }}>The</span>{' '}
            <span className="inline-block" style={{ animationDelay: '1.9s' }}>Power</span>{' '}
            <span className="inline-block text-white/40" style={{ animationDelay: '2s' }}>of</span>
          </span>
          <span className="block overflow-hidden">
            <span className="inline-block" style={{ animationDelay: '2.1s', color: '#9FD8F0' }}>Genuine</span>{' '}
            <span className="inline-block" style={{ animationDelay: '2.2s', color: '#9FD8F0' }}>Tech</span>{' '}
            <span className="inline-block text-white/40" style={{ animationDelay: '2.3s' }}>for</span>
          </span>
          <span className="block overflow-hidden">
            <span className="inline-block" style={{ animationDelay: '2.4s', color: '#A8D96B' }}>Everyone</span>
          </span>
        </h1>

        <div
          className="animate-fade-up mt-8 flex flex-col items-center gap-5 sm:mt-12 sm:flex-row sm:gap-8 lg:mt-[75px] lg:gap-[50px]"
          style={{ animationDelay: '2.6s' }}
        >
          <Link
            to="/shop"
            className="btn-liquid flex h-14 w-full items-center justify-center gap-2 rounded-md border-2 border-white font-inter font-medium text-white transition-colors hover:opacity-90 sm:h-16 sm:w-[240px] md:w-[280px] lg:h-[72px] lg:w-[310px]"
            style={{ letterSpacing: '-0.03em', fontSize: 'clamp(16px, 2vw, 24px)', '--liquid': '#fff', '--liquid-ink': '#1f2a1d' } as CSSProperties}
          >
            Shop Now
            <ArrowUpRight className="h-5 w-5" />
          </Link>
          <p
            className="font-inter max-w-[310px] text-sm text-white sm:text-base lg:text-lg"
            style={{ lineHeight: 1.45, letterSpacing: '-0.03em' }}
          >
            Genuine hardware, enterprise pricing, and three decades of delivery for every customer,
            from individuals to businesses.
          </p>
        </div>
      </section>

      {/* ================= MOBILE/TABLET PRODUCT IMAGE ================= */}
      <div className="relative z-10 lg:hidden">
        <img
          src={PRODUCT_IMAGE}
          alt=""
          className="animate-scale-in delay-800 mx-auto w-[60%] max-w-[420px] object-contain drop-shadow-2xl sm:w-[50%]"
        />
      </div>

    </div>
  );
}
