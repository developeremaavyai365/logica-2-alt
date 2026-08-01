import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function ClosingBanner() {
  return (
    <section className="bg-[#ECEDEC] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
      <div className="animate-fade-up mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2
          className="font-dm-sans font-normal text-black"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', letterSpacing: '-0.05em', lineHeight: 1.05 }}
        >
          Let's equip your business
        </h2>
        <p
          className="font-inter mt-4 max-w-md text-sm text-black/60 sm:text-base lg:text-lg"
          style={{ lineHeight: 1.45, letterSpacing: '-0.03em' }}
        >
          Genuine hardware, enterprise pricing, and three decades of delivery behind every order.
        </p>
        <Link
          to="/shop"
          className="btn-liquid font-inter mt-8 flex h-14 w-full max-w-[240px] items-center justify-center gap-2 rounded-md border-2 border-[#1f2a1d] font-medium text-[#1f2a1d] transition-colors sm:h-16 lg:h-[72px] lg:max-w-[280px]"
          style={{ letterSpacing: '-0.03em', fontSize: 'clamp(16px, 2vw, 22px)' }}
        >
          Shop Now
          <ArrowUpRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
