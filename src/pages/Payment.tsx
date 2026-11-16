import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Clock, CreditCard, FlaskConical, Landmark, Lock, Package, ShieldCheck, Smartphone, Wallet, XCircle } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { ACCOUNT_CARD } from '../components/account/AccountShell';
import { TitleGlow } from '../components/auth/AuthShell';
import CheckoutShell, { NAVY_BUTTON, PriceDetails, ProductThumb, SectionCard, TrustList } from '../components/checkout/CheckoutShell';
import { messageFrom } from '../auth-store';
import { getOrder, rupees, testPayment, useCheckoutConfig, type OrderView } from '../lib/checkout';
import { lineVisual } from '../lib/order-lines';
import { addressLine } from '../lib/addresses';

/* The payment step of an online order.

   The shopper picks how to pay here; the details themselves (card number,
   UPI PIN, bank login) are entered on the payment partner's secure page,
   never on this site. Until a partner is connected, the backend runs in
   test mode and "Pay" settles the order through its test endpoint: no
   money moves. */

type Method = 'upi' | 'card' | 'netbanking' | 'wallet';

const METHODS: {
  key: Method;
  icon: typeof CreditCard;
  title: string;
  hint: string;
  steps: string[];
  extra?: string[];
}[] = [
  {
    key: 'upi',
    icon: Smartphone,
    title: 'UPI',
    hint: 'Pay by any UPI app',
    steps: ['Scan the QR code, or enter your UPI ID', 'Approve the payment in your UPI app', 'You come back here once it is paid'],
    extra: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Any UPI app'],
  },
  {
    key: 'card',
    icon: CreditCard,
    title: 'Credit / Debit card',
    hint: 'Visa, Mastercard, RuPay',
    steps: [
      'Enter your card details on the secure payment page',
      'Confirm with the one-time password from your bank',
      'You come back here once it is paid',
    ],
  },
  {
    key: 'netbanking',
    icon: Landmark,
    title: 'Net banking',
    hint: 'All major Indian banks',
    steps: ['Choose your bank on the secure payment page', "Sign in on your bank's own page and approve", 'You come back here once it is paid'],
  },
  {
    key: 'wallet',
    icon: Wallet,
    title: 'Wallets',
    hint: 'Pay from a mobile wallet',
    steps: ['Choose your wallet on the secure payment page', 'Approve the payment in the wallet', 'You come back here once it is paid'],
  },
];

const TITLE = (
  <>
    Complete <TitleGlow>payment</TitleGlow>
  </>
);

/** Seconds left until `iso`, ticking every second. Null without a deadline. */
function useSecondsLeft(iso: string | null): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!iso) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [iso]);
  if (!iso) return null;
  return Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000));
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function PaymentPage() {
  const { orderNumber = '' } = useParams();
  const navigate = useNavigate();
  const config = useCheckoutConfig();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [loadError, setLoadError] = useState('');
  const [method, setMethod] = useState<Method>('upi');
  const [busy, setBusy] = useState<'success' | 'failure' | null>(null);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrder(orderNumber)
      .then((o) => {
        // Already paid, or cancelled: the order page says what happened.
        if (o.status !== 'PAYMENT_PENDING') navigate(`/orders/${o.orderNumber}`, { replace: true });
        else setOrder(o);
      })
      .catch((err) => setLoadError(messageFrom(err, 'Could not find this order.')));
  }, [orderNumber, navigate]);

  const secondsLeft = useSecondsLeft(order?.payBy ?? null);
  const expired = secondsLeft === 0;
  const testMode = config?.online.mode === 'test';
  const unavailable = config !== null && config.online.mode === 'off';
  const chosen = METHODS.find((m) => m.key === method)!;

  async function pay(outcome: 'success' | 'failure') {
    setBusy(outcome);
    setError('');
    setFailed(false);
    try {
      const o = await testPayment(orderNumber, outcome);
      if (outcome === 'success') {
        navigate(`/orders/${o.orderNumber}?placed=1`, { replace: true });
        return;
      }
      setFailed(true);
      setOrder(o);
    } catch (err) {
      setError(messageFrom(err, 'The payment did not go through. No money was taken.'));
    } finally {
      setBusy(null);
    }
  }

  if (loadError) {
    return (
      <CheckoutShell eyebrow="Payment" title={TITLE} step={2}>
        <div className={`${ACCOUNT_CARD} flex flex-col items-center px-6 py-16 text-center`}>
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
            <XCircle className="h-9 w-9" />
          </span>
          <h2 className="mt-5 font-dm-sans text-2xl font-bold text-[#061A40]">{loadError}</h2>
          <Link to="/orders" className={`${NAVY_BUTTON} mt-7 w-auto px-7`}>
            Go to My orders
            <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
          </Link>
        </div>
      </CheckoutShell>
    );
  }

  const itemCount = order ? order.items.reduce((n, i) => n + i.quantity, 0) : 0;
  const amount = order ? rupees(order.totalPaise) : '';
  const canPay = !!order && !busy && !expired && !unavailable;
  const urgent = secondsLeft !== null && secondsLeft > 0 && secondsLeft < 120;

  return (
    <CheckoutShell
      eyebrow="Payment"
      title={TITLE}
      step={2}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>
            Order {orderNumber}
            {order && ` · ${amount}`}
          </span>
          {secondsLeft !== null && secondsLeft > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
                urgent ? 'bg-red-500/20 text-red-100' : 'bg-white/10 text-[#C7D4FF]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Pay within {clock(secondsLeft)}
            </span>
          )}
        </span>
      }
    >
      {testMode && (
        <p className="mb-4 flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-900">
          <FlaskConical className="h-4 w-4 shrink-0" />
          Test mode: no real money is taken. Pay settles the order straight away.
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        {/* Method list + the chosen method */}
        <section className={`${ACCOUNT_CARD} overflow-hidden md:grid md:grid-cols-[17rem_minmax(0,1fr)]`}>
          <div className="border-b border-[#EEF0F6] bg-[#FAFBFE] md:border-b-0 md:border-r">
            <div className="flex items-center gap-2.5 px-5 pt-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1F3FE] text-[#3D4FE0]">
                <Wallet className="h-4 w-4" />
              </span>
              <h2 className="font-dm-sans text-[17px] font-bold text-[#061A40]">Pay with</h2>
            </div>
            <ul className="grid grid-cols-2 gap-2 p-4 md:grid-cols-1" role="radiogroup" aria-label="Payment method">
              {METHODS.map((m) => {
                const on = m.key === method;
                return (
                  <li key={m.key}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setMethod(m.key)}
                      className={`flex h-full w-full items-start gap-3 rounded-2xl border-2 px-3.5 py-3 text-left transition-colors ${
                        on ? 'border-[#3D4FE0] bg-white shadow-[0_10px_24px_-16px_rgba(61,79,224,0.6)]' : 'border-transparent hover:border-[#C7D2FE] hover:bg-white'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          on ? 'bg-[#3D4FE0] text-white' : 'bg-white text-[#061A40]/60 ring-1 ring-[#E7EAF3]'
                        }`}
                      >
                        <m.icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-snug text-[#061A40]">{m.title}</span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-[#6B7280]">{m.hint}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex-1 p-5 sm:p-7">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3D4FE0]">How it works</span>
              <h3 className="mt-1 font-dm-sans text-2xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.02em' }}>
                {chosen.title}
              </h3>

              <ol className="mt-5 flex flex-col gap-3.5">
                {chosen.steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 text-sm text-[#061A40]/80">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1F3FE] text-[11px] font-bold text-[#3D4FE0]">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>

              {chosen.extra && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {chosen.extra.map((x) => (
                    <li key={x} className="rounded-full bg-[#F5F8FC] px-3 py-1.5 text-xs font-medium text-[#061A40]/75">
                      {x}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-6 flex items-start gap-2.5 rounded-2xl bg-[#F5F8FC] px-4 py-3.5 text-xs leading-relaxed text-[#6B7280]">
                <ShieldCheck className="mt-px h-4 w-4 shrink-0 text-[#3D4FE0]" />
                Your card, UPI and bank details are entered only on the payment partner's secure page. Logica never sees or stores
                them.
              </p>
            </div>

            <div className="border-t border-[#EEF0F6] bg-[#FAFBFE] p-5 sm:px-7">
              {failed && (
                <p className="mb-3 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  Payment failed and no money was taken. Try again, or pick another way to pay.
                </p>
              )}
              {error && (
                <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              )}
              {expired && (
                <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">
                  Time to pay has run out, so this order will be cancelled. You can order again from your cart.
                </p>
              )}
              {unavailable && (
                <p className="mb-3 rounded-xl bg-[#F1F3FE] px-4 py-3 text-sm font-medium text-[#061A40]">
                  Online payment is not available right now. Please try again later.
                </p>
              )}

              <button type="button" disabled={!canPay} onClick={() => pay('success')} className={NAVY_BUTTON}>
                <Lock className="h-4 w-4" />
                {busy === 'success' ? 'Processing payment…' : order ? `Pay ${amount}` : 'Loading…'}
              </button>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold">
                {testMode && (
                  <button
                    type="button"
                    disabled={!canPay}
                    onClick={() => pay('failure')}
                    className="text-[#061A40]/55 transition-colors hover:text-[#061A40] disabled:opacity-40"
                  >
                    {busy === 'failure' ? 'Failing…' : 'Simulate a failed payment'}
                  </button>
                )}
                <Link to="/orders" className="text-[#061A40]/55 transition-colors hover:text-[#3D4FE0]">
                  Pay later from My orders
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Order summary */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          {order ? (
            <>
              <PriceDetails
                itemCount={itemCount}
                mrpTotalPaise={order.mrpTotalPaise}
                subtotalPaise={order.subtotalPaise}
                shippingPaise={order.shippingPaise}
                totalPaise={order.totalPaise}
                totalLabel="Amount to pay"
              />

              <SectionCard icon={Package} title="Your order">
                <ul className="divide-y divide-[#EEF0F6] border-t border-[#EEF0F6]">
                  {order.items.map((item) => {
                    const v = lineVisual(item.productId, item.colour);
                    return (
                      <li key={`${item.productId}|${item.colour ?? ''}`} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                        <ProductThumb src={v.image} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-snug text-[#061A40] line-clamp-2">{item.name}</span>
                          <span className="mt-0.5 block text-xs text-[#6B7280]">
                            Qty {item.quantity}
                            {v.colour ? ` · ${v.colour.name}` : ''}
                          </span>
                        </span>
                        <span className="font-dm-sans text-sm font-bold tabular-nums text-[#061A40]">{rupees(item.unitPricePaise * item.quantity)}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-[#EEF0F6] bg-[#FAFBFE] px-5 py-4 sm:px-6">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#061A40]/45">Delivering to</span>
                  <p className="mt-1 text-sm font-semibold text-[#061A40]">{order.address.fullName}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">{addressLine(order.address)}</p>
                </div>
              </SectionCard>
            </>
          ) : (
            <div className={`${ACCOUNT_CARD} h-72 animate-pulse`} />
          )}
          <TrustList first={{ title: 'Secure payment', text: 'Handled by the payment partner, never stored by Logica.' }} />
        </aside>
      </div>
    </CheckoutShell>
  );
}

export default function Payment() {
  return (
    <ProtectedRoute>
      <PaymentPage />
    </ProtectedRoute>
  );
}
