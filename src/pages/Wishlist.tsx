import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import PageHeaderCard from '../components/shop/PageHeaderCard';
import AccountShell from '../components/account/AccountShell';
import { products } from '../data';
import { useShopStore } from '../store';
import { useAuthStore } from '../auth-store';

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-[#C7D2FE] bg-white px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-shop-canvas">
        <Heart className="h-6 w-6 text-shop-ink/40" />
      </span>
      <p className="mt-4 text-base font-semibold text-shop-ink">Nothing saved yet</p>
      <p className="mt-1 max-w-sm text-sm text-shop-ink/55">Tap the heart on any product to add it here.</p>
      <Link
        to="/shop"
        className="group mt-6 flex h-12 items-center gap-2 rounded-xl bg-[#061A40] px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
      >
        Continue Shopping
        <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export default function Wishlist() {
  const { wishlist, ready } = useShopStore();
  const { user, ready: authReady } = useAuthStore();
  const items = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => !!p)
    .reverse(); // most recently saved first

  if (!ready || !authReady) return null;

  // Signed in: the wishlist is part of the account, with its menu.
  if (user) {
    return (
      <AccountShell active="wishlist" eyebrow="My stuff" title={`My wishlist${items.length ? ` (${items.length})` : ''}`}>
        {items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </AccountShell>
    );
  }

  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeaderCard label="Saved for later" title="Your Wishlist" count={items.length} countLabel="Saved" />

        {items.length === 0 ? (
          <div className="mt-5">
            <EmptyWishlist />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
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
