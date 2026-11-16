import { useSyncExternalStore } from 'react';
import { products, type Product } from './data';
import { colourTitles, coloursOf } from './product-colours';

/* Live prices and stock from the SAP feed, laid over the built-in catalogue.

   The catalogue in the code holds every product's name, photos and details.
   For each product an admin has linked to a SAP code, the backend's
   /catalogue/live list carries the name for the website ("Model Name for
   Website" in the sheet), the current selling price (MOP), MRP and whether
   it is in stock — one entry for the whole product, or one per colour. Those values are written onto the catalogue's own product and
   colour objects, so every card, filter, product page and the cart show
   them without each having to look them up.

   A product with no link keeps the catalogue's values. If the list cannot
   be fetched, the last one received is used, and failing that the
   catalogue as built. */

export interface LiveEntry {
  productId: string;
  /** The colour's key, or null when the SAP code is the whole product. */
  colour: string | null;
  /** The sheet's "Model Name for Website". Missing from lists cached before
   *  names were sent. */
  name?: string;
  price: number;
  mrp: number;
  inStock: boolean;
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const CACHE_KEY = 'logica2-live-catalogue';

const byId = new Map(products.map((p) => [p.id, p]));

/** The catalogue's own values, saved before the first change so a later
 *  list can start from them again (a product unlinked since goes back). */
const originalProduct = new Map<string, Pick<Product, 'name' | 'price' | 'mrp' | 'inStock'>>();
const originalColourStock = new Map<string, boolean | undefined>();
/** Live entries per product colour, `${productId}|${colourKey}`. */
const colourEntries = new Map<string, LiveEntry>();
/** What has a SAP code and so can be ordered: per product, whether the
 *  whole product does and which colours do. */
const linked = new Map<string, { whole: boolean; colours: Set<string> }>();

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
  colourTitles.clear();
  linked.clear();
}

function isEntry(value: unknown): value is LiveEntry {
  const e = value as LiveEntry;
  return (
    !!e &&
    typeof e.productId === 'string' &&
    (e.colour === null || typeof e.colour === 'string') &&
    (e.name === undefined || typeof e.name === 'string') &&
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
    if (!originalProduct.has(id)) {
      originalProduct.set(id, { name: product.name, price: product.price, mrp: product.mrp, inStock: product.inStock });
    }

    const colours = coloursOf(id);
    const whole = list.find((e) => e.colour === null);
    const perColour = list.filter((e) => e.colour !== null && colours.some((c) => c.key === e.colour));
    linked.set(id, { whole: !!whole, colours: new Set(perColour.map((e) => e.colour!)) });

    // A product sold colour by colour: each linked colour takes its own
    // stock, and a colour with no SAP code cannot be bought.
    if (perColour.length > 0) {
      for (const c of colours) {
        const key = colourKey(id, c.key);
        if (!originalColourStock.has(key)) originalColourStock.set(key, c.inStock);
        const entry = perColour.find((e) => e.colour === c.key);
        c.inStock = entry ? entry.inStock : false;
        if (entry) colourEntries.set(key, entry);
        // That colour's own name from the sheet, shown when it is chosen.
        const colourName = entry?.name?.trim();
        if (colourName) colourTitles.set(key, colourName);
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
    // The name on cards and listings. For a product sold colour by colour
    // this is the lead colour's name; the colour words in it are dropped
    // wherever the colour is shown separately.
    const leadName = lead.name?.trim();
    if (leadName) product.name = leadName;
    product.inStock = whole ? whole.inStock : perColour.some((e) => e.inStock);
  }

  applied = signature;
  version++;
  listeners.forEach((listener) => listener());
  return true;
}

/** Whether a live list has been applied (fresh or cached). Until then it
 *  is not known what can be ordered. */
export const liveCatalogueLoaded = () => applied !== '';

/** Whether a product (in a colour, for one sold colour by colour) has a SAP
 *  code, and so can be ordered online. Matches the server's rule: the
 *  colour's own code, else the whole product's. */
export function isOrderable(productId: string, colour?: string | null): boolean {
  const l = linked.get(productId);
  if (!l) return false;
  if (l.whole) return true;
  return colour ? l.colours.has(colour) : l.colours.size > 0;
}

/** A product's name before the sheet renamed it, if it did — so search
 *  still finds it by the old name and model number too. */
export function originalNameOf(productId: string): string | undefined {
  const original = originalProduct.get(productId)?.name;
  return original !== byId.get(productId)?.name ? original : undefined;
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
