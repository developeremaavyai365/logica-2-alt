import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Banknote, Check, CreditCard, Lock, MapPin, Minus, Package, Phone, Plus, ShoppingBag, Trash2, Wallet } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import AddressForm from '../components/account/AddressForm';
import { ACCOUNT_CARD } from '../components/account/AccountShell';
import { TitleGlow } from '../components/auth/AuthShell';
import CheckoutShell, { NAVY_BUTTON, PriceDetails, ProductThumb, SectionCard, TrustList } from '../components/checkout/CheckoutShell';
import { messageFrom } from '../auth-store';
import { ApiError } from '../lib/api-client';
import { lineKey, useShopStore } from '../store';
import { EMPTY_ADDRESS, addressLine, createAddress, listAddresses, type SavedAddress } from '../lib/addresses';
import {
  getQuote,
  placeOrder,
  problemText,
  rupees,
  toQuoteLines,
  useCheckoutConfig,
  type Quote,
} from '../lib/checkout';
import { lineVisual } from '../lib/order-lines';

/** A random v4 UUID (the site is always served over HTTPS or localhost,
 *  where the browser provides crypto). */
function newKey(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const TITLE = (
  <>
    Secure <TitleGlow>checkout</TitleGlow>
  </>
);

function CheckoutFlow() {
  const navigate = useNavigate();
  const config = useCheckoutConfig();
  const { cart, ready, setQty, removeFromCart } = useShopStore();

  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [method, setMethod] = useState<'COD' | 'ONLINE' | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  // One key per checkout visit: a double click, or a retry after a lost
  // reply, finds the order already placed instead of placing it twice.
  const idempotencyKey = useRef(newKey());

  useEffect(() => {
    listAddresses()
      .then((list) => {
        setAddresses(list);
        setAddressId(list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null);
        if (list.length === 0) setAddingAddress(true);
      })
      .catch(() => setAddresses([]));
  }, []);

  // Re-price whenever the cart changes (quantity, removal).
  const cartSignature = JSON.stringify(toQuoteLines(cart));
  useEffect(() => {
    if (!ready || cart.length === 0) return;
    let cancelled = false;
    const t = setTimeout(() => {
      getQuote(cart)
        .then((q) => {
          if (cancelled) return;
          setQuote(q);
          setQuoteError('');
        })
        .catch((err) => !cancelled && setQuoteError(messageFrom(err, 'Could not check prices right now. Please try again.')));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [cartSignature, ready]);

  // The payment choice follows what the total allows.
  useEffect(() => {
    if (!quote) return;
    setMethod((m) => {
      if (m === 'COD' && quote.cod.allowed) return m;
      if (m === 'ONLINE' && quote.online.allowed) return m;
      return quote.cod.allowed ? 'COD' : quote.online.allowed ? 'ONLINE' : null;
    });
  }, [quote]);

  const selected = useMemo(() => addresses?.find((a) => a.id === addressId) ?? null, [addresses, addressId]);
  const blocked = !quote?.orderable || !selected || !method || placing;
  const savings = quote ? quote.mrpTotalPaise - quote.subtotalPaise : 0;

  async function handlePlace() {
    if (!quote || !selected || !method) return;
    setPlacing(true);
    setPlaceError('');
    try {
      const placed = await placeOrder({
        addressId: selected.id,
        paymentMethod: method,
        lines: toQuoteLines(cart),
        idempotencyKey: idempotencyKey.current,
      });
      navigate(placed.next === 'pay' ? `/checkout/pay/${placed.orderNumber}` : `/orders/${placed.orderNumber}?placed=1`, {
        replace: true,
      });
    } catch (err) {
      // The cart changed under us (price, stock): show the new picture.
      const body = err instanceof ApiError ? (err.body as { quote?: Quote } | undefined) : undefined;
      if (body?.quote) setQuote(body.quote);
      setPlaceError(messageFrom(err, 'Could not place your order. Please try again.'));
      setPlacing(false);
    }
  }

  if (!ready) return null;

  if (config && !config.enabled) {
    return (
      <CheckoutShell eyebrow="Checkout" title={TITLE} step={1}>
        <Notice
          icon={Lock}
          title="Online ordering opens soon"
          text="You can't place orders on the website just yet. To order now, call +91 7003999192."
          cta={{ to: '/cart', label: 'Back to cart' }}
        />
      </CheckoutShell>
    );
  }

  if (cart.length === 0) {
    return (
      <CheckoutShell eyebrow="Checkout" title={TITLE} step={1}>
        <Notice icon={ShoppingBag} title="Your cart is empty" text="Add something to your cart to check out." cta={{ to: '/shop', label: 'Continue shopping' }} />
      </CheckoutShell>
    );
  }

  const buttonLabel = placing ? 'Placing order…' : method === 'ONLINE' ? 'Continue to payment' : 'Place order';
  const hint = placeError ? (
    <p className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600" role="alert">
      {placeError}
    </p>
  ) : quote && !quote.orderable ? (
    <p className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">Fix the items marked in red to continue.</p>
  ) : !selected && addresses !== null ? (
    <p className="mb-3 rounded-xl bg-[#F1F3FE] px-4 py-2.5 text-xs font-medium text-[#061A40]">Add a delivery address to continue.</p>
  ) : null;

  return (
    <CheckoutShell
      eyebrow="Checkout"
      title={TITLE}
      step={1}
      subtitle={
        quote && (
          <>
            {quote.itemCount} item{quote.itemCount === 1 ? '' : 's'} · {rupees(quote.totalPaise)}
            {savings > 0 && <span className="ml-2 font-semibold text-[#C7D4FF]">You save {rupees(savings)}</span>}
          </>
        )
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Delivery address */}
          <SectionCard icon={MapPin} title="Delivery address">
            {addresses === null && <div className="mx-5 mb-5 h-20 animate-pulse rounded-2xl bg-[#F5F8FC] sm:mx-6" />}

            {addresses && addresses.length > 0 && (
              <ul className="flex flex-col gap-2.5 px-5 pb-4 sm:px-6" role="radiogroup" aria-label="Delivery address">
                {addresses.map((a) => {
                  const on = a.id === addressId;
                  return (
                    <li key={a.id}>
                      <label
                        className={`flex cursor-pointer gap-3.5 rounded-2xl border-2 px-4 py-3.5 transition-colors ${
                          on ? 'border-[#3D4FE0] bg-[#F1F3FE]' : 'border-[#EEF0F6] hover:border-[#C7D2FE]'
                        }`}
                      >
                        <input type="radio" name="address" checked={on} onChange={() => setAddressId(a.id)} className="sr-only" />
                        <RadioDot on={on} />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-semibold text-[#061A40]">{a.fullName}</span>
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#061A40]/60 ring-1 ring-[#E7EAF3]">
                              {a.label}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-[#6B7280]">{addressLine(a)}</span>
                          <span className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280]">
                            <Phone className="h-3.5 w-3.5" />
                            {a.phone}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {addingAddress ? (
              <div className="px-5 pb-5 sm:px-6">
                <AddressForm
                  heading="Add a delivery address"
                  initial={{ ...EMPTY_ADDRESS, isDefault: (addresses?.length ?? 0) === 0 }}
                  onCancel={addresses && addresses.length > 0 ? () => setAddingAddress(false) : undefined}
                  onSave={async (input) => {
                    try {
                      const saved = await createAddress(input);
                      setAddresses(await listAddresses());
                      setAddressId(saved.id);
                      setAddingAddress(false);
                      return null;
                    } catch (err) {
                      return messageFrom(err, 'Could not save this address.');
                    }
                  }}
                />
              </div>
            ) : (
              addresses !== null && (
                <button
                  type="button"
                  onClick={() => setAddingAddress(true)}
                  className="flex w-full items-center gap-2 border-t border-[#EEF0F6] bg-[#FAFBFE] px-5 py-3.5 text-sm font-semibold text-[#3D4FE0] transition-colors hover:bg-[#F1F3FE] sm:px-6"
                >
                  <Plus className="h-4 w-4" />
                  Add a new address
                </button>
              )
            )}
          </SectionCard>

          {/* Items */}
          <SectionCard icon={Package} title="Review items">
            {quoteError && <p className="px-6 pb-5 text-sm font-medium text-red-600">{quoteError}</p>}
            {!quote && !quoteError && <div className="mx-5 mb-5 h-24 animate-pulse rounded-2xl bg-[#F5F8FC] sm:mx-6" />}

            {quote && (
              <ul className="divide-y divide-[#EEF0F6] border-t border-[#EEF0F6]">
                {quote.lines.map((l) => {
                  const v = lineVisual(l.productId, l.colour);
                  const key = lineKey({ id: l.productId, colour: l.colour ?? undefined });
                  const cartLine = cart.find((c) => lineKey(c) === key);
                  const qty = cartLine?.qty ?? l.quantity;
                  const off = !l.problem && l.mrpPaise > l.unitPaise ? Math.round(((l.mrpPaise - l.unitPaise) / l.mrpPaise) * 100) : 0;
                  return (
                    <li key={key} className="flex gap-4 px-5 py-4 sm:gap-5 sm:px-6">
                      <Link to={v.href} className="transition-opacity hover:opacity-80">
                        <ProductThumb src={v.image} />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        {v.product?.brand && (
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3D4FE0]">{v.product.brand}</span>
                        )}
                        <Link
                          to={v.href}
                          className="mt-0.5 text-[15px] font-semibold leading-snug text-[#061A40] line-clamp-2 transition-colors hover:text-[#3D4FE0]"
                        >
                          {l.name ?? v.title}
                        </Link>
                        {v.colour && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: v.colour.hex }} aria-hidden="true" />
                            {v.colour.name}
                          </p>
                        )}
                        {l.problem ? (
                          <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-red-600">
                            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                            {problemText(l)}
                          </p>
                        ) : (
                          <p className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                            <span className="font-dm-sans text-lg font-bold tabular-nums text-[#061A40]" style={{ letterSpacing: '-0.02em' }}>
                              {rupees(l.unitPaise)}
                            </span>
                            {l.mrpPaise > l.unitPaise && <span className="text-sm tabular-nums text-[#9CA3AF] line-through">{rupees(l.mrpPaise)}</span>}
                            {off > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{off}% off</span>}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {l.maxQuantity > 0 && (
                            <div className="flex items-center rounded-full border border-[#E5E7EB] bg-white p-1">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                disabled={qty <= 1}
                                onClick={() => setQty(key, qty - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#061A40] transition-colors hover:bg-[#F1F3FE] hover:text-[#3D4FE0] disabled:opacity-30 disabled:hover:bg-transparent"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-9 text-center text-sm font-semibold tabular-nums text-[#061A40]" aria-label="Quantity">
                                {qty}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                disabled={qty >= l.maxQuantity}
                                onClick={() => setQty(key, qty + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#061A40] transition-colors hover:bg-[#F1F3FE] hover:text-[#3D4FE0] disabled:opacity-30 disabled:hover:bg-transparent"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          {(l.problem === 'not_enough_stock' || l.problem === 'over_limit') && (
                            <button
                              type="button"
                              onClick={() => setQty(key, l.maxQuantity)}
                              className="rounded-full px-3.5 py-2 text-sm font-semibold text-[#3D4FE0] transition-colors hover:bg-[#F1F3FE]"
                            >
                              Change to {l.maxQuantity}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFromCart(key)}
                            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-[#061A40]/70 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* Payment method */}
          <SectionCard icon={Wallet} title="Payment method">
            {quote ? (
              <div className="flex flex-col gap-2.5 px-5 pb-5 sm:px-6" role="radiogroup" aria-label="Payment method">
                <PaymentOption
                  icon={Banknote}
                  title="Cash on delivery"
                  text={quote.cod.allowed ? 'Pay in cash when your order arrives.' : quote.cod.reason ?? ''}
                  checked={method === 'COD'}
                  disabled={!quote.cod.allowed}
                  onSelect={() => setMethod('COD')}
                />
                <PaymentOption
                  icon={CreditCard}
                  title="Pay online"
                  badge={quote.online.mode === 'test' ? 'Test mode' : undefined}
                  text={
                    quote.online.mode === 'test'
                      ? 'UPI, cards, net banking and wallets. Test mode: no real money is taken.'
                      : 'UPI, cards and net banking are coming soon.'
                  }
                  checked={method === 'ONLINE'}
                  disabled={!quote.online.allowed}
                  onSelect={() => setMethod('ONLINE')}
                />
              </div>
            ) : (
              <div className="mx-5 mb-5 h-20 animate-pulse rounded-2xl bg-[#F5F8FC] sm:mx-6" />
            )}
          </SectionCard>
        </div>

        {/* Price details + place order */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          {quote ? (
            <PriceDetails
              itemCount={quote.itemCount}
              mrpTotalPaise={quote.mrpTotalPaise}
              subtotalPaise={quote.subtotalPaise}
              shippingPaise={quote.shippingPaise}
              totalPaise={quote.totalPaise}
            >
              {hint}
              <button type="button" onClick={handlePlace} disabled={blocked} className={NAVY_BUTTON}>
                <Lock className="h-4 w-4" />
                {buttonLabel}
                {!placing && <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />}
              </button>
            </PriceDetails>
          ) : (
            <div className={`${ACCOUNT_CARD} h-64 animate-pulse`} />
          )}
          <TrustList />
        </aside>
      </div>

      {/* Phone: the total and the button stay in reach at the bottom */}
      {quote && (
        <div data-sticky-bar className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E7EAF3] bg-white/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(6,26,64,0.35)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0">
              <span className="block font-dm-sans text-xl font-bold tabular-nums text-[#061A40]">{rupees(quote.totalPaise)}</span>
              {savings > 0 && <span className="block text-xs font-semibold text-emerald-600">You save {rupees(savings)}</span>}
            </div>
            <button type="button" onClick={handlePlace} disabled={blocked} className={`${NAVY_BUTTON} ml-auto w-auto flex-1 px-5`}>
              {buttonLabel}
            </button>
          </div>
        </div>
      )}
    </CheckoutShell>
  );
}

/** The round radio mark used on address and payment choices. */
function RadioDot({ on }: { on: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        on ? 'border-[#3D4FE0] bg-[#3D4FE0] text-white' : 'border-[#C9CEDC] bg-white'
      }`}
      aria-hidden="true"
    >
      {on && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  );
}

function PaymentOption({
  icon: Icon,
  title,
  badge,
  text,
  checked,
  disabled,
  onSelect,
}: {
  icon: typeof Banknote;
  title: string;
  badge?: string;
  text: string;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex items-start gap-3.5 rounded-2xl border-2 px-4 py-3.5 transition-colors ${
        disabled
          ? 'cursor-not-allowed border-[#EEF0F6] opacity-55'
          : checked
            ? 'cursor-pointer border-[#3D4FE0] bg-[#F1F3FE]'
            : 'cursor-pointer border-[#EEF0F6] hover:border-[#C7D2FE]'
      }`}
    >
      <input type="radio" name="payment" checked={checked} disabled={disabled} onChange={onSelect} className="sr-only" />
      <RadioDot on={checked} />
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${checked ? 'bg-white text-[#3D4FE0]' : 'bg-[#F5F8FC] text-[#061A40]/60'}`}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold text-[#061A40]">{title}</span>
          {badge && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{badge}</span>}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-[#6B7280]">{text}</span>
      </span>
    </label>
  );
}

function Notice({
  icon: Icon,
  title,
  text,
  cta,
}: {
  icon: typeof Lock;
  title: string;
  text: string;
  cta: { to: string; label: string };
}) {
  return (
    <div className={`${ACCOUNT_CARD} flex flex-col items-center px-6 py-16 text-center`}>
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F1F3FE] text-[#3D4FE0]">
        <Icon className="h-9 w-9" />
      </span>
      <h2 className="mt-5 font-dm-sans text-2xl font-bold text-[#061A40]">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-[#6B7280]">{text}</p>
      <Link to={cta.to} className={`${NAVY_BUTTON} mt-7 w-auto px-7`}>
        {cta.label}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutFlow />
    </ProtectedRoute>
  );
}
