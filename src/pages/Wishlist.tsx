import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { products } from '../data';
import { useShopStore } from '../store';

export default function Wishlist() {
  const { wishlist, ready } = useShopStore();
  const items = products.filter((p) => wishlist.includes(p.id));

  if (!ready) return null;

  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-14">
        <h1 className="text-3xl sm:text-4xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
          Your Wishlist {items.length > 0 && `(${items.length})`}
        </h1>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#f4f8f3] flex items-center justify-center mb-5">
              <Heart className="w-7 h-7 text-[#3d5638]" />
            </div>
            <p className="text-[#4b5b47] text-sm mb-6">Nothing saved yet — tap the heart on any product to add it here.</p>
            <Link to="/shop" className="btn-liquid border-2 border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-6 py-3 rounded-full transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
