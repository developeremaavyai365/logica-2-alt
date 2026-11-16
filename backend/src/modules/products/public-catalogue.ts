/* The catalogue as the website reads it.

   The shop was built on four data files — products, their details, their
   photo galleries and their colours — and every page reads those shapes.
   The database is shaped for editing instead, so this turns its rows back
   into exactly those four, letting the website swap its built-in files for
   the database without changing a page. */

import { TitleFormatRule, buildTitle, pickTitleFormat } from './title-format';

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
  // The title's parts, and the listing details shoppers are shown.
  titleAuto?: boolean;
  modelName?: string | null;
  modelNumber?: string | null;
  variant?: string | null;
  inTheBox?: string | null;
  warranty?: string | null;
  warrantyPeriod?: string | null;
  warrantyServiceType?: string | null;
  warrantyCovered?: string | null;
  countryOfOrigin?: string | null;
  manufacturerDetails?: string | null;
  packerDetails?: string | null;
  importerDetails?: string | null;
  videoUrl?: string | null;
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
  /** The product's title with this colour chosen, for a title built from
   *  the brand's format. */
  title?: string;
}

/** What a product page shows besides the specs: the box, the warranty, and
 *  the origin and maker details Indian e-commerce rules require. Only the
 *  parts filled in are sent. */
export interface ShopInfo {
  modelNumber?: string;
  inTheBox?: string;
  warranty?: { summary?: string; period?: string; serviceType?: string; covered?: string };
  countryOfOrigin?: string;
  manufacturer?: string;
  packer?: string;
  importer?: string;
  videoUrl?: string;
}

export interface PublicCatalogue {
  /** Changes whenever any product does, so a browser can tell whether its
   *  saved copy is still current. */
  version: string;
  products: ShopProduct[];
  details: Record<string, { highlights: string[]; specs: [string, string][]; overview?: string; info?: ShopInfo }>;
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

/** The filled-in parts of a product's details, or undefined if none is. */
function infoOf(row: CatalogueRow): ShopInfo | undefined {
  const t = (s: string | null | undefined) => (s && s.trim() ? s.trim() : undefined);
  const warranty = {
    summary: t(row.warranty),
    period: t(row.warrantyPeriod),
    serviceType: t(row.warrantyServiceType),
    covered: t(row.warrantyCovered),
  };
  const info: ShopInfo = {
    modelNumber: t(row.modelNumber),
    inTheBox: t(row.inTheBox),
    warranty: Object.values(warranty).some(Boolean) ? warranty : undefined,
    countryOfOrigin: t(row.countryOfOrigin),
    manufacturer: t(row.manufacturerDetails),
    packer: t(row.packerDetails),
    importer: t(row.importerDetails),
    videoUrl: t(row.videoUrl),
  };
  // Leave out what is empty, so the catalogue stays small.
  const filled = Object.fromEntries(
    Object.entries(info)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined)) : v]),
  ) as ShopInfo;
  return Object.keys(filled).length ? filled : undefined;
}

export function toPublicCatalogue(rows: CatalogueRow[], titleFormats: TitleFormatRule[] = []): PublicCatalogue {
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
    const info = infoOf(row);
    if (row.highlights.length > 0 || specs.length > 0 || row.description || info) {
      catalogue.details[row.slug] = {
        highlights: row.highlights,
        specs,
        ...(row.description && { overview: row.description }),
        ...(info && { info }),
      };
    }
    if (row.gallery.length > 0) catalogue.gallery[row.slug] = row.gallery;
    if (row.colours.length > 0) {
      // An automatic title is built again for each colour: "Samsung Galaxy
      // S24 5G (Amber Yellow, 8 GB RAM, 256 GB Storage)" when Amber Yellow
      // is chosen.
      const brand = row.brand?.name ?? '';
      const pattern = row.titleAuto ? pickTitleFormat(brand, row.category.slug, titleFormats).pattern : null;
      const input = { brand, modelName: row.modelName ?? null, modelNumber: row.modelNumber ?? null, variant: row.variant ?? null, specs: specs.map(([label, value]) => ({ label, value })) };
      catalogue.colours[row.slug] = {
        colours: [...row.colours]
          .sort((a, b) => a.position - b.position)
          .map((c) => {
            const title = pattern ? buildTitle(pattern, input, c.name) : '';
            return {
              key: c.key,
              name: c.name,
              hex: c.hex,
              family: c.family,
              images: c.images,
              ...(c.inStock != null && { inStock: c.inStock }),
              ...(title.length >= 3 && { title }),
            };
          }),
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
