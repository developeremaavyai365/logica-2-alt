/* Where the website's product catalogue comes from.

   The catalogue (products, their details, photo galleries and colours) is
   managed in the admin panel and served by the backend at
   /catalogue/products. It is loaded once, before the site's code runs (see
   main.tsx), so every page and every lookup built from it sees the same
   list, and nothing has to be rebuilt while the shopper browses.

   - A browser that has a saved copy starts with it at once, and fetches the
     current one in the background for its next visit.
   - A first visit waits briefly for the backend.
   - If the backend cannot be reached, the catalogue built into the site
     (products-data.ts and the files beside it) is used, as before.

   This module must not import the data files: they read from it. */

import type { Product } from './products-data';
import type { ProductDetail } from './product-details-data';
import type { ProductColour } from './product-colours';

export interface ServerCatalogue {
  version: string;
  products: Product[];
  details: Record<string, ProductDetail>;
  gallery: Record<string, string[]>;
  colours: Record<string, { colours: ProductColour[]; shared: string[] }>;
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const CACHE_KEY = 'logica2-catalogue';
/** How long a first visit waits for the backend before using the built-in list. */
const FIRST_VISIT_WAIT_MS = 2500;

let loaded: ServerCatalogue | null = null;

/** The catalogue from the backend, or null to use the built-in one. */
export function serverCatalogue(): ServerCatalogue | null {
  return loaded;
}

function isCatalogue(data: unknown): data is ServerCatalogue {
  const c = data as ServerCatalogue | null;
  return (
    !!c &&
    typeof c.version === 'string' &&
    Array.isArray(c.products) &&
    c.products.length > 0 &&
    typeof c.details === 'object' &&
    typeof c.gallery === 'object' &&
    typeof c.colours === 'object'
  );
}

function readCache(): ServerCatalogue | null {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    return isCatalogue(data) ? data : null;
  } catch {
    return null;
  }
}

function writeCache(catalogue: ServerCatalogue) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(catalogue));
  } catch {
    // Storage full or blocked: the next visit fetches again.
  }
}

async function fetchCatalogue(timeoutMs?: number): Promise<ServerCatalogue | null> {
  const controller = new AbortController();
  const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
  try {
    // Always check with the server: the browser sends the version it has
    // and gets a short "not modified" when nothing changed, instead of
    // reusing a copy that may be up to a minute old.
    const res = await fetch(`${API_URL}/catalogue/products`, { credentials: 'omit', cache: 'no-cache', signal: controller.signal });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return isCatalogue(data) ? data : null;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Decides which catalogue this visit uses. Call once, before the site's
 *  code is imported. Never rejects. */
export async function loadCatalogue(): Promise<void> {
  if (!API_URL) return;

  const cached = readCache();
  // A link to a product the saved copy does not have yet (one published
  // since this browser's last visit) waits for the current list, so the
  // page opens on the product instead of "not found".
  const opening = /^\/product\/([^/?#]+)/.exec(window.location.pathname)?.[1];
  if (cached && opening && !cached.products.some((p) => p.id === decodeURIComponent(opening))) {
    const fresh = await fetchCatalogue(FIRST_VISIT_WAIT_MS);
    loaded = fresh ?? cached;
    if (fresh) writeCache(fresh);
    return;
  }

  if (cached) {
    loaded = cached;
    // Fresh copy for next time.
    void fetchCatalogue().then((fresh) => {
      if (fresh && fresh.version !== cached.version) writeCache(fresh);
    });
    return;
  }

  const fresh = await fetchCatalogue(FIRST_VISIT_WAIT_MS);
  if (fresh) {
    loaded = fresh;
    writeCache(fresh);
  }
}
