import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Barcode,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  Link2Off,
  Loader2,
  PackageX,
  Plus,
  RotateCcw,
  Search,
  Type,
  X,
} from 'lucide-react';
import AdminShell from './AdminShell';
import { ApiError, apiFetch } from '../../lib/api-client';

/* The admin products page: every product on the shop, what it shows there
   (price and stock come from the SAP sheet where a code is linked), what
   its listing is missing, and putting products on or off the shop in bulk.

   The filters live in the address bar, so a filtered view survives a reload
   and can be shared. */

type Status = 'ACTIVE' | 'DRAFT' | 'INACTIVE';
type Issue = 'missing-ean' | 'not-linked' | 'out-of-stock';
type Sort = 'shop' | 'name' | 'recent' | 'price';

interface Row {
  slug: string;
  name: string;
  brand: string;
  category: { slug: string; name: string };
  status: Status;
  imageUrl: string;
  updatedAt: string;
  deletedAt: string | null;
  source: 'sap' | 'catalogue';
  pricePaise: number;
  mrpPaise: number | null;
  stock: number | null;
  inStock: boolean;
  sapCodes: { sapCode: string; colour: string | null; stock: number }[];
  ean: { have: number; need: number; value: string | null };
  colourCount: number;
  issues: Issue[];
}

interface ListResponse {
  total: number;
  page: number;
  pageSize: number;
  counts: Record<'all' | 'deleted' | Status | Issue, number>;
  items: Row[];
  filters: { categories: { slug: string; name: string }[]; brands: string[] };
}

const PAGE_SIZE = 25;

/** "deleted" lists the deleted products, to restore them. */
type Tab = Status | 'deleted';

const STATUS_TABS: { key: Tab | null; label: string }[] = [
  { key: null, label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'deleted', label: 'Deleted' },
];

const when = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const ISSUES: { key: Issue; label: string; icon: typeof Barcode }[] = [
  { key: 'missing-ean', label: 'Missing EAN', icon: Barcode },
  { key: 'not-linked', label: 'Not linked to SAP', icon: Link2Off },
  { key: 'out-of-stock', label: 'Out of stock', icon: PackageX },
];

const STATUS_PILL: Record<Status, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  DRAFT: 'bg-amber-50 text-amber-700',
  INACTIVE: 'bg-[#F1F2F6] text-[#6B7280]',
};
const STATUS_LABEL: Record<Status, string> = { ACTIVE: 'Active', DRAFT: 'Draft', INACTIVE: 'Inactive' };

const CARD = 'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]';
const SELECT =
  'h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#061A40] outline-none transition-colors hover:border-[#C7D2FE] focus:border-[#3D4FE0]';

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('status') as Tab | null) ?? null;
  const deletedView = tab === 'deleted';
  const status = deletedView ? null : (tab as Status | null);
  const issue = deletedView ? null : ((params.get('issue') as Issue | null) ?? null);
  // Set by the product page after deleting, to say so here.
  const justDeleted = params.get('done');
  const category = params.get('category') ?? '';
  const brand = params.get('brand') ?? '';
  const sort = (params.get('sort') as Sort | null) ?? 'shop';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [searchText, setSearchText] = useState(params.get('q') ?? '');
  const search = useDebounced(searchText.trim(), 300);

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);

  /** Changes filters in the address bar; any change but paging goes back to page 1. */
  const update = useCallback(
    (changes: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(changes)) {
            if (v) next.set(k, v);
            else next.delete(k);
          }
          if (!('page' in changes)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  useEffect(() => {
    if (search !== (params.get('q') ?? '')) update({ q: search || null });
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = useMemo(() => {
    const q = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), sort });
    if (search) q.set('search', search);
    if (status) q.set('status', status);
    if (deletedView) q.set('deleted', 'true');
    if (issue) q.set('issue', issue);
    if (category) q.set('category', category);
    if (brand) q.set('brand', brand);
    return q.toString();
  }, [page, sort, search, status, deletedView, issue, category, brand]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await apiFetch<ListResponse>(`/admin/products?${query}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the products.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  // A new filter shows different products: start the selection afresh.
  useEffect(() => {
    setSelected(new Set());
    setConfirmOff(false);
  }, [search, tab, issue, category, brand]);

  useEffect(() => {
    if (!justDeleted) return;
    setNotice({ ok: true, text: `“${justDeleted}” was deleted: it is off the shop. It can be restored from this list.` });
    update({ done: null });
  }, [justDeleted, update]);

  async function restore(row: Row) {
    setBusy(true);
    setNotice(null);
    try {
      const { status: now, clearedBarcodes } = await apiFetch<{ status: Status; clearedBarcodes: string[] }>(`/admin/products/${row.slug}/restore`, {
        method: 'POST',
      });
      setNotice({
        ok: true,
        text:
          `“${row.name}” was restored ${now === 'DRAFT' ? 'as a draft' : 'and is off the shop'}. ${now === 'DRAFT' ? 'Publish it' : 'Put it back on the shop'} from its page when it is ready.` +
          (clearedBarcodes.length ? ` Its EAN ${clearedBarcodes.join(', ')} had been given to another product since, so it was removed from this one.` : ''),
      });
      await load();
    } catch (err) {
      setNotice({ ok: false, text: err instanceof ApiError ? err.message : 'Could not restore the product. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  const items = data?.items ?? [];
  const allOnPage = items.length > 0 && items.every((r) => selected.has(r.slug));

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((r) => (allOnPage ? next.delete(r.slug) : next.add(r.slug)));
      return next;
    });
  }

  async function setStatus(to: 'ACTIVE' | 'INACTIVE') {
    setBusy(true);
    setNotice(null);
    try {
      const { updated } = await apiFetch<{ updated: number }>('/admin/products/status', {
        method: 'POST',
        body: { slugs: [...selected], status: to },
      });
      setNotice({
        ok: true,
        text:
          updated === 0
            ? 'Nothing to change: those products were already ' + (to === 'ACTIVE' ? 'active.' : 'off the shop.')
            : `${updated} product${updated === 1 ? '' : 's'} ${to === 'ACTIVE' ? 'put on the shop' : 'taken off the shop'}. The shop shows it within a minute.`,
      });
      setSelected(new Set());
      setConfirmOff(false);
      await load();
    } catch (err) {
      setNotice({ ok: false, text: err instanceof ApiError ? err.message : 'Could not change the products. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  const from = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(data.page * data.pageSize, data.total) : 0;
  const lastPage = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 pb-28 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
            Products
          </h1>
          <p className="mt-1 max-w-2xl text-[#6B7280]">
            Everything listed on the shop. Where a SAP code is linked, its price and stock come from the SAP sheet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/title-formats"
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#061A40] transition-colors duration-300 hover:border-[#3D4FE0] hover:text-[#3D4FE0]"
          >
            <Type className="h-4 w-4" />
            Title formats
          </Link>
          <Link
            to="/admin/products/bulk"
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#061A40] transition-colors duration-300 hover:border-[#3D4FE0] hover:text-[#3D4FE0]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Bulk upload
          </Link>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 rounded-xl bg-[#061A40] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(6,26,64,0.6)] transition-colors duration-300 hover:bg-[#3D4FE0]"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_#E5E7EB] [scrollbar-width:none]" role="tablist" aria-label="Product status">
        {STATUS_TABS.map((t) => {
          const on = t.key === tab;
          const count = data ? data.counts[t.key ?? 'all'] : null;
          return (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => update({ status: t.key, ...(t.key === 'deleted' && { issue: null }) })}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                on ? 'border-[#3D4FE0] text-[#061A40]' : 'border-transparent text-[#6B7280] hover:text-[#061A40]'
              }`}
            >
              {t.label}
              {count !== null && (
                <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${on ? 'bg-[#EEF1FF] text-[#3D4FE0]' : 'bg-[#F1F2F6] text-[#6B7280]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search name, brand, SAP code or EAN"
            aria-label="Search products"
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-3 text-sm text-[#061A40] outline-none transition-colors placeholder:text-[#9CA3AF] hover:border-[#C7D2FE] focus:border-[#3D4FE0]"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select aria-label="Category" value={category} onChange={(e) => update({ category: e.target.value || null })} className={SELECT}>
            <option value="">All categories</option>
            {data?.filters.categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select aria-label="Brand" value={brand} onChange={(e) => update({ brand: e.target.value || null })} className={SELECT}>
            <option value="">All brands</option>
            {data?.filters.brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => update({ sort: e.target.value === 'shop' ? null : e.target.value })} className={`${SELECT} col-span-2`}>
            <option value="shop">Shop order</option>
            <option value="name">Name A–Z</option>
            <option value="price">Price: low to high</option>
            <option value="recent">Recently changed</option>
          </select>
        </div>
      </div>

      {/* Needs attention */}
      <div className={`flex flex-wrap items-center gap-2 ${deletedView ? 'hidden' : ''}`}>
        <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Needs attention</span>
        {ISSUES.map(({ key, label, icon: Icon }) => {
          const on = issue === key;
          const count = data?.counts[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => update({ issue: on ? null : key })}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                on ? 'border-[#3D4FE0] bg-[#EEF1FF] text-[#3D4FE0]' : 'border-[#E5E7EB] bg-white text-[#061A40]/75 hover:border-[#C7D2FE]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {count !== undefined && <span className="tabular-nums text-[#6B7280]">{count}</span>}
              {on && <X className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {notice && (
        <p
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice.ok ? 'border-[#C7D2FE] bg-[#EEF1FF] text-[#061A40]' : 'border-red-200 bg-red-50 text-red-700'
          }`}
          role={notice.ok ? 'status' : 'alert'}
        >
          {notice.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3D4FE0]" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="flex-1">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="text-[#6B7280] hover:text-[#061A40]">
            <X className="h-4 w-4" />
          </button>
        </p>
      )}

      {/* The list */}
      <section className={`${CARD} overflow-hidden`}>
        {error ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm font-medium text-red-600">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#9CA3AF]" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-dm-sans text-lg font-bold text-[#061A40]">{deletedView && !search ? 'No deleted products' : 'No products match'}</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {deletedView && !search ? 'A product deleted from its page shows here, ready to restore.' : 'Try another search, or clear a filter.'}
            </p>
          </div>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-[#EEF0F6] bg-[#FAFBFE] text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  <th className="w-10 py-3 pl-5">
                    {!deletedView && (
                      <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every product on this page" className="h-4 w-4 accent-[#3D4FE0]" />
                    )}
                  </th>
                  <th className="py-3 pl-2 pr-4">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">EAN</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="py-3 pl-4 pr-5 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F6]">
                {items.map((row) => {
                  const on = selected.has(row.slug);
                  return (
                    <tr key={row.slug} className={`align-middle transition-colors ${on ? 'bg-[#F5F7FF]' : 'hover:bg-[#FAFBFE]'}`}>
                      <td className="py-3 pl-5">
                        {!row.deletedAt && (
                          <input type="checkbox" checked={on} onChange={() => toggle(row.slug)} aria-label={`Select ${row.name}`} className="h-4 w-4 accent-[#3D4FE0]" />
                        )}
                      </td>
                      <td className="py-3 pl-2 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#F5F8FC] to-[#EAEFFA]">
                            {row.imageUrl && <img src={row.imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain p-1.5 mix-blend-multiply" />}
                          </span>
                          <span className="min-w-0">
                            {row.deletedAt ? (
                              <span className="block max-w-[22rem] font-semibold leading-snug text-[#6B7280] line-clamp-2">{row.name}</span>
                            ) : (
                              <Link
                                to={`/admin/products/${row.slug}`}
                                className="block max-w-[22rem] font-semibold leading-snug text-[#061A40] line-clamp-2 transition-colors hover:text-[#3D4FE0]"
                              >
                                {row.name}
                              </Link>
                            )}
                            <span className="mt-0.5 block text-xs text-[#6B7280]">
                              {row.brand || 'No brand'} · {row.category.name}
                              {row.colourCount > 0 && ` · ${row.colourCount} colours`}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="block font-semibold tabular-nums text-[#061A40]">{rupees(row.pricePaise)}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs">
                          {row.mrpPaise && row.mrpPaise > row.pricePaise && <span className="tabular-nums text-[#9CA3AF] line-through">{rupees(row.mrpPaise)}</span>}
                          <span
                            className={`rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.06em] ${
                              row.source === 'sap' ? 'bg-[#EEF1FF] text-[#3D4FE0]' : 'bg-[#F1F2F6] text-[#6B7280]'
                            }`}
                            title={row.source === 'sap' ? `From SAP: ${row.sapCodes.map((s) => s.sapCode).join(', ')}` : 'The catalogue price: no SAP code is linked'}
                          >
                            {row.source === 'sap' ? 'SAP' : 'Catalogue'}
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {row.stock !== null ? (
                          <span className={`font-semibold tabular-nums ${row.stock > 0 ? 'text-[#061A40]' : 'text-red-600'}`}>
                            {row.stock} <span className="font-normal text-[#6B7280]">in SAP</span>
                          </span>
                        ) : (
                          <span className={`text-sm ${row.inStock ? 'text-[#061A40]' : 'text-red-600'}`}>{row.inStock ? 'In stock' : 'Out of stock'}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {row.ean.need === 1 ? (
                          row.ean.value ? (
                            <span className="font-mono text-xs text-[#061A40]">{row.ean.value}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                              <Barcode className="h-3 w-3" /> Missing
                            </span>
                          )
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                              row.ean.have === row.ean.need ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                            }`}
                          >
                            <Barcode className="h-3 w-3" />
                            {row.ean.have} of {row.ean.need} colours
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.deletedAt ? (
                          <span className="whitespace-nowrap rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Deleted {when(row.deletedAt)}</span>
                        ) : (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_PILL[row.status]}`}>{STATUS_LABEL[row.status]}</span>
                        )}
                      </td>
                      <td className="py-3 pl-4 pr-5 text-right">
                        {row.deletedAt ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void restore(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-semibold text-[#061A40] transition-colors hover:border-[#3D4FE0] hover:text-[#3D4FE0] disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Restore
                          </button>
                        ) : (
                          <Link
                            to={`/admin/products/${row.slug}`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#061A40] transition-colors hover:bg-[#F1F2F6]"
                          >
                            Edit
                          </Link>
                        )}
                        {row.status === 'ACTIVE' && !row.deletedAt && (
                          <a
                            href={`/product/${row.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#3D4FE0] transition-colors hover:bg-[#EEF1FF]"
                          >
                            View <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF0F6] px-5 py-3 text-sm text-[#6B7280]">
            <span className="tabular-nums">
              Showing {from}–{to} of {data.total}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={data.page <= 1}
                onClick={() => update({ page: String(data.page - 1) })}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#061A40] transition-colors hover:border-[#C7D2FE] disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 tabular-nums">
                Page {data.page} of {lastPage}
              </span>
              <button
                type="button"
                disabled={data.page >= lastPage}
                onClick={() => update({ page: String(data.page + 1) })}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#061A40] transition-colors hover:border-[#C7D2FE] disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(6,26,64,0.35)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 sm:px-2">
            <span className="text-sm font-semibold text-[#061A40]">
              {selected.size} selected
            </span>
            <button type="button" onClick={() => setSelected(new Set())} className="text-sm font-medium text-[#6B7280] hover:text-[#061A40]">
              Clear
            </button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {confirmOff ? (
                <>
                  <span className="text-sm text-[#061A40]">
                    Take {selected.size} product{selected.size === 1 ? '' : 's'} off the shop?
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void setStatus('INACTIVE')}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {busy ? 'Saving…' : 'Yes, take off'}
                  </button>
                  <button type="button" onClick={() => setConfirmOff(false)} className="rounded-xl px-3 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#F1F2F6]">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void setStatus('ACTIVE')}
                    className="rounded-xl bg-[#061A40] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3D4FE0] disabled:opacity-50"
                  >
                    {busy ? 'Saving…' : 'Put on the shop'}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmOff(true)}
                    className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                  >
                    Take off the shop
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Products() {
  return (
    <AdminShell>
      <ProductsPage />
    </AdminShell>
  );
}
