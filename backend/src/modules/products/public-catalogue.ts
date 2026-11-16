/* The catalogue as the website reads it.

   The shop was built on four data files — products, their details, their
   photo galleries and their colours — and every page reads those shapes.
   The database is shaped for editing instead, so this turns its rows back
   into exactly those four, letting the website swap its built-in files for
   the database without changing a page. */

/** A product row with what the shop needs of its brand, category and colours. */
export interface CatalogueRow {
  slug: string;
  name: string;
  description: string;
  position: number;
  priceInPaise: number;
  mrpInPaise: number | null;
  inStock: boolean;
  imageUrl: string;
  gallery: string[];
  sharedImages: string[];
  highlights: string[];
  specs: unknown;
  attrs: unknown;
  rating: number | null;
  reviewCount: number | null;
  updatedAt: Date;
  brand: { name: string } | null;
  category: { slug: string };
  colours: {
    key: string;
    name: string;
    hex: string;
    family: string[];
    images: string[];
    inStock: boolean | null;
    position: number;
  }[];
}

export interface ShopProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp?: number;
  image: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  attrs?: Record<string, string>;
}

export interface ShopColour {
  key: string;
  name: string;
  hex: string;
  family: string[];
  images: string[];
  inStock?: boolean;
}

export interface PublicCatalogue {
  /** Changes whenever any product does, so a browser can tell whether its
   *  saved copy is still current. */
  version: string;
  products: ShopProduct[];
  details: Record<string, { highlights: string[]; specs: [string, string][]; overview?: string }>;
  gallery: Record<string, string[]>;
  colours: Record<string, { colours: ShopColour[]; shared: string[] }>;
}

const rupees = (paise: number) => Math.round(paise) / 100;

function specPairs(specs: unknown): [string, string][] {
  if (!Array.isArray(specs)) return [];
  return specs.filter(
    (pair): pair is [string, string] => Array.isArray(pair) && pair.length === 2 && typeof pair[0] === 'string' && typeof pair[1] === 'string',
  );
}

export function toPublicCatalogue(rows: CatalogueRow[]): PublicCatalogue {
  const sorted = [...rows].sort((a, b) => a.position - b.position || a.slug.localeCompare(b.slug));
  const catalogue: PublicCatalogue = { version: catalogueVersion(rows), products: [], details: {}, gallery: {}, colours: {} };

  for (const row of sorted) {
    const product: ShopProduct = {
      id: row.slug,
      name: row.name,
      brand: row.brand?.name ?? '',
      category: row.category.slug,
      price: rupees(row.priceInPaise),
      image: row.imageUrl,
      inStock: row.inStock,
    };
    if (row.mrpInPaise != null) product.mrp = rupees(row.mrpInPaise);
    if (row.rating != null) product.rating = row.rating;
    if (row.reviewCount != null) product.reviews = row.reviewCount;
    if (row.attrs && typeof row.attrs === 'object' && !Array.isArray(row.attrs)) product.attrs = row.attrs as Record<string, string>;
    catalogue.products.push(product);

    const specs = specPairs(row.specs);
    if (row.highlights.length > 0 || specs.length > 0 || row.description) {
      catalogue.details[row.slug] = { highlights: row.highlights, specs, ...(row.description && { overview: row.description }) };
    }
    if (row.gallery.length > 0) catalogue.gallery[row.slug] = row.gallery;
    if (row.colours.length > 0) {
      catalogue.colours[row.slug] = {
        colours: [...row.colours]
          .sort((a, b) => a.position - b.position)
          .map((c) => ({
            key: c.key,
            name: c.name,
            hex: c.hex,
            family: c.family,
            images: c.images,
            ...(c.inStock != null && { inStock: c.inStock }),
          })),
        shared: row.sharedImages,
      };
    }
  }
  return catalogue;
}

/** How many products, and when the latest of them changed. */
export function catalogueVersion(rows: { updatedAt: Date }[]): string {
  const latest = rows.reduce((max, r) => Math.max(max, r.updatedAt.getTime()), 0);
  return `${rows.length}-${latest}`;
}
