import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Loader2, PackageOpen, Search } from 'lucide-react';
import AdminShell from './AdminShell';
import { ApiError, apiFetch } from '../../lib/api-client';
import { ORDER_TABS, STATUS_STYLE, orderDate, paiseText, paymentWords, type OrderStatusName } from '../../lib/orders-shared';

/* The warehouse's orders: what is waiting at each step, newest first. A
   tab per step, a search, and the orders of any dates as an Excel sheet. */

interface Row {
  orderNumber: string;
  createdAt: string;
  status: OrderStatusName;
  statusLabel: string;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: string | null;
  refundDue: boolean;
  totalPaise: number;
  itemCount: number;
  firstItem: string;
  customer: string;
  place: string;
}

interface Page {
  page: number;
  pageSize: number;
  total: number;
  counts: Record<string, number>;
  orders: Row[];
}

const CARD = 'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]';
const INPUT =
  'h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#061A40] outline-none transition-colors hover:border-[#C7D2FE] focus:border-[#3D4FE0]';
const TH = 'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]';
const TD = 'px-4 py-3 align-middle text-sm text-[#061A40]';

const TABS = [...ORDER_TABS, { key: 'all', label: 'All', statuses: [] }];

export function OrderStatusBadge({ status, label }: { status: OrderStatusName; label: string }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}>{label}</span>;
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'new';
  const page = Number(params.get('page') ?? 1) || 1;
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [from, setFrom] = useState(params.get('from') ?? '');
  const [to, setTo] = useState(params.get('to') ?? '');
  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const set = (patch: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(patch)) {
          if (v) next.set(k, v);
          else next.delete(k);
        }
        if (!('page' in patch)) next.delete('page');
        return next;
      },
      { replace: true },
    );

  // Typing in the search waits a moment before asking the server.
  useEffect(() => {
    const id = setTimeout(() => {
      if (search.trim() !== (params.get('q') ?? '')) set({ q: search.trim() || null });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const query = new URLSearchParams({ tab, page: String(page) });
  for (const k of ['q', 'from', 'to']) if (params.get(k)) query.set(k, params.get(k)!);
  const queryText = query.toString();

  useEffect(() => {
    setData(null);
    apiFetch<Page>(`/admin/orders?${queryText}`)
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the orders.'));
  }, [queryText]);

  async function download() {
    setDownloading(true);
    setError('');
    try {
      const q = new URLSearchParams({ tab });
      for (const k of ['q', 'from', 'to']) if (params.get(k)) q.set(k, params.get(k)!);
      const blob = await apiFetch<Blob>(`/admin/orders/export?${q}`, { as: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Logica orders${from || to ? ` ${[from, to].filter(Boolean).join(' to ')}` : ''}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The sheet could not be downloaded.');
    } finally {
      setDownloading(false);
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const current = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <AdminShell>
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
              Orders
            </h1>
            <p className="mt-1 max-w-2xl text-[#6B7280]">Open an order to confirm it, pack it, ship it and print its invoice.</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-[#6B7280]">
              From
              <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); set({ from: e.target.value || null }); }} className={INPUT} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-[#6B7280]">
              To
              <input type="date" value={to} onChange={(e) => { setTo(e.target.value); set({ to: e.target.value || null }); }} className={INPUT} />
            </label>
            <button
              type="button"
              onClick={() => void download()}
              disabled={downloading}
              className="flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#061A40] transition-colors hover:border-[#3D4FE0] hover:text-[#3D4FE0] disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download Excel
            </button>
          </div>
        </div>

        <div role="tablist" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((t) => {
            const on = t.key === tab;
            const count = data?.counts[t.key];
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => set({ tab: t.key })}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  on ? 'bg-[#061A40] text-white' : 'border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#C7D2FE]'
                }`}
              >
                {t.label}
                {count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      on ? 'bg-white/15' : count > 0 && ['new', 'to-pack', 'to-ship'].includes(t.key) ? 'bg-[#3D4FE0] text-white' : 'bg-[#F1F2F6] text-[#6B7280]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 transition-colors focus-within:border-[#3D4FE0]">
          <Search className="h-4 w-4 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number, customer, phone, product, item code or tracking number"
            className="h-11 w-full bg-transparent text-sm text-[#061A40] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <section className={`${CARD} overflow-hidden`}>
          {data === null ? (
            <p className="flex items-center gap-2 px-5 py-8 text-sm text-[#6B7280]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </p>
          ) : data.orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#3D4FE0]">
                <PackageOpen className="h-6 w-6" />
              </span>
              <p className="text-sm text-[#6B7280]">
                {params.get('q') ? 'No order matches that search.' : tab === 'new' ? 'No new orders. New orders show here as soon as they are placed.' : `No orders in "${current.label}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#FAFBFE]">
                    <th className={TH}>Order</th>
                    <th className={TH}>Customer</th>
                    <th className={TH}>Items</th>
                    <th className={TH}>Total</th>
                    <th className={TH}>Payment</th>
                    <th className={TH}>Status</th>
                    <th className={TH} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F6]">
                  {data.orders.map((o) => (
                    <tr key={o.orderNumber} className="transition-colors hover:bg-[#FAFBFE]">
                      <td className={TD}>
                        <Link to={`/admin/orders/${o.orderNumber}`} className="font-semibold text-[#061A40] hover:text-[#3D4FE0]">
                          {o.orderNumber}
                        </Link>
                        <span className="block text-xs text-[#6B7280]">{orderDate(o.createdAt)}</span>
                      </td>
                      <td className={TD}>
                        {o.customer}
                        <span className="block text-xs text-[#6B7280]">{o.place}</span>
                      </td>
                      <td className={`${TD} max-w-[18rem]`}>
                        <span className="line-clamp-1">{o.firstItem}</span>
                        <span className="block text-xs text-[#6B7280]">
                          {o.itemCount} item{o.itemCount === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className={`${TD} font-semibold tabular-nums`}>{paiseText(o.totalPaise)}</td>
                      <td className={TD}>
                        <span className="text-sm">{paymentWords(o.paymentMethod, o.paymentStatus)}</span>
                        {o.refundDue && <span className="mt-0.5 block text-xs font-semibold text-red-600">Refund due</span>}
                      </td>
                      <td className={TD}>
                        <OrderStatusBadge status={o.status} label={o.statusLabel} />
                      </td>
                      <td className={`${TD} text-right`}>
                        <Link
                          to={`/admin/orders/${o.orderNumber}`}
                          className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#E5E7EB] px-3 text-sm font-semibold text-[#061A40] hover:border-[#3D4FE0] hover:text-[#3D4FE0]"
                        >
                          Open <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data && pages > 1 && (
            <div className="flex items-center justify-between border-t border-[#EEF0F6] px-5 py-3 text-sm text-[#6B7280]">
              <span>
                Page {data.page} of {pages} · {data.total} orders
              </span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => set({ page: String(page - 1) })} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] disabled:opacity-40" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" disabled={page >= pages} onClick={() => set({ page: String(page + 1) })} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] disabled:opacity-40" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </AdminShell>
  );
}
