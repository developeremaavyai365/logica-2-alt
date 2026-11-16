import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, MapPin, Phone, Wallet, XCircle } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import AccountShell from '../components/account/AccountShell';
import { messageFrom } from '../auth-store';
import { lineKey, useShopStore } from '../store';
import { getOrder, rupees, type OrderView } from '../lib/checkout';
import { lineVisual } from '../lib/order-lines';
import { addressLine } from '../lib/addresses';

/** The steps a delivered order goes through, in order. */
const STEPS = [
  { status: 'PLACED', label: 'Ordered' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
];
const STEP_INDEX: Record<string, number> = { PROCESSING: 1 };
STEPS.forEach((s, i) => (STEP_INDEX[s.status] = i));

const PAYMENT_TEXT: Record<string, string> = {
  CAPTURED: 'Paid',
  PENDING: 'Not paid yet',
  FAILED: 'Payment failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partly refunded',
};

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

function OrderPage() {
  const { orderNumber = '' } = useParams();
  const [params] = useSearchParams();
  const justPlaced = params.get('placed') === '1';
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState('');
  const { cart, removeFromCart } = useShopStore();
  const cleared = useRef(false);

  useEffect(() => {
    getOrder(orderNumber)
      .then(setOrder)
      .catch((err) => setError(messageFrom(err, 'Could not load this order.')));
  }, [orderNumber]);

  // Once an order is really placed, what was bought leaves the cart.
  useEffect(() => {
    if (!order || cleared.current || order.status === 'PAYMENT_PENDING' || order.status === 'CANCELLED') return;
    cleared.current = true;
    for (const item of order.items) {
      const key = lineKey({ id: item.productId, colour: item.colour ?? undefined });
      if (cart.some((l) => lineKey(l) === key)) removeFromCart(key);
    }
  }, [order, cart, removeFromCart]);

  if (error) {
    return (
      <AccountShell active="orders" title="Order">
        <div className="rounded-2xl border border-red-200 bg-white px-5 py-4 text-sm font-medium text-red-600">{error}</div>
      </AccountShell>
    );
  }
  if (!order) {
    return (
      <AccountShell active="orders" title="Order">
        <div className="h-48 animate-pulse rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)]" />
      </AccountShell>
    );
  }

  const cancelled = order.status === 'CANCELLED';
  const pending = order.status === 'PAYMENT_PENDING';
  const stepAt = STEP_INDEX[order.status] ?? 0;
  const savings = order.mrpTotalPaise - order.subtotalPaise;
  const lastNote = order.history[order.history.length - 1]?.note;

  return (
    <AccountShell active="orders" eyebrow="Order details" title={order.orderNumber}>
      <div className="flex flex-col gap-4">
        {justPlaced && !pending && !cancelled && (
          <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <p className="text-base font-semibold text-emerald-900">Thank you! Your order has been placed.</p>
              <p className="mt-0.5 text-sm text-emerald-800/80">
                {order.paymentMethod === 'COD'
                  ? `Please keep ${rupees(order.totalPaise)} ready to pay when it arrives.`
                  : 'Your payment has been received.'}{' '}
                We will let you know when it ships.
              </p>
            </div>
          </div>
        )}

        {pending && (
          <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <Clock className="h-5 w-5 shrink-0 text-amber-700" />
            <p className="min-w-0 flex-1 text-sm text-amber-900">
              <span className="font-semibold">Waiting for payment.</span>{' '}
              {order.payBy && `Pay by ${new Date(order.payBy).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} or the order is cancelled.`}
            </p>
            <Link
              to={`/checkout/pay/${order.orderNumber}`}
              className="rounded-xl bg-[#061A40] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-shop-accent"
            >
              Complete payment
            </Link>
          </div>
        )}

        {/* Where the order is */}
        <section className="rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)] px-5 py-5">
          <p className="text-xs text-shop-ink/55">Placed on {when(order.createdAt)}</p>
          {cancelled ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-600">
              <XCircle className="h-5 w-5" />
              Cancelled
              {lastNote && <span className="font-normal text-shop-ink/60">· {lastNote}</span>}
            </p>
          ) : pending ? null : (
            <ol className="mt-4 grid grid-cols-5 gap-1" aria-label="Order progress">
              {STEPS.map((s, i) => {
                const done = i <= stepAt;
                return (
                  <li key={s.status} className="flex flex-col gap-2">
                    <span className={`h-1.5 rounded-full ${done ? 'bg-shop-accent' : 'bg-shop-line'}`} />
                    <span className={`text-[11px] font-semibold leading-tight sm:text-xs ${done ? 'text-shop-ink' : 'text-shop-ink/40'}`}>
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Items */}
        <section className="overflow-hidden rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)]">
          <ul className="divide-y divide-[#EEF0F6]">
            {order.items.map((item) => {
              const v = lineVisual(item.productId, item.colour);
              return (
                <li key={`${item.productId}|${item.colour}`} className="flex gap-4 px-5 py-4">
                  <Link to={v.href} className="relative h-20 w-20 shrink-0 rounded-xl bg-shop-canvas">
                    {v.image && <img src={v.image} alt="" className="absolute inset-0 h-full w-full object-contain p-2 mix-blend-multiply" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={v.href} className="block text-sm font-semibold leading-snug text-shop-ink line-clamp-2 hover:opacity-70">
                      {item.name}
                    </Link>
                    {v.colour && <p className="mt-0.5 text-xs text-shop-ink/60">Colour: {v.colour.name}</p>}
                    <p className="mt-1 text-xs text-shop-ink/60">Qty: {item.quantity}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-dm-sans text-base font-semibold tabular-nums text-shop-ink">{rupees(item.unitPricePaise * item.quantity)}</p>
                    {item.mrpPaise > item.unitPricePaise && (
                      <p className="text-xs tabular-nums text-shop-ink/40 line-through">{rupees(item.mrpPaise * item.quantity)}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Delivery address */}
          <section className="rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)] px-5 py-4">
            <h2 className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink/60">
              <MapPin className="h-3.5 w-3.5" />
              Delivery address
            </h2>
            <p className="mt-2.5 text-sm font-semibold text-shop-ink">{order.address.fullName}</p>
            <p className="mt-1 text-sm leading-relaxed text-shop-ink/70">{addressLine(order.address)}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-shop-ink/70">
              <Phone className="h-3.5 w-3.5" />
              {order.address.phone}
            </p>
          </section>

          {/* Payment and price */}
          <section className="rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)] px-5 py-4">
            <h2 className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink/60">
              <Wallet className="h-3.5 w-3.5" />
              Payment
            </h2>
            <p className="mt-2.5 text-sm font-semibold text-shop-ink">
              {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'}
              {order.paymentMethod === 'ONLINE' && order.paymentStatus && (
                <span className="ml-2 font-normal text-shop-ink/60">· {PAYMENT_TEXT[order.paymentStatus] ?? order.paymentStatus}</span>
              )}
            </p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-shop-ink/60">Price</dt>
                <dd className="tabular-nums">{rupees(order.mrpTotalPaise)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-shop-ink/60">Discount</dt>
                  <dd className="tabular-nums text-shop-accent">−{rupees(savings)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-shop-ink/60">Delivery</dt>
                <dd className="tabular-nums">{order.shippingPaise === 0 ? 'Free' : rupees(order.shippingPaise)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#EEF0F6] pt-2 font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{rupees(order.totalPaise)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-shop-ink/50">
          <AlertCircle className="h-3.5 w-3.5" />
          Need help with this order? Call +91 7003999192 and quote {order.orderNumber}.
        </p>
      </div>
    </AccountShell>
  );
}

export default function OrderDetails() {
  return (
    <ProtectedRoute>
      <OrderPage />
    </ProtectedRoute>
  );
}
