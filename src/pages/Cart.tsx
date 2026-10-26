import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHeaderCard from '../components/shop/PageHeaderCard';
import { products, formatINR } from '../data';
import { findColour, productTitle } from '../product-colours';
import { lineKey, useShopStore } from '../store';
import { useAuthStore } from '../auth-store';

const MICRO_LABEL = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';
const STEP_CELL =
  'flex h-10 w-10 items-center justify-center border-r border-shop-line text-shop-ink transition-colors duration-300 hover:bg-shop-ink hover:text-white';

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
    .map((line) => ({ line, product: products.find((p) => p.id === line.id), colour: findColour(line.id, line.colour) }))
    .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } => !!l.product);

  const itemCount = lines.reduce((sum, { line }) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, { line, product }) => sum + product.price * line.qty, 0);
  const mrpTotal = lines.reduce((sum, { line, product }) => sum + (product.mrp ?? product.price) * line.qty, 0);
  const savings = mrpTotal - subtotal;

  if (!ready) return null;

  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeaderCard label="Shopping cart" title="Your Cart" count={itemCount} countLabel="Items" />

        {lines.length === 0 ? (
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-shop-ink/20 bg-white px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-shop-canvas">
              <ShoppingCart className="h-6 w-6 text-shop-ink/40" />
            </span>
            <p className="mt-4 text-base font-semibold text-shop-ink">Your cart is empty</p>
            <p className="mt-1 text-sm text-shop-ink/55">Add a product and it will show up here.</p>
            <Link
              to="/shop"
              className="group mt-6 flex h-12 items-center gap-2 rounded-xl bg-shop-ink px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_22rem]">
            {/* Line items — each one a card: image tile, details, and a
                footer row holding the quantity stepper and Remove. */}
            <ul className="flex flex-col gap-4">
              {lines.map(({ line, product, colour }) => {
                const key = lineKey(line);
                const href = colour ? `/product/${product.id}?colour=${colour.key}` : `/product/${product.id}`;
                return (
                <li key={key} className="flex overflow-hidden rounded-2xl border border-shop-line bg-white">
                  {/* Module — image tile */}
                  <Link
                    to={href}
                    className="relative w-24 shrink-0 border-r border-shop-line bg-shop-canvas sm:w-36"
                  >
                    <img
                      src={colour?.images[0] ?? product.image}
                      alt={productTitle(product, colour)}
                      className="absolute inset-0 h-full w-full object-contain p-3 mix-blend-multiply"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    {/* Module — details + line total */}
                    <div className="flex flex-1 items-start justify-between gap-4 px-4 py-3.5">
                      <div className="min-w-0">
                        <span className={MICRO_LABEL}>{product.brand}</span>
                        <Link
                          to={href}
                          className="mt-1 block text-sm font-semibold leading-snug text-shop-ink line-clamp-2 transition-opacity hover:opacity-70"
                        >
                          {productTitle(product, colour)}
                        </Link>
                        {colour && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-shop-ink/65">
                            <span className="h-3 w-3 rounded-full border border-shop-ink/15" style={{ backgroundColor: colour.hex }} aria-hidden="true" />
                            Colour: <span className="font-semibold text-shop-ink">{colour.name}</span>
                          </p>
                        )}
                        <p className="mt-1.5 font-mono text-[11px] tabular-nums text-shop-ink/55">
                          {formatINR(product.price)} each
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={MICRO_LABEL}>Total</span>
                        <span
                          className="mt-0.5 block font-dm-sans text-lg font-semibold tabular-nums text-shop-ink"
                          style={{ letterSpacing: '-0.03em' }}
                        >
                          {formatINR(product.price * line.qty)}
                        </span>
                      </div>
                    </div>

                    {/* Module — quantity + remove */}
                    <div className="flex items-stretch justify-between border-t border-shop-line">
                      <div className="flex items-stretch">
                        <button
                          type="button"
                          onClick={() => setQty(key, line.qty - 1)}
                          className={STEP_CELL}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="flex h-10 w-11 items-center justify-center border-r border-shop-line font-mono text-sm font-bold tabular-nums text-shop-ink">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(key, line.qty + 1)}
                          className={STEP_CELL}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(key)}
                        className="flex items-center gap-1.5 border-l border-shop-line px-4 text-xs font-semibold text-shop-ink/60 transition-colors duration-300 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>

            {/* Order summary card */}
            <div className="h-fit overflow-hidden rounded-2xl border border-shop-line bg-white lg:sticky lg:top-6">
              <div className="flex items-center justify-between gap-3 border-b border-shop-line px-5 py-2.5">
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink">Order summary</h2>
                <span className="font-mono text-[11px] tabular-nums text-shop-ink/45">
                  {String(itemCount).padStart(2, '0')} item{itemCount !== 1 ? 's' : ''}
                </span>
              </div>

              <dl className="divide-y divide-shop-line text-sm">
                <div className="flex items-center justify-between gap-4 px-5 py-3">
                  <dt className="text-shop-ink/60">Subtotal</dt>
                  <dd className="font-mono tabular-nums text-shop-ink">{formatINR(subtotal)}</dd>
                </div>
                {savings > 0 && (
                  <div className="flex items-center justify-between gap-4 px-5 py-3">
                    <dt className="text-shop-ink/60">You save</dt>
                    <dd className="font-mono font-bold tabular-nums text-shop-accent">−{formatINR(savings)}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 px-5 py-3">
                  <dt className="text-shop-ink/60">Shipping</dt>
                  <dd className="text-right text-shop-ink/60">Calculated at checkout</dd>
                </div>
              </dl>

              <div className="flex items-end justify-between gap-4 border-t border-shop-line bg-shop-canvas px-5 py-4">
                <span className={MICRO_LABEL}>Total</span>
                <span
                  className="font-dm-sans text-2xl font-semibold tabular-nums leading-none text-shop-ink"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {formatINR(subtotal)}
                </span>
              </div>

              <div className="border-t border-shop-line p-3">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-shop-ink text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                </button>
                {checkoutNotice && (
                  <p className="mt-2 px-2 text-center text-[11px] text-shop-ink/55">
                    Checkout isn't connected to a payment provider in this preview.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Guest checkout guard */}
      {showAuthGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthGuard(false)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-shop-line bg-white shadow-2xl">
            <div className="flex items-stretch justify-between border-b border-shop-line">
              <span className="flex items-center gap-2 px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-shop-accent" aria-hidden="true" />
                Checkout
              </span>
              <button
                type="button"
                onClick={() => setShowAuthGuard(false)}
                aria-label="Close"
                className="flex w-12 items-center justify-center border-l border-shop-line text-shop-ink/60 transition-colors duration-300 hover:bg-shop-ink hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-start gap-4 px-5 py-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-shop-canvas">
                <ShoppingCart className="h-5 w-5 text-shop-ink" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-shop-ink" style={{ letterSpacing: '-0.02em' }}>
                  Sign in to continue
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-shop-ink/60">
                  Please sign in or create an account to complete your purchase. Your cart will be right here when you
                  come back.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-shop-line p-3">
              <Link
                to="/login?redirect=/cart"
                className="flex h-12 w-full items-center justify-center rounded-xl bg-shop-ink text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
              >
                Sign In
              </Link>
              <Link
                to="/signup?redirect=/cart"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-shop-line text-sm font-semibold text-shop-ink transition-colors duration-300 hover:border-shop-ink"
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
