import type { Product } from './data';

/** Facet groups shown in the filter sidebar, in display order. Mirrors
 *  logicainfoway.com's facets exactly. */
export const FACET_ORDER = [
  'Colour',
  'Dedicated Graphics Memory',
  'Hard Disk Capacity',
  'Operating System',
  'Processor',
  'Processor Generation',
  'RAM',
  'Screen Size',
  'Storage',
] as const;

export type FacetKey = (typeof FACET_ORDER)[number];

/** The full Colour attribute term list — transcribed from logicainfoway.com. */
export const SHOP_COLORS: string[] = [
  'Aluminum: Midnight', 'Aluminum: Midnight/Starlight', 'Aluminum: Pink/Light Pink', 'Aluminum: RED',
  'Aluminum: Silver/Blue', 'Aluminum: Silver/Storm Blue', 'Aluminum: Silver/Winter Blue', 'Aluminum: Starlight',
  'Amber Yellow', 'Arctic Grey', 'Aurora Gold', 'Awesome Graphite', 'Awesome Iceblue', 'Awesome Lime',
  'Awesome Navy', 'Awesome Violet', 'Beige', 'Berry Blue', 'Black', 'Black Dusk', 'Black Titanium', 'Blue',
  'Blue Black', 'Blue Tide', 'Blue Titanium', 'Burgundy', 'Celadon Marble', 'Chromatic Gray', 'Cobalt Violet',
  'Cosmos Black', 'Cream', 'Crystal Purple', 'Dark Blue', 'Dark Chrome', 'Dark Purple', 'Deep Purple',
  'Diamond Silver', 'Emerald Green', 'Forest Green', 'Frosted Green', 'Galactic Silver', 'Glimmer Black',
  'Glitter Aqua', 'Glowing Black', 'Glowing Blue', 'Gold', 'Graphite', 'Graphite Black', 'Graphite Grey',
  'Gray', 'Gray Shadow', 'Green', 'Grey', 'Horizon Blue', 'Icy Blue', 'Icy Silver', 'Jade Black', 'Jade Fog',
  'Lavendar', 'Light Blue', 'Light Green', 'Magic Blue', 'Matte Black', 'Metallic Blue', 'Meteor Blue',
  'Midnight Black', 'Midnight Blue', 'Mint', 'Mint Green', 'Moonstone Silver', 'Mystique Blue', 'Noble Black',
  'Noir Black', 'OASIS GREEN', 'Olive', 'Olive Green', 'Onyx Black', 'Opera Mauve', 'Orange', 'Pacific Blue',
  'Pastel Blue', 'Pastel Lime', 'Pearl White', 'Phantom Black', 'Phantom White', 'Pink', 'Platinum Grey',
  'Prism Silver', 'Purple', 'Red', 'Rock Grey', 'Sierra Black', 'Silver', 'Silver / White', 'Slate Grey',
  'Smoky Teal', 'Solar Red', 'Sonic Black', 'Space Black', 'Space Grey', 'Stainless Steel: Gold/Clay Sport',
  'Stainless Steel: Silver', 'Stainless Steel: Silver/Storm Blue', 'Stardust Black', 'Stardust Silver',
  'Stardust White', 'Starlight', 'Starlight Black', 'Starshine Green', 'Startail Silver', 'Submarine Blue',
  'Sunny Oasis', 'SUNRISE BEIGE', 'Sunrise Gold', 'Sunrise Orange', 'Teal', 'Titan Grey', 'Titanium Black',
  'Titanium Blue', 'Titanium Gray', 'Titanium Silver', 'Titanium Violet', 'Transparent Silver', 'Twilight Gold',
  'Ultramarine', 'Waterfall Blue', 'White', 'White Titanium', 'Yellow',
];

export interface FacetGroup {
  key: FacetKey;
  options: { value: string; count: number }[];
}

/** Build the facet groups available for a given product set, in display
 *  order. The scraped catalog has no structured spec attrs, so on this
 *  data these will come back empty — same as the live site, which only
 *  ever shows a facet group once at least one product actually has that
 *  attribute populated. */
export function buildFacets(products: Product[]): FacetGroup[] {
  const groups: FacetGroup[] = [];
  for (const key of FACET_ORDER) {
    if (key === 'Colour') continue; // handled separately via the full master list
    const counts = new Map<string, number>();
    for (const p of products) {
      const v = (p as Product & { attrs?: Partial<Record<FacetKey, string>> }).attrs?.[key];
      if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    if (counts.size > 0) {
      groups.push({
        key,
        options: Array.from(counts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true })),
      });
    }
  }
  return groups;
}

/** Exact [min, max] price across a product set — drives the price slider bounds. */
export function getPriceBounds(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 0];
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return [min, max];
}

/** A sensible slider step for a given price span. */
export function priceStepFor(span: number): number {
  if (span > 100000) return 5000;
  if (span > 40000) return 1000;
  if (span > 10000) return 500;
  if (span > 2000) return 100;
  return 50;
}

/** A vivid accent color per category, used for slider fill, checkboxes,
 *  active-page pill, etc. in the filter UI. */
export const CATEGORY_FILTER_ACCENT: Record<string, string> = {
  laptops: '#000000',
  'mobile-phones': '#000000',
  accessories: '#000000',
  desktops: '#000000',
  monitors: '#000000',
  printers: '#000000',
  'storage-devices': '#000000',
  software: '#000000',
  'laptop-bags': '#000000',
  wireless: '#000000',
};
