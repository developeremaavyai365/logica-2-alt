import { products, type Product } from './data';
import { coloursOf, type ProductColour } from './product-colours';

/* Suggesting which website product a SAP code is.

   SAP names and website names describe the same thing in different words
   ("HP 14 EP0341TU I3 8/512 SLV" and "HP Laptop14-ep0341TU, Silver"), so the
   suggestion is a word-overlap score in which each word counts by how rare
   it is in the catalogue: a model code ("ep0341tu", "s25") that only one or
   two products share outweighs a "8gb" or "5g" that hundreds do. When the
   sheet gives a brand, only that brand's products are considered. It only
   ever suggests: an admin confirms every link. */

export interface SapLike {
  modelName: string;
  sapName: string;
  brand: string | null;
  partNumber: string | null;
}

export interface Suggestion {
  product: Product;
  colour?: ProductColour;
  score: number;
}

const UNITS = /(\d+)[\s-]*(gb|tb|mb|inch|inches|in|hz|w|mah|mp|cm|mm)\b/g;
const UNIT_WORD = /^\d+(gb|tb|mb|inch|inches|in|hz|w|mah|mp|cm|mm)$/;

/** Lower-case words, with "128 GB" joined into "128gb". A word mixing
 *  letters and digits is kept whole and also split into its runs, so
 *  "laptop14" also matches "14" and "ep0341tu" also matches "0341". */
export function words(text: string): string[] {
  const base = text
    .toLowerCase()
    .replace(UNITS, '$1$2')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 1 || /\d/.test(w));
  const out: string[] = [];
  for (const w of base) {
    out.push(w);
    if (/[a-z]/.test(w) && /\d/.test(w) && !UNIT_WORD.test(w)) {
      for (const run of w.match(/[a-z]+|\d+/g) ?? []) if (run.length > 1 || /\d/.test(run)) out.push(run);
    }
  }
  return out;
}

const PRODUCT_WORDS = new Map(
  products.map((p) => [
    p.id,
    new Set(words(`${p.brand} ${p.name} ${p.id} ${coloursOf(p.id).map((c) => c.name).join(' ')}`)),
  ]),
);

/** How many products each word appears in. */
const FREQUENCY = new Map<string, number>();
for (const set of PRODUCT_WORDS.values()) for (const w of set) FREQUENCY.set(w, (FREQUENCY.get(w) ?? 0) + 1);
const rarity = (word: string) => Math.log((products.length + 1) / (FREQUENCY.get(word) ?? 1));

/** The colour of a product that the SAP name mentions, longest name first
 *  so "Phantom Black" wins over "Black". */
export function colourIn(productId: string, text: string): ProductColour | undefined {
  const haystack = ` ${words(text).join(' ')} `;
  return [...coloursOf(productId)]
    .sort((a, b) => b.name.length - a.name.length)
    .find((c) => haystack.includes(` ${words(c.name).join(' ')} `));
}

export function suggestProducts(item: SapLike, limit = 3): Suggestion[] {
  // Only words the catalogue uses can match anything; the rest are left out
  // of the score rather than counted against every product alike.
  const itemWords = [...new Set(words(`${item.modelName} ${item.sapName} ${item.partNumber ?? ''}`))].filter((w) =>
    FREQUENCY.has(w),
  );
  const total = itemWords.reduce((sum, w) => sum + rarity(w), 0);
  if (total === 0) return [];
  const brand = item.brand?.trim().toLowerCase();

  const scored: Suggestion[] = [];
  for (const product of products) {
    if (brand && product.brand.toLowerCase() !== brand) continue;
    const productWords = PRODUCT_WORDS.get(product.id)!;
    const shared = itemWords.reduce((sum, w) => sum + (productWords.has(w) ? rarity(w) : 0), 0);
    const score = shared / total;
    if (score >= 0.3) scored.push({ product, score, colour: colourIn(product.id, `${item.modelName} ${item.sapName}`) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Website products whose brand, name or id contain every word typed. */
export function searchProducts(query: string, limit = 8): Product[] {
  const typed = words(query);
  if (typed.length === 0) return [];
  return products
    .filter((p) => {
      const productWords = [...PRODUCT_WORDS.get(p.id)!];
      return typed.every((t) => productWords.some((w) => w.startsWith(t)));
    })
    .slice(0, limit);
}
