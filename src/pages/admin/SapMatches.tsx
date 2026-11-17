import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Check, Link2, Loader2, X } from 'lucide-react';
import { ApiError, apiFetch } from '../../lib/api-client';

/* New item codes from the SAP sheet, each with the website product it looks
   like (same barcode, model number, or nearly the same name), to confirm
   with one press. A confirmed code is linked as if linked by hand. */

interface Suggestion {
  sapCode: string;
  modelName: string;
  sapName: string;
  mopInPaise: number;
  stock: number;
  product: { slug: string; name: string; imageUrl: string };
  colour: { key: string; name: string } | null;
  reason: string;
}

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

export default function SapMatches({ refreshKey, onLinked }: { refreshKey: string; onLinked: () => void }) {
  const [list, setList] = useState<Suggestion[] | null>(null);
  const [waiting, setWaiting] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(0);

  const load = useCallback(() => {
    apiFetch<{ waiting: number; suggestions: Suggestion[] }>('/admin/sap-import/suggestions')
      .then((data) => {
        setList(data.suggestions);
        setWaiting(data.waiting);
      })
      .catch(() => setList([]));
  }, []);

  useEffect(load, [load, refreshKey]);

  // Opened from the home page's "Check" link: scroll to the list once it is in.
  const shown = list !== null && list.length > 0;
  useEffect(() => {
    if (shown && window.location.hash === '#matches') document.getElementById('matches')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [shown]);

  async function confirm(items: Suggestion[]) {
    setError('');
    let linked = 0;
    for (const s of items) {
      setBusy(s.sapCode);
      try {
        await apiFetch('/admin/sap-import/link', { method: 'POST', body: { sapCode: s.sapCode, productId: s.product.slug, colour: s.colour?.key ?? null } });
        linked++;
        setList((l) => (l ?? []).filter((x) => x.sapCode !== s.sapCode));
        setWaiting((w) => Math.max(0, w - 1));
      } catch (err) {
        setError(`${s.sapCode}: ${err instanceof ApiError ? err.message : 'could not be linked.'}`);
        break;
      }
    }
    setBusy(null);
    if (linked) {
      setDone((d) => d + linked);
      onLinked();
    }
  }

  if (!list || (list.length === 0 && done === 0)) return null;

  const byHand = Math.max(0, waiting - list.length);
  return (
    <section id="matches" className="scroll-mt-6 overflow-hidden rounded-2xl border border-[#C7D2FE] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F6] bg-[#F5F7FF] px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3D4FE0] text-white">
            <Link2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-dm-sans text-lg font-bold text-[#061A40]">New item codes to match</h2>
            <p className="text-sm text-[#6B7280]">These codes from SAP look like products on the website. Confirm each one so customers can order it.</p>
          </div>
        </div>
        {list.length > 1 && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void confirm(list)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#061A40] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3D4FE0] disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Confirm all {list.length}
          </button>
        )}
      </div>

      {done > 0 && (
        <p className="border-b border-[#EEF0F6] bg-emerald-50 px-5 py-2.5 text-sm font-medium text-emerald-800" role="status">
          {done} matched. Their price and stock now come from SAP, and customers can order them.
        </p>
      )}
      {error && (
        <p className="border-b border-[#EEF0F6] bg-red-50 px-5 py-2.5 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <ul className="divide-y divide-[#EEF0F6]">
        {list.map((s) => (
          <li key={s.sapCode} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] md:items-center">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#6B7280]">Item code {s.sapCode}</p>
              <p className="truncate text-sm font-semibold text-[#061A40]" title={s.sapName}>
                {s.modelName}
              </p>
              <p className="text-xs text-[#6B7280]">
                {rupees(s.mopInPaise)} · {s.stock} in stock
              </p>
            </div>
            <ArrowRight className="hidden h-5 w-5 text-[#9CA3AF] md:block" />
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#F5F8FC] to-[#EAEFFA]">
                {s.product.imageUrl && <img src={s.product.imageUrl} alt="" className="absolute inset-0 h-full w-full object-contain p-1.5 mix-blend-multiply" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#061A40]">{s.product.name}</p>
                <p className="text-xs text-[#6B7280]">
                  {s.colour ? `Colour: ${s.colour.name} · ` : ''}
                  <span className="font-medium text-[#3D4FE0]">{s.reason}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void confirm([s])}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-[#061A40] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#3D4FE0] disabled:opacity-50"
              >
                {busy === s.sapCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => setList((l) => (l ?? []).filter((x) => x.sapCode !== s.sapCode))}
                title="Not this product: link it by hand in the list below instead"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-3 text-sm font-semibold text-[#6B7280] transition-colors hover:border-[#C7D2FE] hover:text-[#061A40] disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Skip
              </button>
            </div>
          </li>
        ))}
      </ul>
      {(byHand > 0 || list.length === 0) && (
        <p className="border-t border-[#EEF0F6] px-5 py-3 text-xs text-[#6B7280]">
          {list.length === 0 ? 'All suggested matches are done. ' : ''}
          {byHand > 0 &&
            `${byHand} other new item code${byHand === 1 ? ' needs' : 's need'} linking by hand: use "Link item codes to products" below, or the item code box on a product's page.`}
        </p>
      )}
    </section>
  );
}
