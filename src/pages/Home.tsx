import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Play } from 'lucide-react';
import BoomerangVideoBg from '../BoomerangVideoBg';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryStickyScroll from '../components/CategoryStickyScroll';
import StoryTimeline from '../components/StoryTimeline';
import StatsCounter from '../components/StatsCounter';
import FollowUs from '../components/FollowUs';
import OrderTypes from '../components/OrderTypes';

const HERO_VIDEO = '/videos/hero.mp4';

// Real clients (KANVA_STORY) — companies that trust Logica Infoway.
const trustedByLogos = [
  { name: 'R.R. Kabel', src: '/logos/rr-kabel.svg' },
  { name: 'LIC of India', src: '/logos/lic.svg' },
];

// Real award-granting brand partners (HP Growthon, Samsung Excellent Retail
// Performance, Flipkart Highest Seller — Mobile Category).
const recognisedByLogos = [
  { name: 'HP', src: '/logos/hp.svg' },
  { name: 'Samsung', src: '/logos/samsung.png' },
  { name: 'Flipkart', src: '/logos/flipkart.svg' },
];

export default function Home() {
  return (
    <div className="w-full">
      {/* ================= HERO ================= */}
      <section className="relative w-full min-h-screen sm:h-screen overflow-hidden">
        <BoomerangVideoBg src={HERO_VIDEO} className="absolute inset-0 w-full h-full" />
        <Header transparent />

        {/* Hero copy */}
        <div className="relative z-10 flex flex-col items-center text-center pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6">
          <h1
            className="font-normal leading-[0.95] text-[#336443] text-[2rem] sm:text-4xl md:text-5xl lg:text-[4.75rem] xl:text-[5.25rem] max-w-5xl"
            style={{ letterSpacing: '-0.035em' }}
          >
            Cost-effective hardware{' '}
            <span className="text-[#85AB8B]">
              for corporate
              <br className="hidden sm:block" /> &amp; government
            </span>
          </h1>
          <p className="mt-6 sm:mt-8 text-[#4b5b47] text-sm sm:text-base md:text-lg leading-relaxed max-w-md px-2">
            High quality products that combine performance with value pricing — trusted since 1995.
          </p>
        </div>

        {/* Bottom-left CTA block */}
        <div className="absolute left-4 right-4 sm:right-auto sm:left-6 md:left-10 bottom-6 sm:bottom-8 md:bottom-10 z-10 max-w-sm">
          <div className="flex items-center gap-2 text-[#3d5638] sm:text-white/95 mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="hero-intro flex text-sm font-semibold sm:font-medium">
              <span className="hero-intro-word">Logica</span>
              <span className="hero-intro-word">Infoway</span>
            </span>
          </div>
          <p className="text-[#3d5638]/90 sm:text-white/85 text-xs leading-relaxed mb-6 max-w-xs font-medium sm:font-normal">
            Multi-brand retail and distribution of branded smartphones, IT hardware, software and
            allied accessories — plus networking and security solutions for your business.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to="/shop"
              className="bg-[#3d5638] sm:bg-white hover:bg-[#2d4228] sm:hover:bg-white/90 text-white sm:text-[#1f2a1d] text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors shadow-sm"
            >
              Shop Now
            </Link>
            <Link to="/about" className="text-[#3d5638] sm:text-white text-sm font-semibold sm:font-medium hover:opacity-80 transition-opacity">
              Know More.
            </Link>
          </div>
        </div>

        {/* Bottom-right link */}
        <div className="hidden sm:flex absolute right-6 md:right-10 bottom-8 md:bottom-10 z-10 items-center gap-2 text-white/90 text-sm">
          <button className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
            <Play className="w-3 h-3 fill-white text-white ml-0.5" />
          </button>
          <span className="font-medium">Who we are</span>
        </div>
      </section>

      {/* ================= PRODUCT CATEGORIES (sticky scroll) ================= */}
      <CategoryStickyScroll />

      {/* ================= OUR STORY (cinematic timeline) ================= */}
      <StoryTimeline />

      {/* ================= OUR PURPOSE ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[#3d5638] text-xs sm:text-sm font-semibold uppercase tracking-wide">Our purpose</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
            Technology that works as hard as you do
          </h2>
          <p className="mt-5 text-[#4b5b47] text-sm sm:text-base leading-relaxed">
            Our philosophy is that corporate enterprises must be managed not merely in the
            interests of their owners, but equally in those of their employees, of the consumers
            of their products, of the local community and finally of the country as a whole.
          </p>
          <p className="mt-4 text-[#4b5b47] text-sm sm:text-base leading-relaxed">
            We ensure fair, transparent, accountable and ethical management — motivating every
            employee to play an integral role in the company's growth, and every customer to
            trust what we deliver.
          </p>
        </div>
      </section>

      {/* ================= TRUSTED BY / RECOGNISED BY ================= */}
      <section className="w-full bg-[#f4f8f3] border-y border-[#1f2a1d]/10 py-20 sm:py-28 px-4 sm:px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          {/* Trusted by */}
          <div>
            <p className="text-center text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#1f2a1d] mb-10 sm:mb-14">
              Trusted by
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-16 sm:gap-x-24 gap-y-10">
              {trustedByLogos.map((logo) => (
                <img
                  key={logo.name}
                  src={logo.src}
                  alt={logo.name}
                  className="h-14 sm:h-20 w-auto object-contain grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105"
                />
              ))}
            </div>
          </div>

          <div className="w-24 h-px bg-[#1f2a1d]/15 mx-auto my-16 sm:my-20" />

          {/* Recognised by */}
          <div>
            <p className="text-center text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#1f2a1d] mb-10 sm:mb-14">
              Recognised by
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-16 sm:gap-x-24 gap-y-10">
              {recognisedByLogos.map((logo) => (
                <img
                  key={logo.name}
                  src={logo.src}
                  alt={logo.name}
                  className="h-14 sm:h-20 w-auto object-contain grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS (full-screen dynamic counter) ================= */}
      <StatsCounter />

      {/* ================= CLOSING CTA ================= */}
      <section className="w-full bg-[#1f2a1d] py-20 sm:py-24 px-4 sm:px-6 md:px-10 text-center">
        <span className="text-[#85AB8B] text-xs sm:text-sm font-semibold uppercase tracking-wide">Ready when you are</span>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-white" style={{ letterSpacing: '-0.03em' }}>
          Let's equip your business
        </h2>
        <p className="mt-4 text-white/70 text-sm sm:text-base max-w-md mx-auto">
          Genuine hardware, enterprise pricing, and three decades of delivery behind every order.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/shop"
            className="btn-liquid border-2 border-white text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            style={{ '--liquid': '#fff', '--liquid-ink': '#1f2a1d' } as CSSProperties}
          >
            Explore Products
          </Link>
          <a href="tel:+917003999192" className="flex items-center gap-2 text-white text-sm font-medium hover:opacity-80 transition-opacity">
            <Play className="w-4 h-4 fill-white" />
            +91 7003999192
          </a>
        </div>
      </section>

      {/* ================= FOLLOW US (full-screen dynamic segment) ================= */}
      <FollowUs />

      {/* ================= ORDER TYPES (final segment) ================= */}
      <OrderTypes />

      <Footer />
    </div>
  );
}
