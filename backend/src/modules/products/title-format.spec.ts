import { DEFAULT_TITLE_FORMATS, TitleInput, buildTitle, pickTitleFormat, renderTitle, tidySize } from './title-format';

const phone = (brand: string, modelName: string, specs: [string, string][] = []): TitleInput => ({
  brand,
  modelName,
  modelNumber: null,
  variant: null,
  specs: specs.map(([label, value]) => ({ label, value })),
});

const title = (input: TitleInput, category: string, colour: string | null = null) =>
  buildTitle(pickTitleFormat(input.brand, category, []).pattern, input, colour);

describe('product titles from brand formats', () => {
  it('writes an iPhone as Apple does, without RAM', () => {
    expect(title(phone('Apple', 'iPhone 16', [['RAM', '8 GB'], ['Internal Storage', '128GB']]), 'mobile-phones', 'Black')).toBe(
      'Apple iPhone 16 (Black, 128 GB)',
    );
  });

  it('writes a Samsung phone with colour, RAM and storage, not repeating the brand', () => {
    expect(
      title(phone('Samsung', 'Samsung Galaxy S24 5G', [['RAM', '8gb'], ['Internal Storage', '256 GB']]), 'mobile-phones', 'Onyx Black'),
    ).toBe('Samsung Galaxy S24 5G (Onyx Black, 8 GB RAM, 256 GB Storage)');
  });

  it("matches a brand's format whatever its letter case", () => {
    expect(pickTitleFormat('ONEPLUS', 'mobile-phones', []).brand).toBe('OnePlus');
  });

  it('uses the Flipkart-style format for a phone brand without its own', () => {
    expect(title(phone('Nothing', 'Phone (2a)', [['RAM', '8 GB'], ['Internal Storage', '128 GB']]), 'mobile-phones', 'White')).toBe(
      'Nothing Phone (2a) (White, 128 GB) (8 GB RAM)',
    );
  });

  it('drops a missing value cleanly, leaving no empty brackets or stray words', () => {
    expect(title(phone('Samsung', 'Galaxy A16 5G', [['Internal Storage', '128 GB']]), 'mobile-phones')).toBe('Samsung Galaxy A16 5G (128 GB Storage)');
    expect(title(phone('Samsung', 'Galaxy A16 5G'), 'mobile-phones')).toBe('Samsung Galaxy A16 5G');
  });

  it('writes laptops in each brand’s order', () => {
    const specs: [string, string][] = [
      ['Processor', '13th Gen Intel Core i5-1335U'],
      ['RAM', '16 GB'],
      ['Storage', '512 GB SSD'],
      ['Screen Size', '15.6 inch'],
      ['Operating System', 'Windows 11'],
    ];
    expect(title({ ...phone('HP', '15s', specs), modelNumber: '15s-fq5111TU' }, 'laptops', 'Natural Silver')).toBe(
      'HP 15s, 13th Gen Intel Core i5-1335U, 16 GB, 512 GB SSD, 15.6 inch, Windows 11, Natural Silver, 15s-fq5111TU',
    );
    expect(
      title({ ...phone('Lenovo', 'IdeaPad Slim 3', specs.map(([l, v]) => [l, l === 'Processor' ? 'Intel Core i5 12th Gen' : v])), modelNumber: '82RK00VWIN' }, 'laptops', 'Arctic Grey'),
    ).toBe('Lenovo IdeaPad Slim 3 Intel Core i5 12th Gen (16 GB/512 GB SSD/Windows 11) 82RK00VWIN, 15.6 inch, Arctic Grey');
    expect(
      title({ ...phone('Apple', 'MacBook Air M2', [['RAM', '8 GB'], ['Storage', '256 GB SSD']]), modelNumber: 'MLY33HN/A' }, 'laptops', 'Midnight'),
    ).toBe('Apple MacBook Air M2 (8 GB/256 GB SSD, Midnight) MLY33HN/A');
  });

  it('keeps the slash between RAM and storage when the colour is missing, and the comma when storage is', () => {
    const mac = { ...phone('Apple', 'MacBook Air M2', [['RAM', '8 GB'], ['Storage', '256 GB SSD']]), modelNumber: 'MLY33HN/A' };
    expect(title(mac, 'laptops')).toBe('Apple MacBook Air M2 (8 GB/256 GB SSD) MLY33HN/A');
    expect(title({ ...mac, specs: [{ label: 'RAM', value: '8 GB' }] }, 'laptops', 'Midnight')).toBe('Apple MacBook Air M2 (8 GB, Midnight) MLY33HN/A');
  });

  it('uses any spec by its label, as the printer format does', () => {
    const printer = phone('HP', 'Smart Tank 525', [
      ['Printer Type', 'Ink Tank'],
      ['Functions', 'Print, Scan, Copy'],
      ['Printing Output', 'Colour'],
    ]);
    expect(title(printer, 'printers')).toBe('HP Smart Tank 525 Ink Tank Printer (Print, Scan, Copy, Colour)');
  });

  it('uses the variant in words for other categories', () => {
    expect(title({ ...phone('Microtek', 'UPS'), variant: '650 VA' }, 'accessories', 'Black')).toBe('Microtek UPS (650 VA, Black)');
  });

  it("prefers an admin's own format, for the brand and then for the category", () => {
    const saved = [
      { brand: 'Samsung', category: 'mobile-phones', pattern: '{brand} {model} {storage} {colour}' },
      { brand: null, category: 'monitors', pattern: '{brand} {model} {screen} Monitor' },
    ];
    expect(pickTitleFormat('samsung', 'mobile-phones', saved).pattern).toBe('{brand} {model} {storage} {colour}');
    expect(pickTitleFormat('AOC', 'monitors', saved).pattern).toBe('{brand} {model} {screen} Monitor');
    expect(pickTitleFormat('Zebronics', 'accessories', saved)).toBe(DEFAULT_TITLE_FORMATS[DEFAULT_TITLE_FORMATS.length - 1]);
  });

  it('writes sizes one way and keeps a title within 200 characters', () => {
    expect(tidySize('8gb RAM, 1TB SSD, 512 mb')).toBe('8 GB RAM, 1 TB SSD, 512 MB');
    expect(renderTitle('{brand} {model}', { brand: 'X', model: 'y'.repeat(250) }).length).toBeLessThanOrEqual(200);
  });
});
