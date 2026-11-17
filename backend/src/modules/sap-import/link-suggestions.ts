/* Suggested links between new item codes from the SAP sheet and the shop's
   products, so a person only has to confirm each one instead of searching.

   A code is matched, most sure first, by the same barcode, the same model
   or part number, or a name that is nearly the same. Only a clear winner is
   suggested; a code that could be several products is left for a person to
   link by hand. Nothing here links anything: each suggestion is confirmed
   with the ordinary link. */

export interface SuggestItem {
  sapCode: string;
  sapName: string;
  modelName: string;
  ean: string | null;
  partNumber: string | null;
  mopInPaise: number;
  stock: number;
}

export interface SuggestProduct {
  slug: string;
  name: string;
  imageUrl: string;
  ean: string | null;
  partNumber: string | null;
  modelNumber: string | null;
  colours: { key: string; name: string; family: string[]; ean: string | null }[];
}

export interface Suggestion {
  sapCode: string;
  modelName: string;
  sapName: string;
  mopInPaise: number;
  stock: number;
  product: { slug: string; name: string; imageUrl: string };
  colour: { key: string; name: string } | null;
  /** Why it is suggested, in words: "Same barcode number". */
  reason: string;
  /** 0-1, how sure. */
  score: number;
}

const STOP = new Set(['the', 'with', 'and', 'for', 'of', 'a', 'an', 'in', 'by', 'to']);

/** Lower-case words of letters and digits, without filler words. */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w));
}

const squash = (text: string | null | undefined) => (text ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** How well a sheet name matches a product name: mostly how much of the
 *  sheet's name is in the product's, a little for the overlap overall. */
export function nameScore(sheetName: string, productName: string, ignore: Set<string> = new Set()): number {
  const a = new Set(words(sheetName).filter((w) => !ignore.has(w)));
  const b = new Set(words(productName));
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  const contained = shared / a.size;
  const overlap = shared / new Set([...a, ...b]).size;
  return 0.7 * contained + 0.3 * overlap;
}

/** The colour of a product the sheet's names mention, if any. */
function colourIn(item: SuggestItem, product: SuggestProduct): SuggestProduct['colours'][number] | null {
  const said = new Set([...words(item.modelName), ...words(item.sapName)]);
  return (
    product.colours.find((c) => {
      const name = words(c.name);
      return name.length > 0 && name.every((w) => said.has(w));
    }) ?? null
  );
}

const NAME_MIN = 0.75;
const NAME_MARGIN = 0.1;
const MIN_PART_LENGTH = 6;

/** Suggestions for the codes not yet linked. `taken` holds the product
 *  slots already linked, as "slug|colourKey" ("slug|" for the whole
 *  product); each slot is suggested to one code at most. */
export function suggestLinks(items: SuggestItem[], products: SuggestProduct[], taken: Set<string>): Suggestion[] {
  const candidates: Suggestion[] = [];

  for (const item of items) {
    let best: { product: SuggestProduct; colour: SuggestProduct['colours'][number] | null; reason: string; score: number } | null = null;

    // 1. The same barcode, on the product or one of its colours.
    if (item.ean) {
      for (const p of products) {
        const colour = p.colours.find((c) => c.ean === item.ean) ?? null;
        if (colour || p.ean === item.ean) {
          best = { product: p, colour, reason: 'Same barcode number', score: 1 };
          break;
        }
      }
    }

    // 2. The same model or part number, as a field or inside the name.
    const part = squash(item.partNumber);
    if (!best && part.length >= MIN_PART_LENGTH) {
      const matches = products.filter(
        (p) => squash(p.partNumber) === part || squash(p.modelNumber) === part || squash(p.name).includes(part),
      );
      if (matches.length === 1) best = { product: matches[0], colour: null, reason: 'Same model number', score: 0.95 };
    }

    // 3. Nearly the same name, clearly ahead of the next closest product.
    if (!best) {
      const scored = products
        .map((p) => {
          // "iPhone 16 Ultramarine" is the product iPhone 16: its own colour
          // names do not count against it.
          const ignore = new Set(p.colours.flatMap((c) => words(c.name)));
          return { p, score: Math.max(nameScore(item.modelName, p.name, ignore), nameScore(item.sapName, p.name, ignore) - 0.05) };
        })
        .sort((x, y) => y.score - x.score);
      const [first, second] = scored;
      if (first && first.score >= NAME_MIN && (!second || first.score - second.score >= NAME_MARGIN)) {
        best = { product: first.p, colour: null, reason: 'Similar name', score: Math.round(first.score * 100) / 100 };
      }
    }

    if (!best) continue;
    const colour = best.colour ?? colourIn(item, best.product);
    if (taken.has(`${best.product.slug}|${colour?.key ?? ''}`)) continue;
    candidates.push({
      sapCode: item.sapCode,
      modelName: item.modelName,
      sapName: item.sapName,
      mopInPaise: item.mopInPaise,
      stock: item.stock,
      product: { slug: best.product.slug, name: best.product.name, imageUrl: best.product.imageUrl },
      colour: colour ? { key: colour.key, name: colour.name } : null,
      reason: best.reason,
      score: best.score,
    });
  }

  // One code per product slot: the surest match keeps it.
  const bySlot = new Map<string, Suggestion>();
  for (const s of candidates.sort((a, b) => b.score - a.score)) {
    const slot = `${s.product.slug}|${s.colour?.key ?? ''}`;
    if (!bySlot.has(slot)) bySlot.set(slot, s);
  }
  return [...bySlot.values()].sort((a, b) => b.score - a.score || a.sapCode.localeCompare(b.sapCode));
}
