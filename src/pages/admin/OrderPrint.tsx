import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Printer } from 'lucide-react';
import AdminShell from './AdminShell';
import { ApiError, apiFetch } from '../../lib/api-client';
import { orderDate, paiseText, paymentWords, rupeesInWords, type InvoiceTotals } from '../../lib/orders-shared';

/* The order's papers, on A4: the GST tax invoice, and the packing slip that
   goes in the box. Only the paper prints; the admin header and the buttons
   stay on screen. */

interface Invoice {
  number: string;
  date: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: string | null;
  seller: { name: string; gstin: string; address: string; state: string };
  buyer: { name: string; phone: string; address: string[]; state: string };
  totals: InvoiceTotals;
}

interface Slip {
  orderNumber: string;
  createdAt: string;
  totalPaise: number;
  courierName: string | null;
  trackingNumber: string | null;
  address: { fullName: string; phone: string; line1: string; line2: string | null; landmark: string | null; city: string; state: string; postalCode: string };
  payment: { method: 'COD' | 'ONLINE'; status: string | null };
  items: { name: string; sapCode: string; quantity: number }[];
  invoice: { number: string } | null;
}

const money = (paise: number) => (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const TH = 'border border-black/20 px-2 py-1.5 text-left font-semibold';
const TD = 'border border-black/20 px-2 py-1.5 align-top';

function InvoicePaper({ inv }: { inv: Invoice }) {
  const t = inv.totals;
  return (
    <div className="text-[12px] leading-snug text-black">
      <div className="flex items-start justify-between gap-6 border-b-2 border-black pb-3">
        <div>
          <p className="text-lg font-bold">{inv.seller.name}</p>
          <p className="max-w-xs">{inv.seller.address}</p>
          <p>
            GSTIN: <span className="font-semibold">{inv.seller.gstin || 'not set'}</span>
            {inv.seller.state ? ` · State: ${inv.seller.state}` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold uppercase tracking-wide">Tax invoice</p>
          <p>
            Invoice no. <span className="font-semibold">{inv.number}</span>
          </p>
          <p>Invoice date: {orderDate(inv.date, false)}</p>
          <p>
            Order no. {inv.orderNumber} · {orderDate(inv.orderDate, false)}
          </p>
          <p>Payment: {paymentWords(inv.paymentMethod, inv.paymentStatus)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-black/30 py-3">
        <div>
          <p className="font-semibold uppercase">Bill to / Ship to</p>
          <p className="font-semibold">{inv.buyer.name}</p>
          {inv.buyer.address.map((l) => (
            <p key={l}>{l}</p>
          ))}
          <p>Phone: {inv.buyer.phone}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold uppercase">Place of supply</p>
          <p>{inv.buyer.state}</p>
          <p className="mt-1">{t.intraState ? 'Within the state: CGST + SGST' : 'Outside the state: IGST'}</p>
        </div>
      </div>

      <table className="mt-3 w-full border-collapse">
        <thead>
          <tr className="bg-black/5">
            <th className={TH}>#</th>
            <th className={TH}>Description</th>
            <th className={TH}>HSN/SAC</th>
            <th className={`${TH} text-right`}>Qty</th>
            <th className={`${TH} text-right`}>Rate (incl. GST)</th>
            <th className={`${TH} text-right`}>Taxable value</th>
            <th className={`${TH} text-right`}>GST %</th>
            {t.intraState ? (
              <>
                <th className={`${TH} text-right`}>CGST</th>
                <th className={`${TH} text-right`}>SGST</th>
              </>
            ) : (
              <th className={`${TH} text-right`}>IGST</th>
            )}
            <th className={`${TH} text-right`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {t.lines.map((l, i) => (
            <tr key={`${l.sapCode}-${i}`}>
              <td className={TD}>{i + 1}</td>
              <td className={TD}>
                {l.name}
                {l.sapCode && <span className="block text-[10px] text-black/60">Item code {l.sapCode}</span>}
              </td>
              <td className={TD}>{l.hsnCode || '—'}</td>
              <td className={`${TD} text-right`}>{l.quantity}</td>
              <td className={`${TD} text-right`}>{money(l.unitPricePaise)}</td>
              <td className={`${TD} text-right`}>{money(l.taxablePaise)}</td>
              <td className={`${TD} text-right`}>{l.gstRatePercent}%</td>
              {t.intraState ? (
                <>
                  <td className={`${TD} text-right`}>{money(l.cgstPaise)}</td>
                  <td className={`${TD} text-right`}>{money(l.sgstPaise)}</td>
                </>
              ) : (
                <td className={`${TD} text-right`}>{money(l.igstPaise)}</td>
              )}
              <td className={`${TD} text-right font-semibold`}>{money(l.totalPaise)}</td>
            </tr>
          ))}
          <tr className="bg-black/5 font-semibold">
            <td className={TD} colSpan={5}>
              Total
            </td>
            <td className={`${TD} text-right`}>{money(t.taxablePaise)}</td>
            <td className={TD} />
            {t.intraState ? (
              <>
                <td className={`${TD} text-right`}>{money(t.cgstPaise)}</td>
                <td className={`${TD} text-right`}>{money(t.sgstPaise)}</td>
              </>
            ) : (
              <td className={`${TD} text-right`}>{money(t.igstPaise)}</td>
            )}
            <td className={`${TD} text-right`}>₹{money(t.totalPaise)}</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-3">
        Amount in words: <span className="font-semibold">{rupeesInWords(t.totalPaise)}</span>
      </p>
      <p className="mt-1 text-black/70">Prices include GST. Whether tax is payable on reverse charge: No.</p>

      <div className="mt-10 flex items-end justify-between">
        <p className="text-[10px] text-black/60">This is a computer-generated invoice.</p>
        <div className="text-right">
          <p>For {inv.seller.name}</p>
          <p className="mt-10 border-t border-black/50 pt-1">Authorised signatory</p>
        </div>
      </div>
    </div>
  );
}

function SlipPaper({ slip }: { slip: Slip }) {
  const a = slip.address;
  const cod = slip.payment.method === 'COD' && slip.payment.status !== 'CAPTURED';
  return (
    <div className="text-[13px] leading-snug text-black">
      <div className="flex items-start justify-between gap-6 border-b-2 border-black pb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-black/60">Packing slip</p>
          <p className="text-2xl font-bold">{slip.orderNumber}</p>
          <p>Ordered {orderDate(slip.createdAt)}</p>
          {slip.invoice && <p>Invoice {slip.invoice.number}</p>}
        </div>
        <div className={`rounded-lg border-2 px-4 py-2 text-right ${cod ? 'border-black' : 'border-black/30'}`}>
          <p className="text-xs uppercase tracking-wide">{cod ? 'Collect cash' : 'Paid'}</p>
          <p className="text-2xl font-bold">{cod ? paiseText(slip.totalPaise) : 'Nothing to collect'}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border-2 border-black p-4">
        <p className="text-xs uppercase tracking-wide text-black/60">Deliver to</p>
        <p className="mt-1 text-xl font-bold">{a.fullName}</p>
        <p className="text-base">{a.line1}</p>
        {a.line2 && <p className="text-base">{a.line2}</p>}
        {a.landmark && <p className="text-base">Near {a.landmark}</p>}
        <p className="text-base font-semibold">
          {a.city}, {a.state} {a.postalCode}
        </p>
        <p className="mt-1 text-base">Phone: {a.phone}</p>
      </div>

      {(slip.courierName || slip.trackingNumber) && (
        <p className="mt-3">
          Courier: <span className="font-semibold">{slip.courierName}</span>
          {slip.trackingNumber ? ` · Tracking ${slip.trackingNumber}` : ''}
        </p>
      )}

      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="bg-black/5">
            <th className={`${TH} w-10`}>✓</th>
            <th className={TH}>Item</th>
            <th className={TH}>Item code</th>
            <th className={`${TH} text-right`}>Qty</th>
          </tr>
        </thead>
        <tbody>
          {slip.items.map((i, n) => (
            <tr key={`${i.sapCode}-${n}`}>
              <td className={TD}>
                <span className="inline-block h-4 w-4 border border-black" />
              </td>
              <td className={TD}>{i.name}</td>
              <td className={TD}>{i.sapCode}</td>
              <td className={`${TD} text-right text-base font-bold`}>{i.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 grid grid-cols-2 gap-10 text-xs">
        <p className="border-t border-black/50 pt-1">Packed by</p>
        <p className="border-t border-black/50 pt-1">Checked by</p>
      </div>
    </div>
  );
}

export default function OrderPrint() {
  const { orderNumber = '', doc = 'invoice' } = useParams<{ orderNumber: string; doc: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [slip, setSlip] = useState<Slip | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const path = doc === 'slip' ? `/admin/orders/${encodeURIComponent(orderNumber)}` : `/admin/orders/${encodeURIComponent(orderNumber)}/invoice`;
    apiFetch<Invoice | Slip>(path)
      .then((d) => (doc === 'slip' ? setSlip(d as Slip) : setInvoice(d as Invoice)))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load it.'));
  }, [orderNumber, doc]);

  useEffect(() => {
    const title = document.title;
    document.title = doc === 'slip' ? `Packing slip ${orderNumber}` : `Invoice ${invoice?.number ?? orderNumber}`;
    return () => {
      document.title = title;
    };
  }, [doc, orderNumber, invoice]);

  const ready = !!(invoice || slip);
  return (
    <AdminShell>
      <main className="mx-auto max-w-[210mm] px-4 py-6 print:max-w-none print:p-0">
        <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
          <p className="text-sm text-[#6B7280]">{doc === 'slip' ? 'Packing slip' : 'GST invoice'} · A4</p>
          <button
            type="button"
            disabled={!ready}
            onClick={() => window.print()}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#061A40] px-4 text-sm font-semibold text-white hover:bg-[#3D4FE0] disabled:opacity-50"
          >
            <Printer className="h-4 w-4" /> Print or save as PDF
          </button>
        </div>
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden" role="alert">
            {error}
          </p>
        )}
        {!ready && !error && (
          <p className="flex items-center gap-2 text-sm text-[#6B7280] print:hidden">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        )}
        {ready && (
          <div className="bg-white p-[12mm] shadow-[0_10px_30px_-12px_rgba(6,26,64,0.2)] print:p-0 print:shadow-none">
            {invoice && <InvoicePaper inv={invoice} />}
            {slip && <SlipPaper slip={slip} />}
          </div>
        )}
      </main>
    </AdminShell>
  );
}
