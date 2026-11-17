import { SuggestItem, SuggestProduct, nameScore, suggestLinks } from './link-suggestions';

const item = (sapCode: string, modelName: string, more: Partial<SuggestItem> = {}): SuggestItem => ({
  sapCode,
  sapName: modelName.toUpperCase(),
  modelName,
  ean: null,
  partNumber: null,
  mopInPaise: 10_000_00,
  stock: 5,
  ...more,
});
const product = (slug: string, name: string, more: Partial<SuggestProduct> = {}): SuggestProduct => ({
  slug,
  name,
  imageUrl: `/products/${slug}.jpg`,
  ean: null,
  partNumber: null,
  modelNumber: null,
  colours: [],
  ...more,
});

const shop = [
  product('honor-x9b-5g', 'HONOR X9b 5G'),
  product('honor-90-5g', 'Honor 90 5G'),
  product('brother-dcp-t520w', 'Brother Dcp-T520W All-in One Ink Tank Refill System Solid Ink Printers with Built-in Wireless'),
  product('asus-rog-bp1501', 'Asus ROG BP1501 39.62 cm (15.6-inch) Gaming Laptop Backpack'),
  product('asus-rog-backpack', 'Asus ROG Backpack BP1501 Gaming Laptop Bag'),
  product('hp-laptop14', 'HP Laptop14-ep0341TU, Silver'),
  product('iphone-16', 'iPhone 16', {
    colours: [
      { key: 'black', name: 'Black', family: ['black'], ean: '0195949821691' },
      { key: 'ultramarine', name: 'Ultramarine', family: ['blue'], ean: null },
    ],
  }),
];

describe('suggested links for new item codes', () => {
  it('matches by nearly the same name, and only a clear winner', () => {
    const [honor] = suggestLinks([item('500103', 'HONOR X9b 5G')], shop, new Set());
    expect(honor).toMatchObject({ sapCode: '500103', product: { slug: 'honor-x9b-5g' }, reason: 'Similar name', colour: null });

    // A longer shop name that holds all of the sheet's name still matches.
    expect(suggestLinks([item('500102', 'Brother Dcp-T520W All-in One Ink Tank Refill System')], shop, new Set())[0].product.slug).toBe('brother-dcp-t520w');
  });

  it('suggests nothing when two products are about as close', () => {
    expect(suggestLinks([item('9', 'Honor 5G')], shop, new Set())).toEqual([]);
  });

  it('matches by model or part number, inside the name too', () => {
    const [hp] = suggestLinks([item('500101', 'HP 14 inch laptop', { partNumber: '14-ep0341TU' })], shop, new Set());
    expect(hp).toMatchObject({ product: { slug: 'hp-laptop14' }, reason: 'Same model number' });
  });

  it('matches a colour by its barcode, or by its name in the sheet', () => {
    expect(suggestLinks([item('IP-B', 'Apple phone', { ean: '0195949821691' })], shop, new Set())[0]).toMatchObject({
      product: { slug: 'iphone-16' },
      colour: { key: 'black' },
      reason: 'Same barcode number',
    });
    expect(suggestLinks([item('IP-U', 'iPhone 16 Ultramarine')], shop, new Set())[0]).toMatchObject({ colour: { key: 'ultramarine' } });
  });

  it('leaves out products, or colours, that already have a code, and gives each slot to one code', () => {
    expect(suggestLinks([item('500103', 'HONOR X9b 5G')], shop, new Set(['honor-x9b-5g|']))).toEqual([]);
    const two = suggestLinks([item('A', 'HONOR X9b 5G'), item('B', 'HONOR X9b 5G phone')], shop, new Set());
    expect(two.map((s) => s.sapCode)).toEqual(['A']);
  });

  it('scores how much of the sheet name the product name holds', () => {
    expect(nameScore('HONOR X9b 5G', 'HONOR X9b 5G')).toBe(1);
    expect(nameScore('HONOR X9b 5G', 'Honor 90 5G')).toBeLessThan(0.75);
  });
});
