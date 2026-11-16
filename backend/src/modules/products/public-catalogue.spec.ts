import { readFileSync } from 'fs';
import { join } from 'path';
import { CatalogueRow, catalogueVersion, toPublicCatalogue } from './public-catalogue';

// The import script's own row builders, so the test covers the real path:
// website data → database rows → the catalogue the website reads.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { productData, colourRows } = require('../../../scripts/import-catalogue.js');

interface SeedProduct {
  id: string;
  brand: string;
  category: string;
  position: number;
  details: { highlights: string[]; specs: [string, string][]; overview?: string } | null;
  gallery: string[];
  colours: { colours: unknown[]; shared?: string[] } | null;
  [key: string]: unknown;
}

const seed: { products: SeedProduct[] } = JSON.parse(readFileSync(join(__dirname, '../../../prisma/catalogue-seed.json'), 'utf8'));

/** A database row as the import script would write it. */
function rowFor(p: SeedProduct, updatedAt = new Date('2026-11-16T00:00:00Z')): CatalogueRow {
  const data = productData(p, 'category-id', 'brand-id');
  return {
    ...data,
    slug: p.id,
    attrs: data.attrs ?? null,
    updatedAt,
    brand: { name: p.brand.trim() },
    category: { slug: p.category },
    colours: colourRows(p),
  };
}

describe('the public catalogue', () => {
  const catalogue = toPublicCatalogue([...seed.products].reverse().map((p) => rowFor(p)));

  it('gives back every product exactly as the website had it, in the same order', () => {
    const original = seed.products.map(({ position, details, gallery, colours, ...product }) => product);
    expect(catalogue.products).toEqual(original);
  });

  it('gives back the details, galleries and colours exactly', () => {
    const details = Object.fromEntries(seed.products.filter((p) => p.details).map((p) => [p.id, p.details]));
    const gallery = Object.fromEntries(seed.products.filter((p) => p.gallery.length).map((p) => [p.id, p.gallery]));
    const colours = Object.fromEntries(
      seed.products.filter((p) => p.colours).map((p) => [p.id, { ...p.colours, shared: p.colours!.shared ?? [] }]),
    );
    expect(catalogue.details).toEqual(details);
    expect(catalogue.gallery).toEqual(gallery);
    expect(catalogue.colours).toEqual(colours);
  });

  it('turns paise back into rupees, keeping paise where there are some', () => {
    const [row] = [rowFor(seed.products[0])];
    const out = toPublicCatalogue([{ ...row, priceInPaise: 4_199_050, mrpInPaise: null }]);
    expect(out.products[0].price).toBe(41990.5);
    expect(out.products[0]).not.toHaveProperty('mrp');
  });

  it('changes its version when any product changes', () => {
    const rows = seed.products.slice(0, 3).map((p) => rowFor(p));
    const before = catalogueVersion(rows);
    rows[1] = { ...rows[1], updatedAt: new Date('2026-11-17T00:00:00Z') };
    expect(catalogueVersion(rows)).not.toBe(before);
    expect(catalogueVersion(rows.slice(0, 2))).not.toBe(catalogueVersion(rows));
  });
});
