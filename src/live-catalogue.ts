import { useSyncExternalStore } from 'react';
import { products, type Product } from './data';
import { coloursOf } from './product-colours';

/* Live prices and stock from the SAP feed, laid over the built-in catalogue.

   The catalogue in the code holds every product's name, photos and details.
   For each product an admin has linked to a SAP code, the backend's
   /catalogue/live list carries the current selling price (MOP), MRP and
   whether it is in stock — one entry for the whole product, or one per
   colour. Those values are written onto the catalogue's own product and
   colour objects, so every card, filter, product page and the cart show
   them without each having to look them up.

   A product with no link keeps the catalogue's values. If the list cannot
   be fetched, the last one received is used, and failing that the
   catalogue as built. */

export interface LiveEntry {
  productId: string;
  /** The colour's key, or null when the SAP code is the whole product. */
  colour: string | null;
  price: number;
  mrp: number;
  inStock: boolean;
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const CACHE_KEY = 'logica2-live-catalogue';

const byId = new Map(products.map((p) => [p.id, p]));

/** The catalogue's own values, saved before the first change so a later
 *  list can start from them again (a product unlinked since goes back). */
const originalProduct = new Map<string, Pick<Product, 'price' | 'mrp' | 'inStock'>>();
const originalColourStock = new Map<string, boolean | undefined>();
/** Live entries per product colour, `${productId}|${colourKey}`. */
const colourEntries = new Map<string, LiveEntry>();

let applied = '';
let version = 0;
const listeners = new Set<() => void>();

const colourKey = (productId: string, colour: string) => `${productId}|${colour}`;

function restoreOriginals() {
  for (const [id, values] of originalProduct) Object.assign(byId.get(id)!, values);
  for (const [key, inStock] of originalColourStock) {
    const [id, colour] = key.split('|');
    const c = coloursOf(id).find((x) => x.key === colour);
    if (c) c.inStock = inStock;
  }
  colourEntries.clear();
}

function isEntry(value: unknown): value is LiveEntry {
  const e = value as LiveEntry;
  return (
    !!e &&
    typeof e.productId === 'string' &&
    (e.colour === null || typeof e.colour === 'string') &&
    typeof e.price === 'number' &&
    e.price > 0 &&
    typeof e.mrp === 'number' &&
    e.mrp > 0 &&
    typeof e.inStock === 'boolean'
  );
}

/** Writes a live list onto the catalogue. Returns false when it is the same
 *  as the one already applied. */
export function applyLiveCatalogue(entries: LiveEntry[]): boolean {
  const signature = JSON.stringify(entries);
  if (signature === applied) return false;
  restoreOriginals();

  const grouped = new Map<string, LiveEntry[]>();
  for (const entry of entries) {
    if (!byId.has(entry.productId)) continue; // linked to a product the site no longer has
    grouped.set(entry.productId, [...(grouped.get(entry.productId) ?? []), entry]);
  }

  for (const [id, list] of grouped) {
    const product = byId.get(id)!;
    if (!originalProduct.has(id)) originalProduct.set(id, { price: product.price, mrp: product.mrp, inStock: product.inStock });

    const colours = coloursOf(id);
    const whole = list.find((e) => e.colour === null);
    const perColour = list.filter((e) => e.colour !== null && colours.some((c) => c.key === e.colour));

    // A product sold colour by colour: each linked colour takes its own
    // stock, and a colour with no SAP code cannot be bought.
    if (perColour.length > 0) {
      for (const c of colours) {
        const key = colourKey(id, c.key);
        if (!originalColourStock.has(key)) originalColourStock.set(key, c.inStock);
        const entry = perColour.find((e) => e.colour === c.key);
        c.inStock = entry ? entry.inStock : false;
        if (entry) colourEntries.set(key, entry);
      }
    }

    // The price on cards and listings: the whole product's code if it has
    // one, else the cheapest colour that is in stock (or, if none is, the
    // cheapest colour).
    const lead =
      whole ??
      [...perColour].sort((a, b) => Number(b.inStock) - Number(a.inStock) || a.price - b.price)[0];
    if (!lead) continue;
    product.price = lead.price;
    product.mrp = lead.mrp;
    product.inStock = whole ? whole.inStock : perColour.some((e) => e.inStock);
  }

  applied = signature;
  version++;
  listeners.forEach((listener) => listener());
  return true;
}

/** The live price of one colour of a product, where it has its own SAP code. */
export function livePriceOf(productId: string, colour: string | null | undefined): { price: number; mrp: number } | undefined {
  if (!colour) return undefined;
  const entry = colourEntries.get(colourKey(productId, colour));
  return entry ? { price: entry.price, mrp: entry.mrp } : undefined;
}

/** Applies the last list this browser received, before the first render,
 *  so a returning visitor never sees the built-in prices flash first. */
export function applyCachedLiveCatalogue() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    if (Array.isArray(cached?.items)) applyLiveCatalogue(cached.items.filter(isEntry));
  } catch {
    // No cache or storage blocked — the fresh list will follow.
  }
}

/** Fetches the current list and applies it. Failures leave the page as it is. */
export async function refreshLiveCatalogue() {
  if (!API_URL) return;
  try {
    const res = await fetch(`${API_URL}/catalogue/live`, { credentials: 'omit' });
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data?.items)) return;
    const entries = (data.items as unknown[]).filter(isEntry);
    applyLiveCatalogue(entries);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items: entries }));
    } catch {
      // Storage full or blocked — fine, it is only a cache.
    }
  } catch {
    // Backend unreachable — the catalogue (or the cached list) stays.
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Re-renders the caller whenever a new live list is applied. Used once,
 *  at the top of the app, so the whole page picks up the new values. */
export function useLiveCatalogueVersion() {
  return useSyncExternalStore(subscribe, () => version);
}
