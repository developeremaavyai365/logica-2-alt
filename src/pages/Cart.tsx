import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Heart,
  Lock,
  Minus,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WavePanel from '../components/careers/WavePanel';
import { TitleGlow } from '../components/auth/AuthShell';
import { ACCOUNT_CARD } from '../components/account/AccountShell';
import { products, formatINR } from '../data';
import { findColour, productTitle } from '../product-colours';
import { lineKey, useShopStore } from '../store';
import { livePriceOf } from '../live-catalogue';
import { useAuthStore } from '../auth-store';
import { useCanOrder, useCheckoutConfig } from '../lib/checkout';

/** The most of one item allowed in one order (the checkout's own limit). */
const MAX_QTY = 5;
const SUPPORT_PHONE = '+91 7003999192';

const NAVY_BUTTON =
  'group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#061A40] text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(6,26,64,0.6)] transition-colors duration-300 hover:bg-[#3D4FE0]';

/** The checkout journey, shown as three steps with the cart as the first. */
function Steps() {
  const steps = ['Cart', 'Address', 'Payment'];
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3" aria-label="Checkout steps">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-1.5 sm:gap-3">
          <span
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-semibold sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
              i === 0 ? 'border-transparent bg-white text-[#061A40]' : 'border-white/15 bg-white/[0.06] text-white/70'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                i === 0 ? 'bg-[#3D4FE0] text-white' : 'bg-white/10 text-white/80'
              }`}
            >
              {i + 1}
            </span>
            {s}
          </span>
          {i < steps.length - 1 && <span className="h-px w-2 bg-white/25 sm:w-8" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

export default function Cart() {
  const { cart, setQty, removeFromCart, ready, wishlist, inWishlist, toggleWishlist } = useShopStore();
  const { user } = useAuthStore();
  const checkout = useCheckoutConfig();
  const canOrder = useCanOrder();
  const navigate = useNavigate();
  const [showAuthGuard, setShowAuthGuard] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  function handleCheckoutClick() {
    if (!user) {
      setShowAuthGuard(true);
      return;
    }
    if (checkout?.enabled) {
      navigate('/checkout');
      return;
    }
    setCheckoutNotice(true);
    setTimeout(() => setCheckoutNotice(false), 4000);
  }

  const lines = cart
    .map((line) => {
      const product = products.find((p) => p.id === line.id);
      // A colour with its own SAP code is priced as that colour.
      const live = livePriceOf(line.id, line.colour);
      const price = live?.price ?? product?.price ?? 0;
      const mrp = live?.mrp ?? product?.mrp;
      return {
        line,
        product,
        colour: findColour(line.id, line.colour),
        price,
        mrp: mrp && mrp > price ? mrp : undefined,
        orderable: canOrder(line.id, line.colour),
      };
    })
    .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } => !!l.product);

  // Totals count only what can be ordered, as checkout will.
  const counted = lines.filter((l) => l.orderable);
  const itemCount = counted.reduce((sum, { line }) => sum + line.qty, 0);
  const subtotal = counted.reduce((sum, { line, price }) => sum + price * line.qty, 0);
  const mrpTotal = counted.reduce((sum, { line, price, mrp }) => sum + (mrp ?? price) * line.qty, 0);
  const savings = mrpTotal - subtotal;
  const freeDelivery = checkout?.enabled && checkout.shippingPaise === 0;
  const unavailable = lines.filter((l) => !l.orderable).length;

  if (!ready) return null;

  return (
    <div className="w-full bg-[#F5F8FC]">
      <div className="bg-white">
        <Header />
      </div>

      {/* Banner */}
      <div className="bg-white px-4 pb-8 sm:px-6 md:px-5">
        <WavePanel className="mx-auto max-w-[1300px]">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="animate-fade-up">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/60 sm:text-sm">Your cart</span>
              <h1
                className="mt-2 font-dm-sans font-bold text-white"
                style={{ fontSize: 'clamp(30px, 4vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1.06 }}
              >
                Shopping <TitleGlow>cart</TitleGlow>
              </h1>
              <p className="mt-2.5 text-sm text-white/65 sm:text-base">
                {itemCount === 0
                  ? 'Nothing here yet.'
                  : `${itemCount} item${itemCount === 1 ? '' : 's'} · ${formatINR(subtotal)}`}
                {savings > 0 && <span className="ml-2 font-semibold text-[#C7D4FF]">You save {formatINR(savings)}</span>}
              </p>
            </div>
            {lines.length > 0 && <Steps />}
          </div>
        </WavePanel>
      </div>

      <section className="mx-auto max-w-[1300px] px-4 pb-28 pt-2 sm:px-6 md:px-5 lg:pb-16">
        {lines.length === 0 ? (
          <div className={`${ACCOUNT_CARD} flex flex-col items-center px-6 py-16 text-center`}>
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#F1F3FE] text-[#3D4FE0]">
              <ShoppingBag className="h-9 w-9" />
              <span className="absolute inset-0 animate-ping rounded-full bg-[#3D4FE0]/10 [animation-duration:2.5s]" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-dm-sans text-2xl font-bold text-[#061A40]">Your cart is empty</h2>
            <p className="mt-1.5 max-w-sm text-sm text-[#6B7280]">Laptops, phones, printers and more: add something you like and it will wait for you here.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/shop" className={`${NAVY_BUTTON} w-auto px-7`}>
                Continue shopping
                <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
              </Link>
              {wishlist.length > 0 && (
                <Link
                  to="/wishlist"
                  className="flex h-12 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-6 text-[15px] font-semibold text-[#061A40] transition-colors hover:border-[#C7D2FE] hover:text-[#3D4FE0]"
                >
                  <Heart className="h-4 w-4" />
                  View wishlist ({wishlist.length})
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="flex min-w-0 flex-col gap-4">
              {unavailable > 0 && (
                <p className="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {unavailable === 1 ? 'One item' : `${unavailable} items`} can't be ordered online yet. Remove{' '}
                  {unavailable === 1 ? 'it' : 'them'} to check out.
                </p>
              )}

              <ul className="flex flex-col gap-4">
                {lines.map(({ line, product, colour, price, mrp, orderable }) => {
                  const key = lineKey(line);
                  const href = colour ? `/product/${product.id}?colour=${colour.key}` : `/product/${product.id}`;
                  const title = productTitle(product, colour);
                  const off = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
                  const saved = inWishlist(product.id);
                  return (
                    <li key={key} className={`${ACCOUNT_CARD} overflow-hidden transition-shadow duration-300 hover:shadow-[0_24px_50px_-26px_rgba(6,26,64,0.4)]`}>
                      <div className="flex gap-4 p-4 sm:gap-6 sm:p-5">
                        <Link
                          to={href}
                          className="group/img relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#F5F8FC] to-[#EAEFFA] sm:h-36 sm:w-36"
                        >
                          <img
                            src={colour?.images[0] ?? product.image}
                            alt={title}
                            className="absolute inset-0 h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover/img:scale-105"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3D4FE0]">{product.brand}</span>
                          <Link
                            to={href}
                            className="mt-1 text-[15px] font-semibold leading-snug text-[#061A40] line-clamp-2 transition-colors hover:text-[#3D4FE0] sm:text-base"
                          >
                            {title}
                          </Link>
                          {colour && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#6B7280]">
                              <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: colour.hex }} aria-hidden="true" />
                              {colour.name}
                            </p>
                          )}

                          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                            <span className="font-dm-sans text-xl font-bold tabular-nums text-[#061A40]" style={{ letterSpacing: '-0.02em' }}>
                              {formatINR(price)}
                            </span>
                            {mrp && <span className="text-sm tabular-nums text-[#9CA3AF] line-through">{formatINR(mrp)}</span>}
                            {off > 0 && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{off}% off</span>
                            )}
                          </div>

                          {!orderable ? (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Currently unavailable to order online
                            </p>
                          ) : (
                            freeDelivery && (
                              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
                                <Truck className="h-3.5 w-3.5 text-[#3D4FE0]" />
                                Free delivery
                              </p>
                            )
                          )}
                        </div>
                      </div>

                      {/* Quantity and actions */}
                      <div className="flex flex-wrap items-center gap-2 border-t border-[#EEF0F6] bg-[#FAFBFE] px-4 py-3 sm:px-5">
                        <div className="flex items-center rounded-full border border-[#E5E7EB] bg-white p-1">
                          <button
                            type="button"
                            onClick={() => setQty(key, line.qty - 1)}
                            disabled={line.qty <= 1}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#061A40] transition-colors hover:bg-[#F1F3FE] hover:text-[#3D4FE0] disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold tabular-nums text-[#061A40]" aria-label="Quantity">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(key, line.qty + 1)}
                            disabled={line.qty >= MAX_QTY}
                            aria-label="Increase quantity"
                            title={line.qty >= MAX_QTY ? `Up to ${MAX_QTY} per order` : undefined}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#061A40] transition-colors hover:bg-[#F1F3FE] hover:text-[#3D4FE0] disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!saved) toggleWishlist(product.id);
                            removeFromCart(key);
                          }}
                          className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-[#061A40]/70 transition-colors hover:bg-[#F1F3FE] hover:text-[#3D4FE0]"
                        >
                          <Heart className="h-4 w-4" />
                          <span className="hidden sm:inline">Save for later</span>
                          <span className="sm:hidden">Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(key)}
                          className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-[#061A40]/70 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>

                        <span className="ml-auto text-right">
                          <span className="block text-[11px] text-[#6B7280]">Item total</span>
                          <span className="font-dm-sans text-base font-bold tabular-nums text-[#061A40]">{formatINR(price * line.qty)}</span>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price details */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
              <div className={`${ACCOUNT_CARD} overflow-hidden`}>
                <div className="flex items-center gap-2.5 px-6 pt-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1F3FE] text-[#3D4FE0]">
                    <ReceiptText className="h-4 w-4" />
                  </span>
                  <h2 className="font-dm-sans text-[17px] font-bold text-[#061A40]">Price details</h2>
                </div>

                <dl className="space-y-3 px-6 pb-5 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6B7280]">
                      Price ({itemCount} item{itemCount === 1 ? '' : 's'})
                    </dt>
                    <dd className="tabular-nums text-[#061A40]">{formatINR(mrpTotal)}</dd>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#6B7280]">Discount</dt>
                      <dd className="font-semibold tabular-nums text-emerald-600">−{formatINR(savings)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6B7280]">Delivery</dt>
                    <dd className={freeDelivery ? 'font-semibold text-emerald-600' : 'text-[#6B7280]'}>
                      {freeDelivery ? 'Free' : 'At checkout'}
                    </dd>
                  </div>
                </dl>

                <div className="mx-6 flex items-end justify-between gap-4 border-t border-dashed border-[#DDE2EE] py-4">
                  <span className="text-sm font-semibold text-[#061A40]">Total amount</span>
                  <span className="font-dm-sans text-[28px] font-bold leading-none tabular-nums text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
                    {formatINR(subtotal)}
                  </span>
                </div>

                {savings > 0 && (
                  <p className="mx-6 mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700">
                    You save {formatINR(savings)} on this order
                  </p>
                )}

                <div className="px-6 pb-6">
                  <button type="button" onClick={handleCheckoutClick} className={NAVY_BUTTON}>
                    <Lock className="h-4 w-4" />
                    {checkout?.enabled ? 'Proceed to checkout' : 'Checkout'}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                  </button>
                  {checkoutNotice && (
                    <p className="animate-fade-up mt-3 rounded-xl bg-[#F1F3FE] px-4 py-2.5 text-center text-xs font-medium text-[#061A40]">
                      Online ordering opens soon. To order now, call {SUPPORT_PHONE}.
                    </p>
                  )}
                </div>
              </div>

              <ul className={`${ACCOUNT_CARD} divide-y divide-[#EEF0F6] px-6`}>
                {[
                  { icon: ShieldCheck, title: 'Secure checkout', text: 'Your details are sent over an encrypted connection.' },
                  { icon: ReceiptText, title: 'Prices include GST', text: 'No hidden taxes added later.' },
                  { icon: Phone, title: 'Help with your order', text: `Call ${SUPPORT_PHONE}, Mon to Sat.` },
                ].map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex items-center gap-3.5 py-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F8FC] text-[#3D4FE0]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#061A40]">{title}</span>
                      <span className="block text-xs text-[#6B7280]">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}
      </section>

      {/* Phone: the total and checkout stay in reach at the bottom */}
      {lines.length > 0 && (
        <div data-sticky-bar className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E7EAF3] bg-white/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(6,26,64,0.35)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0">
              <span className="block font-dm-sans text-xl font-bold tabular-nums text-[#061A40]">{formatINR(subtotal)}</span>
              {savings > 0 && <span className="block text-xs font-semibold text-emerald-600">You save {formatINR(savings)}</span>}
            </div>
            <button type="button" onClick={handleCheckoutClick} className={`${NAVY_BUTTON} ml-auto w-auto flex-1 px-5`}>
              Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Guest checkout guard */}
      {showAuthGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#061A40]/60 backdrop-blur-sm" onClick={() => setShowAuthGuard(false)} />
          <div className="animate-fade-up relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
            <WavePanel className="rounded-none">
              <div className="flex items-start justify-between gap-3 px-6 pb-6 pt-5">
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">Almost there</span>
                  <h2 className="mt-2 font-dm-sans text-2xl font-bold text-white">
                    Sign in to <TitleGlow>check out</TitleGlow>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthGuard(false)}
                  aria-label="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </WavePanel>
            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-[#6B7280]">
                Sign in or create an account to place your order. Your cart will be right here when you come back.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <Link to="/login?redirect=/cart" className={NAVY_BUTTON}>
                  Sign in
                </Link>
                <Link
                  to="/signup?redirect=/cart"
                  className="flex h-12 w-full items-center justify-center rounded-xl border border-[#E5E7EB] text-[15px] font-semibold text-[#061A40] transition-colors hover:border-[#C7D2FE] hover:text-[#3D4FE0]"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
