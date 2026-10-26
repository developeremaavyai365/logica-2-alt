import { categories, products } from './data';
import { subCategoriesOf } from './nav-data';
import type { Product } from './products-data';
import { colourForWord, type ProductColour } from './product-colours';

/* Suggestions for the shop search box, and the rule for when a search is
   really the name of a part of the shop ("iphone", "printers", "ssd") and
   should go straight to that page instead of filtering the grid.

   Only destinations that have products in them are offered, so a search
   never lands on an empty page. */

export interface SearchDestination {
  kind: 'category' | 'sub';
  label: string;
  /** The category a sub-category sits in, for the second line of a row. */
  parentLabel?: string;
  categorySlug: string;
  href: string;
  count: number;
  /** Normalised names the destination answers to, label included. */
  aliases: string[];
}

export interface BrandSuggestion {
  brand: string;
  href: string;
  count: number;
}

export interface ProductMatch {
  product: Product;
  colour?: ProductColour;
}

export interface SearchSuggestions {
  destinations: SearchDestination[];
  brands: BrandSuggestion[];
  /** Matching products, each with the colour the query asked for, if it
   *  named one the product comes in ("blue iphone"). */
  products: ProductMatch[];
  /** The destination the query names outright, which Enter goes to. */
  exact?: SearchDestination;
}

/** Lower-case, punctuation to spaces, single-spaced: "2-in-1" → "2 in 1". */
export function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Whether two normalised names are the same word, give or take a plural:
 *  "iphones" = "iphone", "watches" = "watch", "accessories" = "accessory". */
function sameName(a: string, b: string) {
  const plural = (s: string) => [s, `${s}s`, `${s}es`, s.endsWith('y') ? `${s.slice(0, -1)}ies` : s];
  return plural(a).includes(b) || plural(b).includes(a);
}

/** What people type besides the menu label. Keyed by category slug, or by
 *  `slug:keyword` for a sub-category. */
const EXTRA_ALIASES: Record<string, string[]> = {
  laptops: ['laptop', 'notebook'],
  'mobile-phones': ['mobile', 'phone', 'mobile phone', 'cell phone'],
  accessories: ['accessory'],
  desktops: ['desktop', 'pc', 'computer'],
  monitors: ['monitor', 'display', 'screen'],
  printers: ['printer'],
  'storage-devices': ['storage', 'storage device', 'hard disk', 'hard drive'],
  software: ['software'],
  'laptop-bags': ['laptop bag', 'bag', 'backpack'],
  wireless: ['wireless audio'],

  'laptops:macbook': ['mac book', 'macbook air', 'macbook pro', 'mac'],
  'laptops:gaming': ['gaming', 'gaming laptop'],
  'laptops:homeschooling': ['homeschooling', 'student laptop', 'chromebook'],
  'laptops:2-in-1': ['2 in 1', 'convertible', 'x360'],
  'mobile-phones:iphone': ['iphone', 'apple iphone', 'apple phone'],
  'mobile-phones:ipad': ['ipad', 'apple ipad'],
  'mobile-phones:tablet': ['tablet', 'tab'],
  'mobile-phones:smartphone': ['smartphone', 'android', 'android phone'],
  'mobile-phones:feature': ['feature phone', 'keypad phone'],
  'accessories:adapter': ['adapter', 'adaptor', 'charger'],
  'accessories:cabinet': ['cabinet', 'pc cabinet'],
  'accessories:cooling': ['cpu fan', 'cpu cooler', 'cooling fan'],
  'accessories:headphone': ['headphone', 'earphone', 'headset'],
  'accessories:mouse': ['mouse', 'mice', 'gaming mouse'],
  'accessories:keyboard': ['keyboard'],
  'accessories:combo': ['keyboard mouse combo', 'keyboard and mouse'],
  'accessories:cooling pad': ['cooling pad', 'laptop cooling pad', 'laptop cooler'],
  'accessories:power bank': ['power bank', 'powerbank'],
  'accessories:watch': ['watch', 'smart watch', 'smartwatch'],
  'accessories:smps': ['smps', 'power supply'],
  'accessories:webcam': ['webcam', 'web cam'],
  'desktops:all-in-one': ['all in one', 'aio', 'all in one pc'],
  'desktops:tower': ['tower', 'tower pc'],
  'printers:tank': ['ink tank', 'ink tank printer'],
  'printers:inkjet': ['inkjet', 'inkjet printer'],
  'printers:laser': ['laser', 'laserjet', 'laser printer'],
  'storage-devices:external': ['external hard disk', 'external hdd', 'external drive'],
  'storage-devices:internal': ['internal hard disk', 'internal hdd', 'hdd'],
  'storage-devices:pen drive': ['pen drive', 'pendrive', 'usb drive', 'flash drive'],
  'storage-devices:ssd': ['ssd', 'solid state drive'],
  'software:security': ['antivirus', 'anti virus', 'security'],
  'software:windows': ['windows', 'operating system', 'os'],
  'wireless:buds': ['buds', 'earbuds', 'tws', 'true wireless'],
};

const unique = (list: string[]) => Array.from(new Set(list.map(normalise).filter(Boolean)));

// Sub-categories come first so that, where a word could mean either, the
// more specific page wins.
export const DESTINATIONS: SearchDestination[] = [
  ...categories.flatMap((c) =>
    subCategoriesOf(c.slug).map<SearchDestination>((s) => ({
      kind: 'sub',
      label: s.label,
      parentLabel: c.name,
      categorySlug: c.slug,
      href: s.href,
      count: products.filter((p) => p.category === c.slug && s.test(p.name)).length,
      aliases: unique([s.label, s.keyword, ...(EXTRA_ALIASES[`${c.slug}:${s.keyword}`] ?? [])]),
    })),
  ),
  ...categories.map<SearchDestination>((c) => ({
    kind: 'category',
    label: c.name,
    categorySlug: c.slug,
    href: `/shop/${c.slug}`,
    count: products.filter((p) => p.category === c.slug).length,
    aliases: unique([c.name, c.slug, ...(EXTRA_ALIASES[c.slug] ?? [])]),
  })),
].filter((d) => d.count > 0);

const BRANDS: BrandSuggestion[] = Array.from(
  products.reduce((counts, p) => counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1), new Map<string, number>()),
)
  .map(([brand, count]) => ({ brand, count, href: `/shop?brand=${encodeURIComponent(brand)}` }))
  .sort((a, b) => b.count - a.count);

const PRODUCT_TEXT = new Map(products.map((p) => [p.id, normalise(`${p.brand} ${p.name}`)]));

/** Whether a product answers to a search, and in which colour. Every word
 *  must be found in the brand and name — a plural finds the singular too
 *  ("printers" → "Printer") — or be a colour the product comes in, so
 *  "blue iphone" finds an iPhone sold in blue even though "blue" is not in
 *  its name, and opens it on that colour. Null when it does not match. */
export function matchProduct(product: Product, query: string): ProductMatch | null {
  const q = normalise(query);
  if (!q) return { product };
  const text = PRODUCT_TEXT.get(product.id) ?? normalise(`${product.brand} ${product.name}`);
  let colour: ProductColour | undefined;
  for (const t of q.split(' ')) {
    if (text.includes(t) || (t.length > 3 && t.endsWith('s') && text.includes(t.slice(0, -1)))) continue;
    const named = colourForWord(product.id, t);
    if (!named) return null;
    colour = named;
  }
  return { product, colour };
}

/** How well a name matches the query: 3 the same name, 2 starts with it,
 *  1 has a word starting with it, 0 not at all. */
function nameScore(name: string, q: string) {
  if (sameName(name, q)) return 3;
  if (name.startsWith(q)) return 2;
  if (q.length >= 2 && name.includes(` ${q}`)) return 1;
  // "iphone 16" still points at the iPhones page.
  if (q.startsWith(`${name} `)) return 1;
  return 0;
}

/** The destination a query names outright, if it is one we have products for. */
export function exactDestination(query: string): SearchDestination | undefined {
  const q = normalise(query);
  if (!q) return undefined;
  return DESTINATIONS.find((d) => d.aliases.some((a) => sameName(a, q)));
}

export function searchSuggestions(query: string): SearchSuggestions {
  const q = normalise(query);
  if (!q) return { destinations: [], brands: [], products: [] };

  const destinations = DESTINATIONS.map((d) => ({ d, score: Math.max(...d.aliases.map((a) => nameScore(a, q))) }))
    .filter((x) => x.score > 0)
    // Stable sort: equal scores keep sub-categories ahead of categories.
    .sort((a, b) => b.score - a.score || b.d.count - a.d.count)
    .slice(0, 5)
    .map((x) => x.d);

  const brands = BRANDS.filter((b) => nameScore(normalise(b.brand), q) > 0).slice(0, 3);

  const matched = products
    .map((p) => matchProduct(p, q))
    .filter((m): m is ProductMatch => m !== null)
    .sort(
      (a, b) =>
        Number(b.product.inStock) - Number(a.product.inStock) ||
        Number(normalise(b.product.name).startsWith(q)) - Number(normalise(a.product.name).startsWith(q)) ||
        (b.product.rating ?? 0) - (a.product.rating ?? 0),
    )
    .slice(0, 5);

  return { destinations, brands, products: matched, exact: exactDestination(query) };
}

/** Shown when the box is focused and still empty. Picked from the busiest
 *  corners of the shop, and only the ones that have stock listed. */
const POPULAR_KEYS = ['iphone', 'macbook', 'gaming', 'smartphone', 'tank', 'ssd', 'watch', 'buds'];

export const POPULAR_DESTINATIONS: SearchDestination[] = POPULAR_KEYS.map((k) =>
  DESTINATIONS.find((d) => d.kind === 'sub' && d.href.endsWith(`sub=${encodeURIComponent(k)}`)),
).filter((d): d is SearchDestination => !!d);
