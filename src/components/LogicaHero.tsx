import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Header from './Header';

const PRODUCT_IMAGE = '/logica-logo-shine.png';

interface HeroLine {
  text: string;
  dim?: string;
  color?: string;
}

/** Rotating hero headlines — same 3-line rhythm as the original ("Big words" /
 *  "dim word" line, "Accent words" / "dim word" line, "Accent word" line) so
 *  every variant reads as one consistent design, not a grab-bag of copy. */
const HEADLINES: HeroLine[][] = [
  [
    { text: 'The Power', dim: 'of' },
    { text: 'Next-Gen Tech', dim: 'for', color: '#9FD8F0' },
    { text: 'Everyone', color: '#A8D96B' },
  ],
  [
    { text: 'Flagship Devices', dim: 'at' },
    { text: 'Enterprise Pricing', dim: 'across', color: '#9FD8F0' },
    { text: 'India', color: '#A8D96B' },
  ],
  [
    { text: 'Three Decades', dim: 'of' },
    { text: 'Proven Delivery', dim: 'since', color: '#9FD8F0' },
    { text: '1995', color: '#A8D96B' },
  ],
  [
    { text: 'Genuine Hardware', dim: 'only' },
    { text: 'Zero Compromise', dim: 'on', color: '#9FD8F0' },
    { text: 'Quality', color: '#A8D96B' },
  ],
];

export default function LogicaHero() {
  const [index, setIndex] = useState(0);
  const [rotated, setRotated] = useState(false);

  useEffect(() => {
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setRotated(true);
        setIndex((i) => (i + 1) % HEADLINES.length);
      }, 2200);
    }, 3200);
    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      {/* ================= BACKGROUND VIDEO ================= */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src="/hero/kv-animated.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Scrim — the video's background is light, so this keeps the white
          hero text/CTA readable over it without altering the video itself. */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      {/* ================= NAVBAR ================= */}
      <Header />
      {/* ================= HERO CONTENT ================= */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <h1
          className="font-dm-sans font-normal text-white"
          style={{
            letterSpacing: '-0.04em',
            fontSize: 'clamp(22px, 3.6vw, 56px)',
            lineHeight: 1.1,
            minHeight: 'calc(3 * 1.1 * clamp(22px, 3.6vw, 56px))',
          }}
        >
          {!rotated && index === 0 ? (
            <span className="animate-word-reveal block">
              <span className="block overflow-hidden">
                <span className="inline-block" style={{ animationDelay: '1.8s' }}>The</span>{' '}
                <span className="inline-block" style={{ animationDelay: '1.9s' }}>Power</span>{' '}
                <span className="inline-block text-white/40" style={{ animationDelay: '2s' }}>of</span>
              </span>
              <span className="block overflow-hidden">
                <span className="inline-block" style={{ animationDelay: '2.1s', color: '#9FD8F0' }}>Next-Gen</span>{' '}
                <span className="inline-block" style={{ animationDelay: '2.2s', color: '#9FD8F0' }}>Tech</span>{' '}
                <span className="inline-block text-white/40" style={{ animationDelay: '2.3s' }}>for</span>
              </span>
              <span className="block overflow-hidden">
                <span className="inline-block" style={{ animationDelay: '2.4s', color: '#A8D96B' }}>Everyone</span>
              </span>
            </span>
          ) : (
            <span key={index} className="animate-hero-headline block">
              {HEADLINES[index].map((line, li) => (
                <span key={li} className="block overflow-hidden">
                  <span className="inline-block" style={{ color: line.color ?? '#fff' }}>{line.text}</span>
                  {line.dim && (
                    <>
                      {' '}
                      <span className="inline-block text-white/40">{line.dim}</span>
                    </>
                  )}
                </span>
              ))}
            </span>
          )}
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
            The latest flagship devices, enterprise pricing, and three decades of trusted delivery
            — for every customer, from individuals to businesses.
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
