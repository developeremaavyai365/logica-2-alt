import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CreditCard, Loader2, Pencil, Plus, RefreshCw, ShieldPlus, Trash2, WalletCards, X, type LucideIcon } from 'lucide-react';
import AdminShell from './AdminShell';
import { HelpTip } from './admin-ui';
import { ApiError, apiFetch } from '../../lib/api-client';
import { categories, products } from '../../data';
import {
  EMI_MONTH_CHOICES,
  bankSaving,
  emiMonthly,
  offerHeadline,
  offerProblem,
  planPrice,
  rupeesText,
  type Offer,
  type OfferInput,
  type OfferKind,
} from '../../lib/offers';

/* The offers shown on product pages: bank discounts, EMI plans, exchange
   offers and protection plans. Each can be for every product or only some
   categories and brands, above a price, until a date. */

const CARD = 'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]';
const INPUT =
  'h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#061A40] outline-none transition-colors placeholder:text-[#9CA3AF] hover:border-[#C7D2FE] focus:border-[#3D4FE0]';
const LABEL = 'flex items-center text-sm font-semibold text-[#061A40]';

const KINDS: { kind: OfferKind; label: string; icon: LucideIcon; text: string; add: string }[] = [
  { kind: 'BANK', label: 'Bank offers', icon: CreditCard, text: 'Money off when paying with a bank card, e.g. ₹3,000 off with HDFC Bank credit cards.', add: 'Add a bank offer' },
  { kind: 'EMI', label: 'EMI', icon: WalletCards, text: 'Paying in monthly instalments. The page works out the monthly amount for each product.', add: 'Add an EMI plan' },
  { kind: 'EXCHANGE', label: 'Exchange', icon: RefreshCw, text: 'Money off for handing in an old device.', add: 'Add an exchange offer' },
  { kind: 'PROTECTION', label: 'Protection plans', icon: ShieldPlus, text: 'Damage protection or extended warranty, sold with the product.', add: 'Add a protection plan' },
];

const PAYMENT_TYPES = ['Credit card', 'Debit card', 'Credit & debit cards', 'Credit card EMI', 'UPI', 'Net banking'];
const COVER_CHOICES = [6, 12, 24, 36];

/** A new offer of a kind, with nothing filled in. */
function blank(kind: OfferKind): OfferInput {
  return {
    kind,
    provider: '',
    paymentType: kind === 'BANK' || kind === 'EMI' ? 'Credit card' : '',
    title: '',
    terms: '',
    flatOffInPaise: null,
    percentOff: null,
    maxOffInPaise: null,
    minPriceInPaise: null,
    emiMonths: kind === 'EMI' ? [3, 6] : [],
    interestPercent: kind === 'EMI' ? 0 : null,
    planPriceInPaise: null,
    planPricePercent: null,
    coverMonths: kind === 'PROTECTION' ? 12 : null,
    categories: [],
    brands: [],
    active: true,
    endsAt: null,
  };
}

/** Rupees typed by the admin, to paise; empty is null. */
const toPaise = (text: string) => (text.trim() === '' ? null : Math.round(Number(text) * 100));
const fromPaise = (paise: number | null) => (paise === null ? '' : String(paise / 100));
const toNumber = (text: string) => (text.trim() === '' ? null : Number(text));

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={LABEL}>
        {label}
        {help && <HelpTip text={help} />}
      </span>
      {children}
    </label>
  );
}

/** A rupee amount box with the ₹ in front. */
function Rupees({ value, onChange, placeholder }: { value: number | null; onChange: (paise: number | null) => void; placeholder?: string }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-colors focus-within:border-[#3D4FE0] hover:border-[#C7D2FE]">
      <span className="flex items-center bg-[#F5F8FC] px-3 text-sm font-semibold text-[#6B7280]">₹</span>
      <input
        inputMode="decimal"
        value={fromPaise(value)}
        onChange={(e) => onChange(toPaise(e.target.value.replace(/[^\d.]/g, '')))}
        placeholder={placeholder}
        className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-[#061A40] outline-none placeholder:text-[#9CA3AF]"
      />
    </div>
  );
}

function Percent({ value, onChange, placeholder }: { value: number | null; onChange: (n: number | null) => void; placeholder?: string }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-colors focus-within:border-[#3D4FE0] hover:border-[#C7D2FE]">
      <input
        inputMode="decimal"
        value={value === null ? '' : String(value)}
        onChange={(e) => onChange(toNumber(e.target.value.replace(/[^\d.]/g, '')))}
        placeholder={placeholder}
        className="h-11 min-w-0 flex-1 bg-transparent px-3.5 text-sm text-[#061A40] outline-none placeholder:text-[#9CA3AF]"
      />
      <span className="flex items-center bg-[#F5F8FC] px-3 text-sm font-semibold text-[#6B7280]">%</span>
    </div>
  );
}

/** Chips to pick from; none picked means all. */
function Chips({ options, picked, onChange }: { options: { value: string; label: string }[]; picked: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = picked.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? picked.filter((p) => p !== o.value) : [...picked, o.value])}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              on ? 'border-[#3D4FE0] bg-[#3D4FE0] text-white' : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#C7D2FE]'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Amount or percent, one at a time. */
function AmountOrPercent({
  mode,
  setMode,
  amount,
  percent,
  onAmount,
  onPercent,
}: {
  mode: 'amount' | 'percent';
  setMode: (m: 'amount' | 'percent') => void;
  amount: ReactNode;
  percent: ReactNode;
  onAmount?: () => void;
  onPercent?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-fit gap-1 rounded-xl bg-[#F5F8FC] p-1">
        {(['amount', 'percent'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              (m === 'amount' ? onAmount : onPercent)?.();
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${mode === m ? 'bg-[#061A40] text-white' : 'text-[#6B7280] hover:text-[#061A40]'}`}
          >
            {m === 'amount' ? 'Amount in ₹' : 'Percent'}
          </button>
        ))}
      </div>
      {mode === 'amount' ? amount : percent}
    </div>
  );
}

/** What the offer would show on a product at the example price. */
function previewLine(o: OfferInput, price: number): string {
  switch (o.kind) {
    case 'BANK': {
      const saving = bankSaving(o, price);
      return saving > 0 ? `${rupeesText(saving)} off, so it can be bought at ${rupeesText(price - saving)}` : 'No saving yet';
    }
    case 'EMI':
      return o.emiMonths.length
        ? o.emiMonths.map((m) => `${m} months: ${rupeesText(emiMonthly(price, m, o.interestPercent ?? 0))}/month`).join(' · ')
        : 'Choose the months';
    case 'EXCHANGE':
      return `Up to ${rupeesText(o.maxOffInPaise ?? 0)} off for an old device`;
    case 'PROTECTION':
      return `${o.title || 'The plan'} for ${rupeesText(planPrice(o, price))}, covering ${o.coverMonths ?? 0} months`;
  }
}

function Editor({ start, id, brands, onSaved, onClose }: { start: OfferInput; id: string | null; brands: string[]; onSaved: () => void; onClose: () => void }) {
  const [o, setO] = useState<OfferInput>(start);
  const [money, setMoney] = useState<'amount' | 'percent'>(start.percentOff || start.planPricePercent ? 'percent' : 'amount');
  const [example, setExample] = useState(5_000_000);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (patch: Partial<OfferInput>) => setO((prev) => ({ ...prev, ...patch }));
  const kind = KINDS.find((k) => k.kind === o.kind)!;
  const problem = offerProblem(o);

  async function save() {
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiFetch(id ? `/admin/offers/${id}` : '/admin/offers', { method: id ? 'PUT' : 'POST', body: o });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the offer. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`${CARD} overflow-hidden border-[#C7D2FE]`}>
      <div className="flex items-center justify-between gap-3 border-b border-[#EEF0F6] bg-[#F5F7FF] px-5 py-4">
        <h2 className="flex items-center gap-3 font-dm-sans text-lg font-bold text-[#061A40]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3D4FE0] text-white">
            <kind.icon className="h-[18px] w-[18px]" />
          </span>
          {id ? 'Change this offer' : kind.add}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] hover:bg-white hover:text-[#061A40]">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        {(o.kind === 'BANK' || o.kind === 'EMI') && (
          <>
            <Field label="Bank">
              <input value={o.provider} onChange={(e) => set({ provider: e.target.value })} placeholder="e.g. HDFC Bank" className={INPUT} />
            </Field>
            <Field label="Paid with">
              <select value={o.paymentType} onChange={(e) => set({ paymentType: e.target.value })} className={INPUT}>
                {PAYMENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </>
        )}

        {o.kind === 'BANK' && (
          <>
            <Field label="Discount">
              <AmountOrPercent
                mode={money}
                setMode={setMoney}
                onAmount={() => set({ percentOff: null, maxOffInPaise: null })}
                onPercent={() => set({ flatOffInPaise: null })}
                amount={<Rupees value={o.flatOffInPaise} onChange={(v) => set({ flatOffInPaise: v })} placeholder="e.g. 3000" />}
                percent={<Percent value={o.percentOff} onChange={(v) => set({ percentOff: v })} placeholder="e.g. 10" />}
              />
            </Field>
            {money === 'percent' && (
              <Field label="Most it can take off" help="Leave empty for no limit. e.g. 10% off up to ₹1,500.">
                <Rupees value={o.maxOffInPaise} onChange={(v) => set({ maxOffInPaise: v })} placeholder="No limit" />
              </Field>
            )}
          </>
        )}

        {o.kind === 'EMI' && (
          <>
            <Field label="Months on offer">
              <Chips
                options={EMI_MONTH_CHOICES.map((m) => ({ value: String(m), label: `${m} months` }))}
                picked={o.emiMonths.map(String)}
                onChange={(next) => set({ emiMonths: next.map(Number).sort((a, b) => a - b) })}
              />
            </Field>
            <Field label="Interest a year" help="0 means No cost EMI: the price split evenly into the months, with no interest.">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-[#374151]">
                  <input
                    type="checkbox"
                    checked={o.interestPercent === 0}
                    onChange={(e) => set({ interestPercent: e.target.checked ? 0 : 15 })}
                    className="h-4 w-4 accent-[#3D4FE0]"
                  />
                  No cost EMI (no interest)
                </label>
                {o.interestPercent !== 0 && <Percent value={o.interestPercent} onChange={(v) => set({ interestPercent: v })} placeholder="e.g. 15" />}
              </div>
            </Field>
          </>
        )}

        {o.kind === 'EXCHANGE' && (
          <>
            <Field label="Most a customer can get off">
              <Rupees value={o.maxOffInPaise} onChange={(v) => set({ maxOffInPaise: v })} placeholder="e.g. 52000" />
            </Field>
            <Field label="Headline (optional)" help='Shown instead of "Up to ₹52,000 off on exchange", e.g. "Exchange your old phone".'>
              <input value={o.title} onChange={(e) => set({ title: e.target.value })} placeholder="Up to … off on exchange" className={INPUT} />
            </Field>
          </>
        )}

        {o.kind === 'PROTECTION' && (
          <>
            <Field label="Plan name">
              <input value={o.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Complete Mobile Protection" className={INPUT} />
            </Field>
            <Field label="Given by (optional)">
              <input value={o.provider} onChange={(e) => set({ provider: e.target.value })} placeholder="e.g. AppleCare+ or OneAssist" className={INPUT} />
            </Field>
            <Field label="Plan price">
              <AmountOrPercent
                mode={money}
                setMode={setMoney}
                onAmount={() => set({ planPricePercent: null })}
                onPercent={() => set({ planPriceInPaise: null })}
                amount={<Rupees value={o.planPriceInPaise} onChange={(v) => set({ planPriceInPaise: v })} placeholder="e.g. 999" />}
                percent={<Percent value={o.planPricePercent} onChange={(v) => set({ planPricePercent: v })} placeholder="e.g. 5 (of the product's price)" />}
              />
            </Field>
            <Field label="Covers">
              <select value={o.coverMonths ?? 12} onChange={(e) => set({ coverMonths: Number(e.target.value) })} className={INPUT}>
                {COVER_CHOICES.map((m) => (
                  <option key={m} value={m}>
                    {m} months{m % 12 === 0 ? ` (${m / 12} year${m > 12 ? 's' : ''})` : ''}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}

        <div className="md:col-span-2">
          <Field label="Conditions (optional)" help="In plain words, shown under the offer. e.g. Minimum order ₹10,000. Not on EMI.">
            <textarea
              value={o.terms}
              onChange={(e) => set({ terms: e.target.value })}
              rows={2}
              placeholder="e.g. On orders of ₹30,000 and above. Once per card."
              className={`${INPUT} h-auto resize-none py-2.5`}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-[#F5F8FC] p-4 md:col-span-2">
          <p className="text-sm font-semibold text-[#061A40]">Which products</p>
          <Field label="Categories" help="Pick none for every category.">
            <Chips options={categories.map((c) => ({ value: c.slug, label: c.name }))} picked={o.categories} onChange={(next) => set({ categories: next })} />
          </Field>
          <Field label="Brands" help="Pick none for every brand.">
            <Chips options={brands.map((b) => ({ value: b, label: b }))} picked={o.brands} onChange={(next) => set({ brands: next })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Only from this price (optional)">
              <Rupees value={o.minPriceInPaise} onChange={(v) => set({ minPriceInPaise: v })} placeholder="Any price" />
            </Field>
            <Field label="Ends on (optional)" help="The offer stops showing after this day. Leave empty to keep it on.">
              <input
                type="date"
                value={o.endsAt ? o.endsAt.slice(0, 10) : ''}
                onChange={(e) => set({ endsAt: e.target.value ? new Date(`${e.target.value}T23:59:59+05:30`).toISOString() : null })}
                className={INPUT}
              />
            </Field>
          </div>
        </div>

        {/* What it will look like on a product */}
        <div className="rounded-2xl border border-dashed border-[#C7D2FE] px-4 py-3 md:col-span-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">
            On a product priced
            <span className="w-32">
              <Rupees value={example} onChange={(v) => setExample(v ?? 0)} />
            </span>
            the page shows:
          </div>
          <p className="mt-2 text-sm font-semibold text-[#061A40]">{previewLine(o, example)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF0F6] px-5 py-4">
        <label className="flex items-center gap-2 text-sm font-medium text-[#061A40]">
          <input type="checkbox" checked={o.active} onChange={(e) => set({ active: e.target.checked })} className="h-4 w-4 accent-[#3D4FE0]" />
          Show on the website
        </label>
        <div className="flex items-center gap-3">
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm font-semibold text-[#6B7280] hover:text-[#061A40]">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#061A40] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#3D4FE0] disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save offer
          </button>
        </div>
      </div>
    </section>
  );
}

/** Who and what an offer is for, in a line. */
function forWhom(o: Offer): string {
  const parts = [
    o.categories.length ? o.categories.map((c) => categories.find((x) => x.slug === c)?.name ?? c).join(', ') : 'All products',
    o.brands.length ? o.brands.join(', ') : '',
    o.minPriceInPaise ? `from ${rupeesText(o.minPriceInPaise)}` : '',
    o.endsAt ? `until ${new Date(o.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
  ];
  return parts.filter(Boolean).join(' · ');
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [kind, setKind] = useState<OfferKind>('BANK');
  const [editing, setEditing] = useState<{ id: string | null; start: OfferInput } | null>(null);
  const [error, setError] = useState('');
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)), []);

  const load = useCallback(() => {
    apiFetch<Offer[]>('/admin/offers')
      .then(setOffers)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the offers.'));
  }, []);
  useEffect(load, [load]);

  async function update(o: Offer, patch: Partial<OfferInput>) {
    const { id, ...rest } = o;
    try {
      await apiFetch(`/admin/offers/${id}`, { method: 'PUT', body: { ...rest, ...patch } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change the offer.');
    }
  }

  async function remove(o: Offer) {
    if (!window.confirm(`Delete "${offerHeadline(o)}"${o.provider ? ` (${o.provider})` : ''}? It goes off the website at once.`)) return;
    try {
      await apiFetch(`/admin/offers/${o.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the offer.');
    }
  }

  const current = KINDS.find((k) => k.kind === kind)!;
  const shown = (offers ?? []).filter((o) => o.kind === kind);

  return (
    <AdminShell>
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
              Offers
            </h1>
            <p className="mt-1 max-w-2xl text-[#6B7280]">
              Bank offers, EMI, exchange and protection plans shown on product pages. They show on products customers can order (with an item
              code linked).
            </p>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing({ id: null, start: { ...blank(kind) } })}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#061A40] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#3D4FE0]"
            >
              <Plus className="h-4 w-4" />
              {current.add}
            </button>
          )}
        </div>

        <div role="tablist" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {KINDS.map((k) => {
            const count = (offers ?? []).filter((o) => o.kind === k.kind).length;
            const on = k.kind === kind;
            return (
              <button
                key={k.kind}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setKind(k.kind);
                  setEditing(null);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  on ? 'bg-[#061A40] text-white' : 'border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#C7D2FE]'
                }`}
              >
                <k.icon className="h-4 w-4" />
                {k.label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${on ? 'bg-white/15' : 'bg-[#F1F2F6] text-[#6B7280]'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {editing && (
          <Editor
            key={editing.id ?? `new-${kind}`}
            start={editing.start}
            id={editing.id}
            brands={brands}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}

        <section className={`${CARD} overflow-hidden`}>
          <div className="border-b border-[#EEF0F6] px-5 py-4">
            <h2 className="font-dm-sans text-base font-bold text-[#061A40]">{current.label}</h2>
            <p className="text-sm text-[#6B7280]">{current.text}</p>
          </div>
          {offers === null ? (
            <p className="flex items-center gap-2 px-5 py-6 text-sm text-[#6B7280]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </p>
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#3D4FE0]">
                <current.icon className="h-6 w-6" />
              </span>
              <p className="text-sm text-[#6B7280]">None yet. Product pages show this section once you add one.</p>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing({ id: null, start: blank(kind) })}
                  className="flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 text-sm font-semibold text-[#061A40] hover:border-[#3D4FE0] hover:text-[#3D4FE0]"
                >
                  <Plus className="h-4 w-4" /> {current.add}
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-[#EEF0F6]">
              {shown.map((o) => {
                const ended = !!o.endsAt && Date.parse(o.endsAt) < Date.now();
                return (
                  <li key={o.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#061A40]">
                        {offerHeadline(o)}
                        {o.provider && <span className="font-normal text-[#6B7280]"> · {o.provider}</span>}
                        {o.paymentType && <span className="font-normal text-[#6B7280]"> · {o.paymentType}</span>}
                      </p>
                      <p className="mt-0.5 text-sm text-[#6B7280]">{forWhom(o)}</p>
                      {o.terms && <p className="mt-1 text-xs text-[#9CA3AF]">{o.terms}</p>}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        ended ? 'bg-[#F1F2F6] text-[#6B7280]' : o.active ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ended ? 'Ended' : o.active ? 'On the website' : 'Switched off'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void update(o, { active: !o.active })}
                        className="h-9 rounded-xl border border-[#E5E7EB] px-3 text-sm font-semibold text-[#061A40] hover:border-[#C7D2FE]"
                      >
                        {o.active ? 'Switch off' : 'Switch on'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const { id, ...start } = o;
                          setEditing({ id, start });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-3 text-sm font-semibold text-[#061A40] hover:border-[#C7D2FE]"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Change
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(o)}
                        aria-label="Delete this offer"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </AdminShell>
  );
}
