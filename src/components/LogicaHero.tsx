import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, Building2, Truck, Headset, type LucideIcon } from 'lucide-react';
import Header from './Header';

const PRODUCT_IMAGE = '/logica-logo-shine.png';

const PANEL2_CARDS: { icon: LucideIcon; bg: string; text: string }[] = [
  { icon: ShieldCheck, bg: 'bg-black', text: 'Genuine products, backed by authorized brand partnerships' },
  { icon: Building2, bg: 'bg-emerald-800', text: 'Three decades of corporate and government procurement' },
  { icon: Truck, bg: 'bg-cyan-800', text: 'Nationwide reach — from our Kolkata roots to 8 cities' },
  { icon: Headset, bg: 'bg-amber-700', text: 'Hardware, networking and IT support under one roof' },
];

export default function LogicaHero() {
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveCard((c) => (c + 1) % PANEL2_CARDS.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      {/* ================= NAVBAR ================= */}
      <Header transparent />
      {/* ================= HERO CONTENT ================= */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pt-24 text-center sm:px-8 sm:pt-28 lg:px-10 lg:pt-32">
        {/* Radial wipe reveal — a circular sweep mask uncovers the logo,
            matching the Mixkit "radial wipe logo reveal" reference. */}
        <div
          className="relative mx-auto mb-8 sm:mb-10 lg:mb-12"
          style={{ width: 'clamp(280px, 42vw, 560px)', height: 'clamp(120px, 18vw, 240px)' }}
        >
          <div className="logo-reveal-glow pointer-events-none absolute -inset-16" />
          <img src={PRODUCT_IMAGE} alt="Logica Infoway" className="logo-radial-wipe relative h-full w-full object-contain" />
        </div>

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
            className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-black font-inter font-medium text-white transition-opacity hover:opacity-90 sm:h-16 sm:w-[240px] md:w-[280px] lg:h-[72px] lg:w-[310px]"
            style={{ letterSpacing: '-0.03em', fontSize: 'clamp(16px, 2vw, 24px)' }}
          >
            Shop Now
            <ArrowUpRight className="h-5 w-5" />
          </Link>
          <p
            className="font-inter max-w-[310px] text-sm text-white sm:text-base lg:text-lg"
            style={{ lineHeight: 1.45, letterSpacing: '-0.03em' }}
          >
            Genuine hardware, enterprise pricing, and three decades of delivery for corporate and
            government clients.
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

      {/* ================= 3-PANEL FOOTER STRIP ================= */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr]">
        {/* Panel 1 */}
        <div className="animate-fade-up delay-900 relative overflow-hidden bg-[#ECEDEC] px-6 py-10 sm:px-10 sm:py-14">
          <p
            className="font-dm-sans max-w-[350px] font-normal text-black"
            style={{ fontSize: 'clamp(24px, 3vw, 35px)', lineHeight: 1.1, letterSpacing: '-0.05em' }}
          >
            Find the right technology for your business
          </p>
          <Link
            to="/contact"
            className="font-inter mt-4 inline-block text-base text-black underline lg:text-lg"
            style={{ letterSpacing: '-0.03em' }}
          >
            Talk to Our Team
          </Link>
        </div>

        {/* Panel 2 — auto-rotating carousel */}
        <div className="animate-fade-up delay-1000 relative flex flex-col justify-between bg-[#FEFDF9] px-6 py-10 sm:px-8 sm:py-14">
          <div className="relative h-24 sm:h-20">
            {PANEL2_CARDS.map((card, i) => {
              const Icon = card.icon;
              const active = i === activeCard;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 transition-all duration-500 ${
                    active ? 'relative translate-y-0 opacity-100' : 'absolute inset-0 translate-y-4 opacity-0'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white sm:h-12 sm:w-12 ${card.bg}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <p
                    className="font-inter text-sm text-black/80 sm:text-base lg:text-lg"
                    style={{ lineHeight: 1.2, letterSpacing: '-0.03em' }}
                  >
                    {card.text}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex gap-2">
            {PANEL2_CARDS.map((_, i) => (
              <span key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i === activeCard ? 'bg-black' : 'bg-black/20'}`} />
            ))}
          </div>
        </div>

        {/* Panel 3 */}
        <div className="animate-fade-up delay-1100 flex items-center gap-6 bg-black px-6 py-10 sm:px-10 sm:py-14">
          <img src={PRODUCT_IMAGE} alt="" className="h-[82px] w-[120px] object-contain sm:h-[110px] sm:w-[160px] lg:h-[142px] lg:w-[208px]" />
          <div>
            <p className="font-inter font-normal text-white" style={{ fontSize: 'clamp(24px, 3vw, 35px)', letterSpacing: '-0.05em' }}>
              30+
            </p>
            <p className="font-inter text-sm text-white/60 sm:text-base lg:text-lg" style={{ lineHeight: 1.2 }}>
              Years of trusted corporate &amp; government partnership
            </p>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP FLOATING PRODUCT ================= */}
      <img
        src={PRODUCT_IMAGE}
        alt=""
        className="animate-scale-in delay-700 pointer-events-none absolute z-0 hidden lg:block"
        style={{ width: 'clamp(300px, 30vw, 500px)', height: 'auto', bottom: '15%', right: 'clamp(-100px, -10vw, -40px)' }}
      />
    </div>
  );
}
