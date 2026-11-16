import { useEffect, useState } from 'react';
import { Link2, Loader2, Search, Unlink } from 'lucide-react';
import { ApiError, apiFetch } from '../../lib/api-client';

/* The SKU of a listing: the SAP (ERP) codes it is sold under, linked and
   unlinked from the product page itself. Linking happens at once, as on
   the SAP import page: from then on the SAP sheet sets the price and stock. */

export interface LinkedCode {
  sapCode: string;
  modelName: string;
  websiteColour: string | null;
  mopInPaise: number;
  mrpInPaise: number;
  stock: number;
}

interface FeedItem {
  sapCode: string;
  modelName: string;
  stock: number;
  mopInPaise: number;
  mrpInPaise: number;
  brand: string | null;
}

const INPUT =
  'h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#061A40] outline-none transition-colors placeholder:text-[#9CA3AF] hover:border-[#C7D2FE] focus:border-[#3D4FE0]';
const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

export default function SkuLinker({
  slug,
  colours,
  codes,
  onChanged,
}: {
  /** Null for a listing not saved yet. */
  slug: string | null;
  colours: { key: string; name: string }[];
  codes: LinkedCode[];
  onChanged: () => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<FeedItem[] | null>(null);
  const [colour, setColour] = useState<string>('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      apiFetch<{ items: FeedItem[] }>(`/admin/sap-import/items?${new URLSearchParams({ search: term, linked: 'no', pageSize: '6' })}`)
        .then((page) => setResults(page.items))
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function link(sapCode: string, productId: string | null, colourKey: string | null) {
    setBusy(sapCode);
    setError('');
    try {
      await apiFetch('/admin/sap-import/link', { method: 'POST', body: { sapCode, productId, colour: colourKey } });
      setSearch('');
      setResults(null);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change the link. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  if (!slug) {
    return <p className="rounded-xl bg-[#F5F8FC] px-3.5 py-3 text-xs text-[#6B7280]">Save the product first, then link its SAP code here.</p>;
  }

  const savedColours = colours.filter((c) => c.name.trim());
  return (
    <div className="flex flex-col gap-2">
      {codes.length > 0 && (
        <ul className="divide-y divide-[#EEF0F6] rounded-xl border border-[#E5E7EB]">
          {codes.map((c) => (
            <li key={c.sapCode} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5 text-sm">
              <span className="font-mono font-semibold text-[#061A40]">{c.sapCode}</span>
              <span className="min-w-0 flex-1 truncate text-[#6B7280]">
                {c.modelName}
                {c.websiteColour && ` · ${colours.find((x) => x.key === c.websiteColour)?.name ?? c.websiteColour}`}
              </span>
              <span className="text-xs tabular-nums text-[#6B7280]">
                {rupees(c.mopInPaise)} · {c.stock} in stock
              </span>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void link(c.sapCode, null, null)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                {busy === c.sapCode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />} Unlink
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={codes.length ? 'Link another SAP code: search code or name' : 'Search the SAP feed by code or name'}
            aria-label="Search SAP codes to link"
            className={`${INPUT} pl-9`}
          />
        </label>
        {savedColours.length > 0 && (
          <select value={colour} onChange={(e) => setColour(e.target.value)} aria-label="Colour the code is for" className={`${INPUT} sm:w-44`}>
            <option value="">Whole product</option>
            {savedColours.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {results && (
        <ul className="rounded-xl border border-[#E5E7EB] bg-white">
          {results.length === 0 && <li className="px-3.5 py-2.5 text-xs text-[#6B7280]">No unlinked SAP code matches.</li>}
          {results.map((item) => (
            <li key={item.sapCode} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#EEF0F6] px-3.5 py-2 text-sm last:border-0">
              <span className="font-mono text-[#061A40]">{item.sapCode}</span>
              <span className="min-w-0 flex-1 truncate text-[#374151]">{item.modelName}</span>
              <span className="text-xs tabular-nums text-[#6B7280]">
                {rupees(item.mopInPaise)} · {item.stock} in stock
              </span>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void link(item.sapCode, slug, colour || null)}
                className="flex items-center gap-1 rounded-lg bg-[#061A40] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#3D4FE0] disabled:opacity-50"
              >
                {busy === item.sapCode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />} Link
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <p className="text-xs text-[#6B7280]">
        Once a code is linked, the SAP sheet sets the price, MRP and stock. Colours added since the last save can be chosen after saving.
      </p>
    </div>
  );
}
