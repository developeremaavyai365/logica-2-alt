import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Banknote, CreditCard, Lock, MapPin, Minus, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import AddressForm from '../components/account/AddressForm';
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

const STEP_HEAD = 'flex items-center gap-3 border-b border-shop-line px-5 py-3';
const STEP_NUM =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-shop-ink font-mono text-[11px] font-bold text-white';
const STEP_TITLE = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink';

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
      <Shell>
        <Notice
          title="Online ordering opens soon"
          text="You can't place orders on the website just yet. To order now, call +91 7003999192."
          cta={{ to: '/cart', label: 'Back to cart' }}
        />
      </Shell>
    );
  }

  if (cart.length === 0) {
    return (
      <Shell>
        <Notice title="Your cart is empty" text="Add something to your cart to check out." cta={{ to: '/shop', label: 'Continue shopping' }} />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          {/* Step 1 — address */}
          <section className="rounded-2xl border border-shop-line bg-white">
            <div className={STEP_HEAD}>
              <span className={STEP_NUM}>1</span>
              <h2 className={STEP_TITLE}>Delivery address</h2>
            </div>

            {addresses === null && <div className="m-5 h-20 animate-pulse rounded-xl bg-shop-canvas" />}

            {addresses && addresses.length > 0 && (
              <ul className="divide-y divide-shop-line" role="radiogroup" aria-label="Delivery address">
                {addresses.map((a) => {
                  const on = a.id === addressId;
                  return (
                    <li key={a.id}>
                      <label className={`flex cursor-pointer gap-3.5 px-5 py-4 transition-colors ${on ? 'bg-[#F4F5FE]' : 'hover:bg-shop-canvas/60'}`}>
                        <input
                          type="radio"
                          name="address"
                          checked={on}
                          onChange={() => setAddressId(a.id)}
                          className="mt-1 h-4 w-4 shrink-0 accent-[#3D4FE0]"
                        />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-shop-ink">{a.fullName}</span>
                            <span className="rounded bg-shop-canvas px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-shop-ink/60">
                              {a.label}
                            </span>
                            <span className="text-sm text-shop-ink/70">{a.phone}</span>
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-shop-ink/70">{addressLine(a)}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {addingAddress ? (
              <div className="border-t border-shop-line p-4">
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
                  className="flex w-full items-center gap-2 border-t border-shop-line px-5 py-3.5 text-sm font-semibold text-shop-accent transition-colors hover:bg-[#F4F5FE]"
                >
                  <Plus className="h-4 w-4" />
                  Add a new address
                </button>
              )
            )}
          </section>

          {/* Step 2 — items */}
          <section className="rounded-2xl border border-shop-line bg-white">
            <div className={STEP_HEAD}>
              <span className={STEP_NUM}>2</span>
              <h2 className={STEP_TITLE}>Review items</h2>
            </div>

            {quoteError && <p className="px-5 py-4 text-sm font-medium text-red-600">{quoteError}</p>}
            {!quote && !quoteError && <div className="m-5 h-24 animate-pulse rounded-xl bg-shop-canvas" />}

            {quote && (
              <ul className="divide-y divide-shop-line">
                {quote.lines.map((l) => {
                  const v = lineVisual(l.productId, l.colour);
                  const key = lineKey({ id: l.productId, colour: l.colour ?? undefined });
                  const cartLine = cart.find((c) => lineKey(c) === key);
                  const qty = cartLine?.qty ?? l.quantity;
                  return (
                    <li key={key} className="flex gap-4 px-5 py-4">
                      <Link to={v.href} className="relative h-20 w-20 shrink-0 rounded-xl bg-shop-canvas">
                        {v.image && (
                          <img src={v.image} alt="" className="absolute inset-0 h-full w-full object-contain p-2 mix-blend-multiply" />
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={v.href} className="block text-sm font-semibold leading-snug text-shop-ink line-clamp-2 hover:opacity-70">
                          {l.name ?? v.title}
                        </Link>
                        {v.colour && <p className="mt-0.5 text-xs text-shop-ink/60">Colour: {v.colour.name}</p>}
                        {l.problem ? (
                          <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600">
                            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                            {problemText(l)}
                          </p>
                        ) : (
                          <p className="mt-1 flex items-baseline gap-2">
                            <span className="font-dm-sans text-base font-semibold tabular-nums text-shop-ink">{rupees(l.unitPaise)}</span>
                            {l.mrpPaise > l.unitPaise && (
                              <span className="text-xs tabular-nums text-shop-ink/40 line-through">{rupees(l.mrpPaise)}</span>
                            )}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center gap-3">
                          {l.maxQuantity > 0 && (
                            <div className="flex items-center overflow-hidden rounded-lg border border-shop-line">
                              <button
                                type="button"
                                aria-label="Fewer"
                                disabled={qty <= 1}
                                onClick={() => setQty(key, qty - 1)}
                                className="flex h-8 w-8 items-center justify-center text-shop-ink hover:bg-shop-canvas disabled:opacity-30"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center font-mono text-xs tabular-nums">{qty}</span>
                              <button
                                type="button"
                                aria-label="More"
                                disabled={qty >= l.maxQuantity}
                                onClick={() => setQty(key, qty + 1)}
                                className="flex h-8 w-8 items-center justify-center text-shop-ink hover:bg-shop-canvas disabled:opacity-30"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          {(l.problem === 'not_enough_stock' || l.problem === 'over_limit') && (
                            <button
                              type="button"
                              onClick={() => setQty(key, l.maxQuantity)}
                              className="text-xs font-semibold text-shop-accent hover:underline"
                            >
                              Change to {l.maxQuantity}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFromCart(key)}
                            className="flex items-center gap-1 text-xs font-semibold text-shop-ink/60 hover:text-red-600"
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
            )}
          </section>

          {/* Step 3 — payment */}
          <section className="rounded-2xl border border-shop-line bg-white">
            <div className={STEP_HEAD}>
              <span className={STEP_NUM}>3</span>
              <h2 className={STEP_TITLE}>Payment</h2>
            </div>
            {quote && (
              <div className="flex flex-col gap-2 p-4" role="radiogroup" aria-label="Payment method">
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
                  title={quote.online.mode === 'test' ? 'Pay online (test mode)' : 'Pay online'}
                  text={
                    quote.online.mode === 'test'
                      ? 'UPI, cards, net banking. Test mode: no real money is taken.'
                      : 'UPI, cards and net banking are coming soon.'
                  }
                  checked={method === 'ONLINE'}
                  disabled={!quote.online.allowed}
                  onSelect={() => setMethod('ONLINE')}
                />
              </div>
            )}
          </section>
        </div>

        {/* Price details + place order */}
        <aside className="overflow-hidden rounded-2xl border border-shop-line bg-white lg:sticky lg:top-6">
          <div className="border-b border-shop-line px-5 py-3">
            <h2 className={STEP_TITLE}>Price details</h2>
          </div>
          {quote ? (
            <dl className="divide-y divide-shop-line text-sm">
              <Row label={`Price (${quote.itemCount} item${quote.itemCount === 1 ? '' : 's'})`} value={rupees(quote.mrpTotalPaise)} />
              {savings > 0 && <Row label="Discount" value={`−${rupees(savings)}`} accent />}
              <Row label="Delivery" value={quote.shippingPaise === 0 ? 'Free' : rupees(quote.shippingPaise)} accent={quote.shippingPaise === 0} />
              <div className="flex items-end justify-between gap-4 bg-shop-canvas px-5 py-4">
                <dt className="text-sm font-semibold text-shop-ink">Total amount</dt>
                <dd className="font-dm-sans text-2xl font-semibold tabular-nums leading-none text-shop-ink" style={{ letterSpacing: '-0.03em' }}>
                  {rupees(quote.totalPaise)}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="m-5 h-28 animate-pulse rounded-xl bg-shop-canvas" />
          )}
          {savings > 0 && (
            <p className="border-t border-shop-line px-5 py-2.5 text-xs font-semibold text-shop-accent">
              You save {rupees(savings)} on this order
            </p>
          )}

          <div className="border-t border-shop-line p-3">
            {placeError && <p className="mb-2 px-1 text-xs font-medium text-red-600" role="alert">{placeError}</p>}
            {quote && !quote.orderable && !placeError && (
              <p className="mb-2 px-1 text-xs font-medium text-red-600">Fix the items marked in red to continue.</p>
            )}
            {!selected && addresses !== null && <p className="mb-2 px-1 text-xs font-medium text-shop-ink/60">Add a delivery address to continue.</p>}
            <button
              type="button"
              onClick={handlePlace}
              disabled={blocked}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-shop-ink text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {placing ? 'Placing order…' : method === 'ONLINE' ? 'Continue to payment' : 'Place order'}
              {!placing && <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />}
            </button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-shop-ink/50">
              <ShieldCheck className="h-3.5 w-3.5" />
              Prices include GST
            </p>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <dt className="text-shop-ink/65">{label}</dt>
      <dd className={`font-mono tabular-nums ${accent ? 'font-semibold text-shop-accent' : 'text-shop-ink'}`}>{value}</dd>
    </div>
  );
}

function PaymentOption({
  icon: Icon,
  title,
  text,
  checked,
  disabled,
  onSelect,
}: {
  icon: typeof Banknote;
  title: string;
  text: string;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex items-start gap-3.5 rounded-xl border-2 px-4 py-3.5 transition-colors ${
        disabled
          ? 'cursor-not-allowed border-shop-line opacity-55'
          : checked
            ? 'cursor-pointer border-shop-accent bg-[#F4F5FE]'
            : 'cursor-pointer border-shop-line hover:border-shop-ink/25'
      }`}
    >
      <input
        type="radio"
        name="payment"
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="mt-1 h-4 w-4 shrink-0 accent-[#3D4FE0]"
      />
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${checked ? 'text-shop-accent' : 'text-shop-ink/60'}`} />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-shop-ink">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-shop-ink/60">{text}</span>
      </span>
    </label>
  );
}

function Notice({ title, text, cta }: { title: string; text: string; cta: { to: string; label: string } }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-shop-ink/20 bg-white px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-shop-canvas">
        <MapPin className="h-6 w-6 text-shop-ink/40" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-shop-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-shop-ink/55">{text}</p>
      <Link
        to={cta.to}
        className="mt-6 flex h-12 items-center gap-2 rounded-xl bg-shop-ink px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
      >
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h1
            className="font-dm-sans font-bold text-shop-ink"
            style={{ fontSize: 'clamp(26px, 2.6vw, 36px)', letterSpacing: '-0.035em', lineHeight: 1.05 }}
          >
            Checkout
          </h1>
          <span className="flex items-center gap-1.5 text-xs font-medium text-shop-ink/55">
            <Lock className="h-3.5 w-3.5" />
            Secure checkout
          </span>
        </div>
        {children}
      </section>
      <Footer />
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
