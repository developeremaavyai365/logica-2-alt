import Header from '../components/Header';
import Footer from '../components/Footer';
import ShopBrowser from '../components/shop/ShopBrowser';
import MotionRevealHero from '../components/MotionRevealHero';
import { products } from '../data';

export default function Shop() {
  return (
    <div className="w-full">
      {/* ================= MOTION REVEAL HERO ================= */}
      <section className="relative w-full">
        <div className="absolute top-0 left-0 right-0 z-20">
          <Header transparent />
        </div>
        <MotionRevealHero />
      </section>

      {/* ================= ALL PRODUCTS ================= */}
      <div className="w-full bg-[#dbe8d6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16">
          <h2 className="text-xl font-semibold text-[#1f2a1d] mb-6">All products</h2>
          <ShopBrowser products={products} accent="#85AB8B" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
