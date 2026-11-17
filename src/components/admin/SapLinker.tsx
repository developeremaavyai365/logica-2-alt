import { useCallback, useEffect, useState } from 'react';
import { Link2, Link2Off, Loader2, Search, X } from 'lucide-react';
import { ApiError, apiFetch } from '../../lib/api-client';
import { products, type Product } from '../../data';
import { coloursOf, productTitle, type ProductColour } from '../../product-colours';
import { searchProducts, suggestProducts } from '../../sap-matching';
import { refreshLiveCatalogue } from '../../live-catalogue';

/* Linking SAP codes to the website products they are sold as.

   A code's price, MRP and stock reach the shop only once it is linked here
   — to the whole product, or to one colour of it when the sheet has one
   code per colour. Links are kept across imports: a new sheet updates the
   numbers, never the links. */

interface FeedItem {
  sapCode: string;
  sapName: string;
  modelName: string;
  brand: string | null;
  partNumber: string | null;
  stock: number;
  mrpInPaise: number;
  mopInPaise: number;
  inLatestFeed: boolean;
  websiteProductId: string | null;
  websiteColour: string | null;
}

interface Page {
  total: number;
  items: FeedItem[];
}

type Filter = 'no' | 'yes' | 'all';

const PAGE_SIZE = 20;
const MICRO_LABEL = 'text-xs font-semibold text-[#6B7280]';
const byId = new Map(products.map((p) => [p.id, p]));
const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'no', label: 'Not linked' },
  { key: 'yes', label: 'Linked' },
  { key: 'all', label: 'All' },
];

function Choice({
  product,
  colour,
  onPick,
  busy,
  hint,
}: {
  product: Product;
  colour?: ProductColour;
  onPick: () => void;
  busy: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={busy}
      className="group flex w-full items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-left transition-colors hover:border-[#3D4FE0] disabled:opacity-50"
    >
      <img src={colour?.images[0] ?? product.image} alt="" className="h-10 w-10 shrink-0 object-contain mix-blend-multiply" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-[#061A40]">{productTitle(product, colour)}</span>
        <span className="block text-xs text-[#6B7280]">
          {product.brand}
          {hint ? ` · ${hint}` : ''}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 rounded-lg bg-[#061A40] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-[#3D4FE0]">
        <Link2 className="h-3.5 w-3.5" />
        Link
      </span>
    </button>
  );
}

/** The search for a product by hand, then — for a product with colours —
 *  which colour this code is, or the whole product. */
function Picker({ item, onLink, busy, onClose }: { item: FeedItem; onLink: (id: string, colour: string | null) => void; busy: boolean; onClose: () => void }) {
  const [query, setQuery] = useState(item.brand ?? '');
  const [chosen, setChosen] = useState<Product | null>(null);
  const results = searchProducts(query);
  const colours = chosen ? coloursOf(chosen.id) : [];

  return (
    <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#F5F8FC] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className={MICRO_LABEL}>{chosen ? 'Which colour is this code?' : 'Find the product on the website'}</span>
        <button type="button" onClick={onClose} aria-label="Close" className="text-[#6B7280] hover:text-[#061A40]">
          <X className="h-4 w-4" />
        </button>
      </div>

      {chosen ? (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-sm font-medium text-[#061A40]">{productTitle(chosen)}</p>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => (
              <button
                key={c.key}
                type="button"
                disabled={busy}
                onClick={() => onLink(chosen.id, c.key)}
                className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm transition-colors hover:border-[#3D4FE0] disabled:opacity-50"
              >
                <span className="h-3.5 w-3.5 rounded-full border border-[#061A40]/15" style={{ backgroundColor: c.hex }} />
                {c.name}
              </button>
            ))}
            <button
              type="button"
              disabled={busy}
              onClick={() => onLink(chosen.id, null)}
              className="rounded-lg border border-dashed border-[#061A40]/30 bg-white px-3 py-1.5 text-sm text-[#374151] transition-colors hover:border-[#3D4FE0] disabled:opacity-50"
            >
              Whole product (all colours)
            </button>
          </div>
          <button type="button" onClick={() => setChosen(null)} className="w-fit text-xs text-[#6B7280] underline underline-offset-2 hover:text-[#061A40]">
            Choose a different product
          </button>
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3">
            <Search className="h-4 w-4 text-[#6B7280]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Brand, model or name"
              className="h-10 w-full bg-transparent text-sm text-[#061A40] outline-none"
            />
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {results.length === 0 ? (
              <p className="px-1 py-2 text-xs text-[#6B7280]">{query.trim() ? 'No product matches.' : 'Type a product name to search.'}</p>
            ) : (
              results.map((p) => (
                <Choice
                  key={p.id}
                  product={p}
                  busy={busy}
                  hint={coloursOf(p.id).length ? `${coloursOf(p.id).length} colours` : undefined}
                  onPick={() => (coloursOf(p.id).length ? setChosen(p) : onLink(p.id, null))}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ item, onChanged }: { item: FeedItem; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [picking, setPicking] = useState(false);

  const linkedProduct = item.websiteProductId ? byId.get(item.websiteProductId) : undefined;
  const linkedColour = linkedProduct && item.websiteColour ? coloursOf(linkedProduct.id).find((c) => c.key === item.websiteColour) : undefined;
  const suggestions = item.websiteProductId ? [] : suggestProducts(item);

  async function link(productId: string | null, colour: string | null) {
    setBusy(true);
    setError('');
    try {
      await apiFetch('/admin/sap-import/link', { method: 'POST', body: { sapCode: item.sapCode, productId, colour } });
      setPicking(false);
      onChanged();
      void refreshLiveCatalogue();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the link. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#061A40]">{item.modelName}</p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {item.sapCode}
            {item.brand && ` · ${item.brand}`}
            {item.partNumber && ` · ${item.partNumber}`}
          </p>
        </div>
        <div className="text-right text-xs tabular-nums text-[#6B7280]">
          <span className="text-sm font-bold text-[#061A40]">{rupees(item.mopInPaise)}</span> · MRP {rupees(item.mrpInPaise)}
          <span className={`ml-2 ${item.stock > 0 ? 'text-[#3D4FE0]' : 'text-red-600'}`}>
            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>

      {item.websiteProductId ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex min-w-0 items-center gap-2 rounded-lg bg-[#F3F4FE] px-3 py-1.5 text-sm text-[#061A40]">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-[#3D4FE0]" />
            <span className="truncate">
              {linkedProduct
                ? `${productTitle(linkedProduct, linkedColour)}${item.websiteColour ? '' : coloursOf(linkedProduct.id).length ? ' (all colours)' : ''}`
                : `“${item.websiteProductId}” is no longer on the website`}
            </span>
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPicking(true)}
            className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#061A40] transition-colors hover:border-[#061A40]/40 disabled:opacity-50"
          >
            Change
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => link(null, null)}
            className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:border-red-300 disabled:opacity-50"
          >
            <Link2Off className="h-3.5 w-3.5" />
            Unlink
          </button>
        </div>
      ) : (
        !picking && (
          <div className="mt-3 flex flex-col gap-1.5">
            {suggestions.length > 0 && <span className={MICRO_LABEL}>Suggested</span>}
            {suggestions.map((s) => (
              <Choice
                key={`${s.product.id}-${s.colour?.key ?? ''}`}
                product={s.product}
                colour={s.colour}
                busy={busy}
                hint={s.colour ? `${s.colour.name} only` : coloursOf(s.product.id).length ? 'all colours' : undefined}
                onPick={() => link(s.product.id, s.colour?.key ?? null)}
              />
            ))}
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="mt-0.5 flex w-fit items-center gap-1.5 text-xs font-medium text-[#6B7280] underline underline-offset-2 hover:text-[#061A40]"
            >
              <Search className="h-3.5 w-3.5" />
              {suggestions.length ? 'Not these? Search the products' : 'Search the products for this one'}
            </button>
          </div>
        )
      )}

      {picking && <Picker item={item} busy={busy} onLink={link} onClose={() => setPicking(false)} />}
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </li>
  );
}

export default function SapLinker({ onChanged }: { onChanged?: () => void }) {
  const [filter, setFilter] = useState<Filter>('no');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState('');

  // Debounce typing into the query sent to the server.
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (filter !== 'all') params.set('linked', filter);
    if (query) params.set('search', query);
    apiFetch<Page>(`/admin/sap-import/items?${params}`)
      .then((next) => {
        setData(next);
        setError('');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the item codes.'));
  }, [filter, query, page]);

  useEffect(load, [load]);

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F6] px-5 py-3.5">
        <h2 className="font-dm-sans text-base font-bold text-[#061A40]">Link item codes to products</h2>
        <div className="flex gap-1 rounded-xl bg-[#F5F8FC] p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key ? 'bg-[#061A40] text-white' : 'text-[#6B7280] hover:text-[#061A40]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-[#E5E7EB] px-5 py-3">
        <p className="text-xs leading-relaxed text-[#6B7280]">
          A code's price, MRP and stock show on the website once it is linked to the product it is sold as. Link each colour's
          code to its colour, or one code to the whole product. Links stay in place when a new sheet is applied.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3">
          <Search className="h-4 w-4 text-[#6B7280]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item code, name, brand or part number"
            className="h-10 w-full bg-transparent text-sm text-[#061A40] outline-none"
          />
        </div>
      </div>

      {error ? (
        <p className="px-5 py-6 text-sm text-red-600">{error}</p>
      ) : data === null ? (
        <p className="flex items-center gap-2 px-5 py-6 text-sm text-[#6B7280]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : data.items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-[#6B7280]">
          {query
            ? 'No item code matches that search.'
            : filter === 'no'
              ? 'Every item code is linked to a product.'
              : filter === 'yes'
                ? 'No item code is linked yet.'
                : 'No SAP sheet has been applied yet.'}
        </p>
      ) : (
        <ul className="divide-y divide-[#E5E7EB]">
          {data.items.map((item) => (
            <Row
              key={item.sapCode}
              item={item}
              onChanged={() => {
                load();
                onChanged?.();
              }}
            />
          ))}
        </ul>
      )}

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-2.5 text-xs text-[#6B7280]">
          <span>
            {data.total.toLocaleString('en-IN')} codes · page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-1 font-medium disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-1 font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
