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

describe('titles and details for the product page', () => {
  const phone: CatalogueRow = {
    slug: 'galaxy-s24',
    name: 'Samsung Galaxy S24 5G (Onyx Black, 8 GB RAM, 256 GB Storage)',
    description: '',
    position: 0,
    priceInPaise: 79_999_00,
    mrpInPaise: 89_999_00,
    inStock: true,
    imageUrl: '/a.jpg',
    gallery: ['/a.jpg'],
    sharedImages: [],
    highlights: [],
    specs: [
      ['RAM', '8 GB'],
      ['Internal Storage', '256 GB'],
    ],
    attrs: null,
    rating: null,
    reviewCount: null,
    updatedAt: new Date('2026-11-16T00:00:00Z'),
    titleAuto: true,
    modelName: 'Galaxy S24 5G',
    inTheBox: 'Handset, cable',
    warranty: '1 year manufacturer warranty',
    warrantyPeriod: '1 Year',
    countryOfOrigin: 'India',
    manufacturerDetails: 'Samsung India Electronics, Noida',
    packerDetails: '  ',
    brand: { name: 'Samsung' },
    category: { slug: 'mobile-phones' },
    colours: [
      { key: 'onyx-black', name: 'Onyx Black', hex: '#111111', family: ['black'], images: [], inStock: null, position: 0 },
      { key: 'amber-yellow', name: 'Amber Yellow', hex: '#F2C94C', family: ['yellow'], images: [], inStock: null, position: 1 },
    ],
  };

  it("gives each colour of an automatic title its own title, from the brand's format", () => {
    const { colours } = toPublicCatalogue([phone]);
    expect(colours['galaxy-s24'].colours.map((c) => c.title)).toEqual([
      'Samsung Galaxy S24 5G (Onyx Black, 8 GB RAM, 256 GB Storage)',
      'Samsung Galaxy S24 5G (Amber Yellow, 8 GB RAM, 256 GB Storage)',
    ]);
    // A title written by hand stays one title, whatever the colour.
    expect(toPublicCatalogue([{ ...phone, titleAuto: false }]).colours['galaxy-s24'].colours.every((c) => c.title === undefined)).toBe(true);
  });

  it("uses an admin's own format", () => {
    const { colours } = toPublicCatalogue([phone], [{ brand: 'samsung', category: 'mobile-phones', pattern: '{brand} {model} {storage} {colour}' }]);
    expect(colours['galaxy-s24'].colours[1].title).toBe('Samsung Galaxy S24 5G 256 GB Amber Yellow');
  });

  it('sends the box, warranty, origin and maker details filled in, and nothing empty', () => {
    expect(toPublicCatalogue([phone]).details['galaxy-s24'].info).toEqual({
      inTheBox: 'Handset, cable',
      warranty: { summary: '1 year manufacturer warranty', period: '1 Year' },
      countryOfOrigin: 'India',
      manufacturer: 'Samsung India Electronics, Noida',
    });
  });
});
