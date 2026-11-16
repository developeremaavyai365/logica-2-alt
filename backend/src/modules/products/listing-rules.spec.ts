import { bigPriceChange, checkListing, isValidGtin, ListingForChecks, MIN_HIGHLIGHTS, slugify, suggestHighlights, uniqueSlug } from './listing-rules';

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
    modelName: '15s',
    priceInPaise: 52_990_00,
    mrpInPaise: 61_990_00,
    gallery: ['/products/hp.jpg'],
    highlights: ['13th Gen Core i5', '16 GB RAM', '512 GB SSD', '15.6 inch display'],
    specs: [
      { label: 'Processor', value: 'Core i5-1335U' },
      { label: 'RAM', value: '16 GB' },
      { label: 'Storage', value: '512 GB SSD' },
      { label: 'Screen Size', value: '15.6 inch' },
      { label: 'Operating System', value: 'Windows 11' },
    ],
    description: 'A thin and light laptop.',
    ean: null,
    hsnCode: '84713010',
    gstRatePercent: 18,
    inTheBox: 'Laptop, charger',
    countryOfOrigin: 'India',
    manufacturerDetails: 'HP India, Bengaluru',
    colours: [{ name: 'Natural Silver', ean: '8901234567890', images: ['/products/hp-silver.jpg'] }],
  };
  const empty: ListingForChecks = {
    ...laptop,
    modelName: null,
    mrpInPaise: null,
    highlights: [],
    specs: [],
    description: '',
    hsnCode: null,
    gstRatePercent: null,
    inTheBox: null,
    countryOfOrigin: null,
    manufacturerDetails: null,
    colours: [],
  };

  it('passes a complete, SAP-linked listing with nothing to fix', () => {
    expect(checkListing(laptop, true)).toEqual({ blocking: [], warnings: [] });
  });

  it('can publish without a SAP code, but warns that it cannot be ordered until one is linked', () => {
    expect(checkListing(laptop, false)).toEqual({
      blocking: [],
      warnings: ['Link a SAP code (the SKU): until then shoppers can see it but not order it.'],
    });
  });

  it('asks a new listing for everything a marketplace does, in the order of the form', () => {
    expect(checkListing(empty, true).blocking).toEqual([
      'Add the model name.',
      'Fill in the RAM of the variant.',
      'Fill in the Storage of the variant.',
      'Add the colour.',
      'Add the EAN / barcode.',
      'Choose the GST rate.',
      'Add the HSN code.',
      `Add at least ${MIN_HIGHLIGHTS} key highlights.`,
      'Add a description.',
      'Add what is in the box.',
      'Fill in the spec "Processor".',
      'Fill in the spec "Screen Size".',
      'Fill in the spec "Operating System".',
      'Add the country of origin.',
      "Add the manufacturer's name and address.",
    ]);
  });

  it('asks for the MRP and price unless a SAP code supplies them', () => {
    expect(checkListing({ ...laptop, priceInPaise: 0, mrpInPaise: null }, false).blocking).toEqual([
      'Add the MRP.',
      'Set a selling price, or link a SAP code on the SAP import page.',
    ]);
    expect(checkListing({ ...laptop, priceInPaise: 0, mrpInPaise: null }, true).blocking).toEqual([]);
  });

  it('only asks, without demanding, the same of a product published before, so older listings stay usable', () => {
    const result = checkListing(empty, true, true);
    expect(result.blocking).toEqual([]);
    expect(result.warnings).toContain('Add the model name.');
    expect(result.warnings).toContain("Add the manufacturer's name and address.");
    // A title, a brand and a photo are needed on the shop all the same.
    expect(checkListing({ ...empty, name: '', gallery: [] }, true, true).blocking).toEqual(['Add a product title.', 'Add at least one photo.']);
  });

  it('blocks a selling price above the MRP', () => {
    expect(checkListing({ ...laptop, priceInPaise: 70_000_00 }, false).blocking).toEqual(['The selling price cannot be above the MRP.']);
  });

  it('wants a barcode for each colour, and photos of each', () => {
    const result = checkListing({ ...laptop, colours: [...laptop.colours, { name: 'Blue', ean: null, images: [] }] }, true);
    expect(result.blocking).toEqual(['Add the EAN for Blue.']);
    expect(result.warnings).toEqual(['Add photos of Blue.']);
  });

  it('needs no colour or particular specs in a category without them', () => {
    const ups = { ...laptop, categorySlug: 'accessories', specs: [], colours: [], ean: '8901234567890' };
    expect(checkListing(ups, true)).toEqual({ blocking: [], warnings: [] });
  });
});

describe('highlights from the specs', () => {
  it('writes the variant, screen, battery, processor and cameras of a phone', () => {
    expect(
      suggestHighlights('mobile-phones', [
        { label: 'RAM', value: '8 GB' },
        { label: 'Internal Storage', value: '256 GB' },
        { label: 'Display Size', value: '6.7 inch' },
        { label: 'Battery Capacity', value: '5000 mAh' },
        { label: 'Processor', value: 'Snapdragon 8 Gen 3' },
        { label: 'Primary Camera', value: '50 MP + 12 MP' },
        { label: 'Secondary Camera', value: '12 MP' },
      ]),
    ).toEqual([
      '8 GB RAM | 256 GB ROM',
      '6.7 inch Display',
      '5000 mAh Battery',
      'Snapdragon 8 Gen 3 Processor',
      '50 MP + 12 MP Rear Camera | 12 MP Front Camera',
    ]);
  });

  it('leaves out what is not filled in', () => {
    expect(suggestHighlights('laptops', [{ label: 'RAM', value: '16 GB' }, { label: 'Operating System', value: 'Windows 11' }])).toEqual([
      '16 GB RAM',
      'Windows 11',
    ]);
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
