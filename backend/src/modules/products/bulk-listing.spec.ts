import { readFileSync } from 'fs';
import { join } from 'path';
import { readSheet } from '../sap-import/sheet-reader';
import { SheetRow } from '../sap-import/sap-import.types';
import { BulkContext, ExistingProduct, locateBulkHeader, planBulk } from './bulk-listing';
import { buildTemplate } from './bulk-template';
import { EMPTY_LISTING, Listing, SPEC_TEMPLATES } from './listing-rules';

interface SeedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp?: number;
  inStock: boolean;
  details: { highlights: string[]; specs: [string, string][]; overview?: string } | null;
  gallery: string[];
  colours: { colours: { key: string; name: string; hex: string; family: string[]; images: string[]; inStock?: boolean }[]; shared?: string[] } | null;
}

const seed: { categories: { slug: string; name: string }[]; products: SeedProduct[] } = JSON.parse(
  readFileSync(join(__dirname, '../../../prisma/catalogue-seed.json'), 'utf8'),
);

/** A seed product as it is stored once imported. */
const asListing = (p: SeedProduct): Listing => ({
  ...EMPTY_LISTING,
  name: p.name,
  categorySlug: p.category,
  brandName: p.brand,
  status: 'ACTIVE',
  priceInPaise: Math.round(p.price * 100),
  mrpInPaise: p.mrp != null ? Math.round(p.mrp * 100) : null,
  inStock: p.inStock,
  gallery: p.gallery,
  sharedImages: p.colours?.shared ?? [],
  highlights: p.details?.highlights ?? [],
  specs: (p.details?.specs ?? []).map(([label, value]) => ({ label, value })),
  description: p.details?.overview ?? '',
  modelNumber: null,
  partNumber: null,
  ean: null,
  hsnCode: null,
  gstRatePercent: null,
  warranty: null,
  inTheBox: null,
  colours: (p.colours?.colours ?? []).map((c) => ({ ...c, inStock: c.inStock ?? null, ean: null })),
});

const catalogue = (products: ExistingProduct[], barcodes: [string, string][] = []): BulkContext => ({
  categories: seed.categories,
  brands: [...new Set(seed.products.map((p) => p.brand))],
  existing: new Map(products.map((p) => [p.slug, p])),
  barcodeOwners: new Map(barcodes.map(([code, slug]) => [code, { slug, name: products.find((p) => p.slug === slug)!.listing.name }])),
  titleFormats: [],
});

const laptop: ExistingProduct = {
  slug: 'hp-15s',
  linkedToSap: false,
  listing: {
    ...asListing(seed.products.find((p) => p.category === 'laptops')!),
    name: 'HP 15s Core i5',
    brandName: 'HP',
    priceInPaise: 52_990_00,
    mrpInPaise: 61_990_00,
    gallery: ['/products/hp.jpg'],
    highlights: ['Core i5', '16 GB RAM', '512 GB SSD'],
    specs: [
      { label: 'Processor', value: 'Core i5-1335U' },
      { label: 'Item Weight', value: '1.6 kg' },
      { label: 'RAM', value: '16 GB' },
      { label: 'Storage', value: '512 GB SSD' },
      { label: 'Screen Size', value: '15.6 inch' },
      { label: 'Operating System', value: 'Windows 11' },
    ],
    colours: [],
  },
};

/** A sheet as rows of cells: headings first, numbered from row 1. */
const sheet = (headings: string[], ...data: unknown[][]): SheetRow[] =>
  [headings, ...data].map((cells, i) => ({ rowNumber: i + 1, cells }));

const plan = (rows: SheetRow[], ctx = catalogue([laptop])) => {
  const header = locateBulkHeader(rows);
  if (!header) throw new Error('no header');
  return planBulk(rows.slice(header.index + 1), header, ctx);
};

const errorsOf = (result: ReturnType<typeof plan>) => result.issues.filter((i) => i.severity === 'error').map((i) => i.message);

describe('reading the headings', () => {
  it('finds the headings below a title row, by their usual names, with spec columns and unknown ones set aside', () => {
    const header = locateBulkHeader(
      sheet(['Our products, November'], ['Product ID', 'Title *', 'Selling price (₹)', 'gst', 'Spec: RAM *', 'Notes']).slice(0),
    );
    expect(header).toMatchObject({
      index: 1,
      columns: { slug: 0, name: 1, price: 2, gstRatePercent: 3 },
      specColumns: [{ label: 'RAM', index: 4 }],
      ignored: ['Notes'],
    });
  });

  it('needs a Title or a Product ID column', () => {
    expect(locateBulkHeader(sheet(['SAP Code', 'Stock', 'MRP'], ['A1', 3, 100]))).toBeNull();
    expect(locateBulkHeader(sheet(['Product ID', 'Selling price'], ['hp-15s', 100]))).toMatchObject({ columns: { slug: 0, price: 1 } });
  });

  it('updates prices from a sheet of just Product ID and price, and refuses a new row there for want of a title', () => {
    const result = plan(sheet(['Product ID', 'Selling price'], ['hp-15s', 50990], ['', 999]));
    expect(result.toUpdate[0].changes).toEqual([{ field: 'priceInPaise', from: 52_990_00, to: 50_990_00 }]);
    expect(errorsOf(result)).toEqual(['No category: the sheet needs a Category column to add products.', 'No title: fill in the brand and model name to build it, or write a title.']);
  });
});

describe('adding products', () => {
  it('adds a draft for a row without a Product ID, matching category and brand by name', () => {
    const result = plan(sheet(['Title', 'Category', 'Brand', 'Selling price'], ['Dell Inspiron 15', 'laptops', 'dell', '₹45,990']));
    expect(errorsOf(result)).toEqual([]);
    expect(result.toCreate).toHaveLength(1);
    expect(result.toCreate[0].listing).toMatchObject({
      name: 'Dell Inspiron 15',
      categorySlug: 'laptops',
      brandName: 'Dell',
      status: 'DRAFT',
      priceInPaise: 45_990_00,
      inStock: true,
    });
  });

  it('warns about a brand not on the site, and a title already in use', () => {
    const result = plan(sheet(['Title', 'Category', 'Brand'], ['HP 15s Core i5', 'Laptops', 'Zebronics Pro']));
    expect(result.newBrands).toEqual(['Zebronics Pro']);
    expect(result.issues.map((i) => i.message)).toEqual([
      '"Zebronics Pro" is a new brand; it will be added.',
      'A product with this title is already on the site (ID hp-15s). This row adds another one.',
    ]);
  });

  it('refuses a new product without a category, or one that is not a category', () => {
    expect(errorsOf(plan(sheet(['Title', 'Brand'], ['Thing', 'HP'])))).toEqual(['No category: the sheet needs a Category column to add products.']);
    expect(errorsOf(plan(sheet(['Title', 'Category'], ['Thing', 'Toasters'])))[0]).toMatch(/^"Toasters" is not a category\. Use one of: /);
  });

  it('only makes a product Active when it is ready, and says what is missing', () => {
    const result = plan(sheet(['Title', 'Category', 'Brand', 'Status', 'Selling price'], ['Dell Inspiron 15', 'Laptops', 'Dell', 'Active', 45990]));
    expect(result.rejected).toBe(1);
    const message = errorsOf(result)[0];
    expect(message).toMatch(/^Not ready to be Active: Add the model name\. Fill in the RAM\./);
    expect(message).toContain('Add at least one photo.');
    expect(message).toMatch(/Set its Status to Draft to save it anyway\.$/);
  });
});

describe('editing products', () => {
  const headings = ['Product ID', 'Title', 'Selling price', 'MRP', 'Description', 'Spec: RAM', 'Spec: Storage', 'Other specs'];
  // Every spec without a column of its own, as the downloaded sheet lists them.
  const others = 'Processor: Core i5-1335U\nItem Weight: 1.6 kg\nScreen Size: 15.6 inch\nOperating System: Windows 11';

  it('changes only what the row changes, keeping columns the sheet leaves out', () => {
    const result = plan(sheet(headings, ['hp-15s', 'HP 15s Core i5', 49990, 61990, 'New description', '16 GB', '1 TB SSD', others]));
    expect(errorsOf(result)).toEqual([]);
    expect(result.toUpdate).toHaveLength(1);
    expect(result.toUpdate[0].changes).toEqual([
      { field: 'priceInPaise', from: 52_990_00, to: 49_990_00 },
      { field: 'description', from: laptop.listing.description, to: 'New description' },
      { field: 'spec:Storage', from: '512 GB SSD', to: '1 TB SSD' },
    ]);
    // Specs keep their order.
    expect(result.toUpdate[0].listing.specs.map((s) => s.label)).toEqual(['Processor', 'Item Weight', 'RAM', 'Storage', 'Screen Size', 'Operating System']);
    expect(result.toUpdate[0].listing.highlights).toEqual(laptop.listing.highlights);
  });

  it('clears a field whose cell is blank, and drops a spec no longer listed in "Other specs"', () => {
    const result = plan(sheet(headings, ['hp-15s', 'HP 15s Core i5', 52990, '', '', '16 GB', '', others.replace('Item Weight: 1.6 kg\n', '')]));
    const changes = result.toUpdate[0].changes.map((c) => c.field);
    expect(changes).toEqual(['mrpInPaise', 'description', 'spec:Item Weight', 'spec:Storage']);
  });

  it('keeps specs that no column of the sheet covers when it has no "Other specs" column', () => {
    const result = plan(sheet(['Product ID', 'Title', 'Spec: RAM'], ['hp-15s', 'HP 15s Core i5', '32 GB']));
    expect(result.toUpdate[0].changes).toEqual([{ field: 'spec:RAM', from: '16 GB', to: '32 GB' }]);
  });

  it('counts a row that changes nothing as unchanged', () => {
    const result = plan(sheet(headings, ['hp-15s', 'HP 15s Core i5', 52990, 61990, laptop.listing.description, '16 GB', '512 GB SSD', others]));
    expect(result).toMatchObject({ unchanged: 1, toUpdate: [], toCreate: [], issues: [] });
  });

  it("leaves the price and stock of a SAP-linked product to the SAP sheet, and says so", () => {
    const linked = { ...laptop, linkedToSap: true };
    const result = plan(sheet(['Product ID', 'Title', 'Selling price', 'In stock'], ['hp-15s', 'HP 15s Core i5 (2024)', 10, 'No']), catalogue([linked]));
    expect(result.toUpdate[0].changes).toEqual([{ field: 'name', from: 'HP 15s Core i5', to: 'HP 15s Core i5 (2024)' }]);
    expect(result.issues.map((i) => i.message)).toEqual([
      "Linked to a SAP code, so the SAP sheet sets its price and stock: this sheet's price, MRP and stock were not used.",
    ]);
    expect(result.priceAlerts).toEqual([]);
  });

  it('flags a price move of 40% or more for confirming', () => {
    const result = plan(sheet(['Product ID', 'Title', 'Selling price'], ['hp-15s', 'HP 15s Core i5', 5299]));
    expect(result.priceAlerts).toEqual([{ rowNumber: 2, slug: 'hp-15s', name: 'HP 15s Core i5', fromPaise: 52_990_00, toPaise: 5_299_00, percent: -90 }]);
  });

  it('reads status words, yes/no, GST written several ways, barcodes stored as numbers and photo lists', () => {
    const result = plan(
      sheet(
        ['Product ID', 'Title', 'Status', 'In stock', 'GST %', 'EAN / barcode', 'HSN code', 'Photos', 'Key highlights'],
        ['hp-15s', 'HP 15s Core i5', 'off the shop', 'no', 0.18, 8901234567890, 84713010, '/a.jpg, https://cdn.example.com/w_500,h_500/b.jpg; /c.jpg', '• One  \r\n\r\n• Two'],
      ),
    );
    expect(errorsOf(result)).toEqual([]);
    expect(result.toUpdate[0].listing).toMatchObject({
      status: 'INACTIVE',
      inStock: false,
      gstRatePercent: 18,
      ean: '8901234567890',
      hsnCode: '84713010',
      gallery: ['/a.jpg', 'https://cdn.example.com/w_500,h_500/b.jpg', '/c.jpg'],
      highlights: ['• One', '• Two'],
    });
    expect(plan(sheet(['Product ID', 'Title', 'GST %'], ['hp-15s', 'HP 15s Core i5', '18%'])).toUpdate[0].listing.gstRatePercent).toBe(18);
  });

  it('refuses rows it cannot use, each with the reason, and still reads the rest', () => {
    const other: ExistingProduct = { ...laptop, slug: 'dell-15', listing: { ...laptop.listing, name: 'Dell 15', ean: '4006381333931' } };
    const result = plan(
      sheet(
        ['Product ID', 'Title', 'EAN', 'GST %', 'Photos', 'Other specs'],
        ['no-such-product', 'Ghost', '', '', '', ''],
        ['hp-15s', 'HP 15s Core i5', '8901234567892', '', '', ''],
        ['hp-15s', 'Again', '', '', '', ''],
        ['dell-15', 'Dell 15', '4006381333931', 7, '', ''],
        ['', 'New one', '4006381333931', '', 'not a photo', 'Weight 1.6 kg'],
      ),
      catalogue([laptop, other], [['4006381333931', 'dell-15']]),
    );
    expect(result.issues.filter((i) => i.severity === 'error').map((i) => [i.rowNumber, i.message])).toEqual([
      [2, 'No product has the ID "no-such-product". Leave the Product ID blank to add a new product.'],
      [3, 'EAN "8901234567892" is not a valid barcode: check the digits.'],
      [4, 'This product is also on row 3. Only that row was read.'],
      [5, 'GST % "7" should be one of 0, 5, 12, 18, 28.'],
      [6, 'No category: the sheet needs a Category column to add products.'],
      [6, 'Photo "not" is not a web address. Use addresses starting with https:// or /.'],
      [6, 'Other specs: "Weight 1.6 kg" needs a label and a value, like "Item Weight: 1.6 kg".'],
    ]);
    expect(result.rejected).toBe(5);
  });

  it('refuses a barcode already on another product, or on an earlier row', () => {
    const other: ExistingProduct = { ...laptop, slug: 'dell-15', listing: { ...laptop.listing, name: 'Dell 15', ean: '4006381333931' } };
    const result = plan(
      sheet(['Product ID', 'Title', 'Category', 'EAN'], ['hp-15s', 'HP 15s Core i5', 'Laptops', '4006381333931'], ['', 'New A', 'Laptops', '8901234567890'], ['', 'New B', 'Laptops', '8901234567890']),
      catalogue([laptop, other], [['4006381333931', 'dell-15']]),
    );
    expect(errorsOf(result)).toEqual(['The EAN 4006381333931 is already on "Dell 15".', 'The EAN 8901234567890 is also on row 3.']);
    expect(result.toCreate.map((c) => c.listing.name)).toEqual(['New A']);
  });
});

describe('a CSV with line breaks inside its cells', () => {
  it('numbers rows as Excel shows them, one per product', async () => {
    const csv = 'Title,Category,Key highlights\r\n"A one",Laptops,"First\nSecond\nThird"\r\nB two,Laptops,\r\nC three,Toasters,\r\n';
    const result = plan(await readSheet(Buffer.from(csv), 'sheet.csv'));
    expect(result.toCreate.map((c) => [c.rowNumber, c.listing.highlights])).toEqual([
      [2, ['First', 'Second', 'Third']],
      [3, []],
    ]);
    expect(result.issues.map((i) => i.rowNumber)).toEqual([4]);
  });
});

describe('the downloaded sheet', () => {
  const products: ExistingProduct[] = seed.products.map((p) => ({ slug: p.id, listing: asListing(p), linkedToSap: false }));

  it.each([
    ['laptops', SPEC_TEMPLATES.laptops],
    ['all categories', []],
  ])('reads back, untouched, as no change to any product (%s)', async (which, specFields) => {
    const category = seed.categories.find((c) => c.slug === which) ?? null;
    const listed = products.filter((p) => !category || p.listing.categorySlug === category.slug);
    const file = await buildTemplate({ categories: seed.categories, category, specFields, products: listed });
    const rows = await readSheet(file, 'sheet.xlsx');

    const result = plan(rows, catalogue(products));
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
    expect(result.toUpdate.map((u) => [u.slug, u.changes])).toEqual([]);
    expect(result.unchanged).toBe(listed.length);
    expect(listed.length).toBeGreaterThan(category ? 10 : 200);
  });

  it('a blank sheet has the category spec columns, and a new row typed into it is read', async () => {
    const file = await buildTemplate({ categories: seed.categories, category: seed.categories[0], specFields: SPEC_TEMPLATES.laptops, products: [] });
    const rows = await readSheet(file, 'blank.xlsx');
    expect(rows).toHaveLength(1);
    expect(rows[0].cells).toContain('Spec: Processor *');
    expect(rows[0].cells).toContain('Spec: Graphics');

    // In the product page's order: the variant's RAM and storage follow Variant.
    const headings = rows[0].cells as string[];
    expect(headings.slice(0, 10)).toEqual([
      'Product ID',
      'Category *',
      'Brand *',
      'Model name *',
      'Model number',
      'Part number',
      'Variant',
      'Spec: RAM *',
      'Spec: Storage *',
      'Title',
    ]);

    const typed = (values: Record<string, string>) => ({ rowNumber: 2, cells: headings.map((h) => values[h] ?? '') });
    const newLaptop = { 'Category *': 'Laptops', 'Brand *': 'Acer', 'Model name *': 'Aspire 7', 'Spec: RAM *': '16gb', 'Spec: Storage *': '512 GB SSD' };
    const result = plan([...rows, typed(newLaptop)], catalogue([]));
    expect(errorsOf(result)).toEqual([]);
    // No title written: built from the brand's format.
    expect(result.toCreate[0].listing).toMatchObject({ name: 'Acer Aspire 7 (16 GB/512 GB SSD)', titleAuto: true, modelName: 'Aspire 7', brandName: 'Acer' });

    const written = plan([...rows, typed({ ...newLaptop, Title: 'Acer Aspire 7 Gaming Laptop' })], catalogue([]));
    expect(written.toCreate[0].listing).toMatchObject({ name: 'Acer Aspire 7 Gaming Laptop', titleAuto: false });
  });
});

describe('titles in the sheet', () => {
  const autoPhone: ExistingProduct = {
    slug: 'galaxy-s24',
    linkedToSap: false,
    listing: {
      ...EMPTY_LISTING,
      name: 'Samsung Galaxy S24 5G (8 GB RAM, 256 GB Storage)',
      titleAuto: true,
      categorySlug: 'mobile-phones',
      brandName: 'Samsung',
      modelName: 'Galaxy S24 5G',
      specs: [
        { label: 'RAM', value: '8 GB' },
        { label: 'Internal Storage', value: '256 GB' },
      ],
    },
  };

  it('rebuilds an automatic title when the fields it uses change, the title cell left as it was', () => {
    const result = plan(
      sheet(['Product ID', 'Title', 'Spec: Internal Storage'], ['galaxy-s24', autoPhone.listing.name, '512 GB']),
      catalogue([autoPhone]),
    );
    expect(result.toUpdate[0].changes).toEqual([
      { field: 'name', from: 'Samsung Galaxy S24 5G (8 GB RAM, 256 GB Storage)', to: 'Samsung Galaxy S24 5G (8 GB RAM, 512 GB Storage)' },
      { field: 'spec:Internal Storage', from: '256 GB', to: '512 GB' },
    ]);
  });

  it('keeps a title typed over an automatic one, and switches a written title to automatic when its cell is cleared', () => {
    const typed = plan(sheet(['Product ID', 'Title'], ['galaxy-s24', 'Galaxy S24 Special Edition']), catalogue([autoPhone]));
    expect(typed.toUpdate[0].listing).toMatchObject({ name: 'Galaxy S24 Special Edition', titleAuto: false });

    const written = { ...autoPhone, listing: { ...autoPhone.listing, titleAuto: false, name: 'Old title' } };
    const cleared = plan(sheet(['Product ID', 'Title'], ['galaxy-s24', '']), catalogue([written]));
    expect(cleared.toUpdate[0].listing).toMatchObject({ name: 'Samsung Galaxy S24 5G (8 GB RAM, 256 GB Storage)', titleAuto: true });
  });
});
