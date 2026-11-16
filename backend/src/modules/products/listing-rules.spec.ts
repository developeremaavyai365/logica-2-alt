import { bigPriceChange, checkListing, isValidGtin, ListingForChecks, slugify, uniqueSlug } from './listing-rules';

describe('barcodes', () => {
  it.each(['8901234567890', '4006381333931', '96385074', '036000291452', '10012345678902'])('accepts the valid code %s', (code) =>
    expect(isValidGtin(code)).toBe(true),
  );

  it.each([
    ['8901234567892', 'wrong check digit'],
    ['890123456789', 'wrong check digit for its length'],
    ['89012345678921', 'wrong check digit'],
    ['123456789', 'nine digits'],
    ['89012A4567892', 'a letter'],
    ['', 'empty'],
  ])('refuses %p (%s)', (code) => expect(isValidGtin(code)).toBe(false));
});

describe('web addresses from titles', () => {
  it('lower-cases, keeps letters and digits, and joins words with hyphens', () => {
    expect(slugify('HP 15s (Core i5, 16GB RAM) – Silver')).toBe('hp-15s-core-i5-16gb-ram-silver');
    expect(slugify('  Café Crème  ')).toBe('cafe-creme');
  });

  it('adds a number when the address is taken', () => {
    expect(uniqueSlug('hp-15s', new Set())).toBe('hp-15s');
    expect(uniqueSlug('hp-15s', new Set(['hp-15s', 'hp-15s-2']))).toBe('hp-15s-3');
    expect(uniqueSlug('', new Set())).toBe('product');
  });
});

describe('the publish checklist', () => {
  const laptop: ListingForChecks = {
    name: 'HP 15s Core i5',
    categorySlug: 'laptops',
    brandName: 'HP',
    priceInPaise: 52_990_00,
    mrpInPaise: 61_990_00,
    gallery: ['/products/hp.jpg'],
    highlights: ['13th Gen Core i5', '16 GB RAM', '512 GB SSD'],
    specs: [
      { label: 'Processor', value: 'Core i5-1335U' },
      { label: 'RAM', value: '16 GB' },
      { label: 'Storage', value: '512 GB SSD' },
      { label: 'Screen Size', value: '15.6 inch' },
      { label: 'Operating System', value: 'Windows 11' },
    ],
    description: 'A thin and light laptop.',
    ean: '8901234567890',
    hsnCode: '84713010',
    gstRatePercent: 18,
    colours: [],
  };

  it('passes a complete, SAP-linked listing with nothing to fix', () => {
    expect(checkListing(laptop, true)).toEqual({ blocking: [], warnings: [] });
  });

  it('can publish without a SAP code, but warns that it cannot be ordered until one is linked', () => {
    expect(checkListing(laptop, false)).toEqual({
      blocking: [],
      warnings: ['Link a SAP code on the SAP import page: until then shoppers can see it but not order it.'],
    });
  });

  it("blocks publishing without a title, photo, price or the category's required specs", () => {
    const { blocking } = checkListing(
      { ...laptop, name: '', gallery: [], priceInPaise: 0, specs: laptop.specs.filter((s) => s.label !== 'RAM') },
      false,
    );
    expect(blocking).toEqual([
      'Add a product title.',
      'Add at least one photo.',
      'Set a selling price, or link a SAP code on the SAP import page.',
      'Fill in the spec "RAM".',
    ]);
  });

  it('asks for, without demanding, the required specs of a product published before', () => {
    const result = checkListing({ ...laptop, specs: [] }, true, true);
    expect(result.blocking).toEqual([]);
    expect(result.warnings).toContain('Fill in the spec "Processor".');
    // A missing photo still blocks, on the shop or not.
    expect(checkListing({ ...laptop, gallery: [] }, true, true).blocking).toEqual(['Add at least one photo.']);
  });

  it('lets a SAP-linked product publish without a catalogue price', () => {
    expect(checkListing({ ...laptop, priceInPaise: 0, mrpInPaise: null }, true).blocking).toEqual([]);
  });

  it('blocks a selling price above the MRP', () => {
    expect(checkListing({ ...laptop, priceInPaise: 70_000_00 }, false).blocking).toEqual(['The selling price cannot be above the MRP.']);
  });

  it('warns, without blocking, about missing barcodes, highlights, description and tax details', () => {
    const result = checkListing(
      {
        ...laptop,
        ean: null,
        highlights: ['One'],
        description: '',
        hsnCode: null,
        gstRatePercent: null,
        colours: [
          { name: 'Silver', ean: '8901234567890', images: ['/a.jpg'] },
          { name: 'Blue', ean: null, images: [] },
        ],
      },
      true,
    );
    expect(result.blocking).toEqual([]);
    expect(result.warnings).toEqual([
      'Add the EAN for Blue.',
      'Add photos of Blue.',
      'Add at least 3 key highlights.',
      'Add a description.',
      'Add the HSN code.',
      'Choose the GST rate.',
    ]);
  });

  it('asks for no particular specs in a category without a template', () => {
    expect(checkListing({ ...laptop, categorySlug: 'accessories', specs: [] }, false).blocking).toEqual([]);
  });
});

describe('big price changes', () => {
  it('flags a move of 40% or more either way', () => {
    expect(bigPriceChange(100_00, 59_00)).toBe(-41);
    expect(bigPriceChange(100_00, 140_00)).toBe(40);
    expect(bigPriceChange(100_00, 70_00)).toBeNull();
    expect(bigPriceChange(0, 70_00)).toBeNull();
  });
});
