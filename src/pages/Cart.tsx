import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { products, formatINR } from '../data';
import { useShopStore } from '../store';
import { useAuthStore } from '../auth-store';

export default function Cart() {
  const { cart, setQty, removeFromCart, ready } = useShopStore();
  const { user } = useAuthStore();
  const [showAuthGuard, setShowAuthGuard] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  function handleCheckoutClick() {
    if (!user) {
      setShowAuthGuard(true);
      return;
    }
    setCheckoutNotice(true);
    setTimeout(() => setCheckoutNotice(false), 3000);
  }

  const lines = cart
    .map((line) => ({ line, product: products.find((p) => p.id === line.id) }))
    .filter((l): l is { line: typeof cart[number]; product: NonNullable<typeof l.product> } => !!l.product);

  const subtotal = lines.reduce((sum, { line, product }) => sum + product.price * line.qty, 0);
  const mrpTotal = lines.reduce((sum, { line, product }) => sum + (product.mrp ?? product.price) * line.qty, 0);
  const savings = mrpTotal - subtotal;

  if (!ready) return null;

  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-14">
        <h1 className="text-3xl sm:text-4xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
          Your Cart
        </h1>

        {lines.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#ECEDEC] flex items-center justify-center mb-5">
              <ShoppingCart className="w-7 h-7 text-black" />
            </div>
            <p className="text-[#6b6b6b] text-sm mb-6">Your cart is empty.</p>
            <Link to="/shop" className="btn-liquid border-2 border-[#000000] text-[#000000] text-sm font-semibold px-6 py-3 rounded-full transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-10">
            {/* Line items */}
            <div className="space-y-4">
              {lines.map(({ line, product }) => (
                <div key={product.id} className="flex items-center gap-4 rounded-2xl border border-[#000000]/10 p-4">
                  <Link to={`/product/${product.id}`} className="w-20 h-20 rounded-xl bg-[#ECEDEC] overflow-hidden shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-medium text-black uppercase tracking-wide">{product.brand}</span>
                    <Link to={`/product/${product.id}`} className="block text-sm font-semibold text-[#000000] leading-snug line-clamp-2 hover:opacity-80">
                      {product.name}
                    </Link>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-[#000000]/15 rounded-full">
                        <button
                          onClick={() => setQty(product.id, line.qty - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#000000] hover:bg-[#ECEDEC] rounded-full transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{line.qty}</span>
                        <button
                          onClick={() => setQty(product.id, line.qty + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#000000] hover:bg-[#ECEDEC] rounded-full transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-xs text-[#6b6b6b] hover:text-red-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#000000] shrink-0">{formatINR(product.price * line.qty)}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-[#000000]/10 bg-[#ECEDEC] p-6 h-fit">
              <h2 className="text-sm font-semibold text-[#000000] mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-black font-medium">
                    <span>You save</span>
                    <span>-{formatINR(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#000000]/10 flex justify-between text-base font-semibold text-[#000000]">
                <span>Total</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <button
                onClick={handleCheckoutClick}
                className="btn-liquid mt-6 w-full border-2 border-[#000000] text-[#000000] text-sm font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Checkout
              </button>
              {checkoutNotice && (
                <p className="mt-2 text-[11px] text-[#6b6b6b]/70 text-center">
                  Checkout isn't connected to a payment provider in this preview.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Guest checkout guard */}
      {showAuthGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthGuard(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowAuthGuard(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-[#6b6b6b] hover:text-[#000000] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-[#ECEDEC] flex items-center justify-center mb-4">
              <ShoppingCart className="w-5 h-5 text-black" />
            </div>
            <h2 className="text-lg font-semibold text-[#000000]">Sign in to continue</h2>
            <p className="mt-2 text-sm text-[#6b6b6b] leading-relaxed">
              Please sign in or create an account to complete your purchase. Your cart will be right here when you
              come back.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/login?redirect=/cart"
                className="w-full rounded-full bg-[#000000] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
              >
                Sign In
              </Link>
              <Link
                to="/signup?redirect=/cart"
                className="w-full rounded-full border-2 border-[#000000] py-3 text-center text-sm font-semibold text-[#000000] transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
