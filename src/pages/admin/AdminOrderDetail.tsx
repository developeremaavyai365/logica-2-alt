import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, FileText, Loader2, MapPin, Package, Phone, Printer, Truck, Wallet } from 'lucide-react';
import AdminShell from './AdminShell';
import { OrderStatusBadge } from './AdminOrders';
import { ApiError, apiFetch } from '../../lib/api-client';
import { orderDate, paiseText, paymentWords, type OrderStatusName, type OrderStep } from '../../lib/orders-shared';

/* One order, for the warehouse: what to do next (one button per step),
   what was bought, where it goes, how it is paid, its invoice and packing
   slip, and everything that has happened to it. */

interface OrderDetail {
  orderNumber: string;
  createdAt: string;
  status: OrderStatusName;
  statusLabel: string;
  steps: OrderStep[];
  refundDue: boolean;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  courierName: string | null;
  trackingNumber: string | null;
  customer: { name: string; email: string | null; phone: string | null };
  address: { fullName: string; phone: string; line1: string; line2: string | null; landmark: string | null; city: string; state: string; postalCode: string; label: string };
  payment: { method: 'COD' | 'ONLINE'; status: string | null; gateway: string | null; paymentId: string | null; amountPaise: number };
  items: { name: string; sapCode: string; productId: string; colour: string | null; quantity: number; unitPricePaise: number; mrpPaise: number; imageUrl: string }[];
  history: { status: OrderStatusName; label: string; note: string | null; at: string; by: string }[];
  invoice: { number: string; createdAt: string } | null;
}

const CARD = 'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]';
const INPUT =
  'h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#061A40] outline-none transition-colors placeholder:text-[#9CA3AF] hover:border-[#C7D2FE] focus:border-[#3D4FE0]';
const COURIERS = ['Own delivery (1-hour)', 'Delhivery', 'Blue Dart', 'Shiprocket', 'DTDC', 'Ekart', 'Xpressbees', 'India Post'];

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Package; children: React.ReactNode }) {
  return (
    <section className={`${CARD} overflow-hidden`}>
      <h2 className="flex items-center gap-2.5 border-b border-[#EEF0F6] px-5 py-3.5 font-dm-sans text-base font-bold text-[#061A40]">
        <Icon className="h-[18px] w-[18px] text-[#3D4FE0]" />
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The next steps: one button each; a step that needs the courier or a
 *  reason opens a small form first. */
function NextSteps({ order, onMoved }: { order: OrderDetail; onMoved: (o: OrderDetail) => void }) {
  const [open, setOpen] = useState<OrderStep | null>(null);
  const [note, setNote] = useState('');
  const [courier, setCourier] = useState(COURIERS[0]);
  const [otherCourier, setOtherCourier] = useState('');
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function go(step: OrderStep) {
    if ((step.needsTracking || step.needsNote) && open?.to !== step.to) {
      setOpen(step);
      setError('');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const courierName = courier === 'Other' ? otherCourier : courier;
      const next = await apiFetch<OrderDetail>(`/admin/orders/${order.orderNumber}/status`, {
        method: 'POST',
        body: { to: step.to, note: note || undefined, courierName: step.needsTracking ? courierName : undefined, trackingNumber: step.needsTracking ? tracking || undefined : undefined },
      });
      setOpen(null);
      setNote('');
      setTracking('');
      onMoved(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the order. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (order.steps.length === 0) {
    return (
      <section className={`${CARD} flex items-center gap-3 px-5 py-4`}>
        <Check className="h-5 w-5 text-emerald-600" />
        <p className="text-sm text-[#374151]">Nothing more to do for this order.</p>
      </section>
    );
  }

  const main = order.steps.filter((s) => !s.danger);
  const other = order.steps.filter((s) => s.danger);
  return (
    <section className={`${CARD} overflow-hidden border-[#C7D2FE]`}>
      <div className="border-b border-[#EEF0F6] bg-[#F5F7FF] px-5 py-3.5">
        <h2 className="font-dm-sans text-base font-bold text-[#061A40]">Next step</h2>
        {order.refundDue && <p className="text-sm font-medium text-red-600">The customer paid for this order: pay the money back, then mark it refunded.</p>}
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap gap-3">
          {main.map((s) => (
            <div key={s.to} className="flex flex-col gap-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => void go(s)}
                className="flex h-11 items-center gap-2 rounded-xl bg-[#061A40] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#3D4FE0] disabled:opacity-50"
              >
                {busy && open?.to === s.to ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {s.label}
              </button>
              <span className="max-w-[16rem] text-xs text-[#6B7280]">{s.hint}</span>
            </div>
          ))}
          {other.map((s) => (
            <div key={s.to} className="flex flex-col gap-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => void go(s)}
                className="h-11 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {s.label}
              </button>
              <span className="max-w-[16rem] text-xs text-[#6B7280]">{s.hint}</span>
            </div>
          ))}
        </div>

        {open && (
          <div className="flex flex-col gap-3 rounded-2xl bg-[#F5F8FC] p-4">
            <p className="text-sm font-semibold text-[#061A40]">{open.label}</p>
            {open.needsTracking && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-[#061A40]">
                  Who is delivering it
                  <select value={courier} onChange={(e) => setCourier(e.target.value)} className={INPUT}>
                    {[...COURIERS, 'Other'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                {courier === 'Other' && (
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-[#061A40]">
                    Courier name
                    <input value={otherCourier} onChange={(e) => setOtherCourier(e.target.value)} className={INPUT} placeholder="e.g. Professional Couriers" />
                  </label>
                )}
                <label className="flex flex-col gap-1.5 text-sm font-medium text-[#061A40]">
                  Tracking number (if any)
                  <input value={tracking} onChange={(e) => setTracking(e.target.value)} className={INPUT} placeholder="e.g. 1234567890" />
                </label>
              </div>
            )}
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[#061A40]">
              {open.needsNote ? 'Reason (required)' : 'Note (optional)'}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className={`${INPUT} h-auto resize-none py-2.5`}
                placeholder={open.to === 'CANCELLED' ? 'e.g. Out of stock, customer asked to cancel' : open.to === 'REFUNDED' ? 'e.g. Refunded by bank transfer, ref 12345' : ''}
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void go(open)}
                className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50 ${open.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#061A40] hover:bg-[#3D4FE0]'}`}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {open.label}
              </button>
              <button type="button" onClick={() => setOpen(null)} className="h-10 rounded-xl border border-[#E5E7EB] px-4 text-sm font-semibold text-[#6B7280] hover:text-[#061A40]">
                Back
              </button>
            </div>
          </div>
        )}
        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

export default function AdminOrderDetail() {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    apiFetch<OrderDetail>(`/admin/orders/${encodeURIComponent(orderNumber)}`)
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the order.'));
  }, [orderNumber]);
  useEffect(load, [load]);

  const a = order?.address;
  return (
    <AdminShell>
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 pb-24 sm:px-6">
        <Link to="/admin/orders" className="flex w-fit items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#061A40]">
          <ArrowLeft className="h-4 w-4" /> All orders
        </Link>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {!order && !error && (
          <p className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        )}

        {order && a && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
                    {order.orderNumber}
                  </h1>
                  <OrderStatusBadge status={order.status} label={order.statusLabel} />
                </div>
                <p className="mt-1 text-[#6B7280]">
                  Placed {orderDate(order.createdAt)} · {paiseText(order.totalPaise)} · {paymentWords(order.payment.method, order.payment.status)}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/admin/orders/${order.orderNumber}/print/slip`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#061A40] hover:border-[#3D4FE0] hover:text-[#3D4FE0]"
                >
                  <Printer className="h-4 w-4" /> Packing slip
                </a>
                {order.invoice ? (
                  <a
                    href={`/admin/orders/${order.orderNumber}/print/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#061A40] hover:border-[#3D4FE0] hover:text-[#3D4FE0]"
                  >
                    <FileText className="h-4 w-4" /> Invoice
                  </a>
                ) : (
                  <span className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] px-4 text-sm text-[#9CA3AF]" title="The invoice is made when the order is confirmed">
                    <FileText className="h-4 w-4" /> Invoice after confirming
                  </span>
                )}
              </div>
            </div>

            <NextSteps order={order} onMoved={setOrder} />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div className="flex min-w-0 flex-col gap-5">
                <Section title={`Items (${order.items.reduce((n, i) => n + i.quantity, 0)})`} icon={Package}>
                  <ul className="divide-y divide-[#EEF0F6]">
                    {order.items.map((i) => (
                      <li key={`${i.sapCode}-${i.colour}`} className="flex items-center gap-4 px-5 py-4">
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F5F8FC]">
                          {i.imageUrl && <img src={i.imageUrl} alt="" className="absolute inset-0 h-full w-full object-contain p-1.5 mix-blend-multiply" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link to={`/product/${i.productId}${i.colour ? `?colour=${i.colour}` : ''}`} target="_blank" className="text-sm font-semibold text-[#061A40] hover:text-[#3D4FE0]">
                            {i.name}
                          </Link>
                          <p className="text-xs text-[#6B7280]">Item code {i.sapCode}</p>
                        </div>
                        <div className="text-right text-sm tabular-nums">
                          <p className="text-[#6B7280]">
                            {i.quantity} × {paiseText(i.unitPricePaise)}
                          </p>
                          <p className="font-semibold text-[#061A40]">{paiseText(i.unitPricePaise * i.quantity)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <dl className="border-t border-[#EEF0F6] px-5 py-4 text-sm">
                    <div className="flex justify-between py-0.5 text-[#6B7280]">
                      <dt>Items</dt>
                      <dd className="tabular-nums">{paiseText(order.subtotalPaise)}</dd>
                    </div>
                    <div className="flex justify-between py-0.5 text-[#6B7280]">
                      <dt>Delivery</dt>
                      <dd className="tabular-nums">{order.shippingPaise ? paiseText(order.shippingPaise) : 'Free'}</dd>
                    </div>
                    <div className="mt-1 flex justify-between border-t border-[#EEF0F6] pt-2 font-dm-sans text-base font-bold text-[#061A40]">
                      <dt>Total</dt>
                      <dd className="tabular-nums">{paiseText(order.totalPaise)}</dd>
                    </div>
                  </dl>
                </Section>

                <Section title="What has happened" icon={FileText}>
                  <ol className="flex flex-col gap-0 px-5 py-4">
                    {[...order.history].reverse().map((h, i) => (
                      <li key={`${h.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? 'bg-[#3D4FE0]' : 'bg-[#C7CCD8]'}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#061A40]">{h.label}</p>
                          {h.note && <p className="text-sm text-[#374151]">{h.note}</p>}
                          <p className="text-xs text-[#6B7280]">
                            {orderDate(h.at)} · {h.by}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Section>
              </div>

              <div className="flex min-w-0 flex-col gap-5">
                <Section title="Deliver to" icon={MapPin}>
                  <div className="px-5 py-4 text-sm leading-relaxed text-[#374151]">
                    <p className="font-semibold text-[#061A40]">{a.fullName}</p>
                    <p>{a.line1}</p>
                    {a.line2 && <p>{a.line2}</p>}
                    {a.landmark && <p>Near {a.landmark}</p>}
                    <p>
                      {a.city}, {a.state} {a.postalCode}
                    </p>
                    <a href={`tel:${a.phone}`} className="mt-2 flex w-fit items-center gap-1.5 font-semibold text-[#3D4FE0] hover:underline">
                      <Phone className="h-4 w-4" /> {a.phone}
                    </a>
                  </div>
                  <div className="border-t border-[#EEF0F6] px-5 py-3 text-xs text-[#6B7280]">
                    Customer account: {order.customer.name}
                    {order.customer.email ? ` · ${order.customer.email}` : ''}
                    {order.customer.phone ? ` · ${order.customer.phone}` : ''}
                  </div>
                </Section>

                <Section title="Payment" icon={Wallet}>
                  <dl className="px-5 py-4 text-sm">
                    {[
                      ['How', order.payment.method === 'COD' ? 'Cash on delivery' : 'Online'],
                      ['Status', paymentWords(order.payment.method, order.payment.status)],
                      ['Amount', paiseText(order.payment.amountPaise)],
                      ['Payment ID', order.payment.paymentId],
                      ['Invoice', order.invoice?.number ?? null],
                    ]
                      .filter((r): r is [string, string] => !!r[1])
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 py-1">
                          <dt className="text-[#6B7280]">{k}</dt>
                          <dd className="text-right font-medium text-[#061A40]">{v}</dd>
                        </div>
                      ))}
                  </dl>
                  {order.refundDue && <p className="border-t border-[#EEF0F6] bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">Refund due to the customer</p>}
                </Section>

                {(order.courierName || order.trackingNumber) && (
                  <Section title="Shipping" icon={Truck}>
                    <dl className="px-5 py-4 text-sm">
                      <div className="flex justify-between gap-4 py-1">
                        <dt className="text-[#6B7280]">Courier</dt>
                        <dd className="font-medium text-[#061A40]">{order.courierName}</dd>
                      </div>
                      {order.trackingNumber && (
                        <div className="flex justify-between gap-4 py-1">
                          <dt className="text-[#6B7280]">Tracking number</dt>
                          <dd className="font-medium text-[#061A40]">{order.trackingNumber}</dd>
                        </div>
                      )}
                    </dl>
                  </Section>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </AdminShell>
  );
}
