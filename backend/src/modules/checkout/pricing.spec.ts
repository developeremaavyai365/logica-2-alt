import { MAX_PER_LINE, SellableItem, availableUnits, itemFor, mergeLines, newOrderNumber, priceLines, totals } from './pricing';

const LAST_SHEET = new Date('2026-11-10T10:00:00Z');

const item = (o: Partial<SellableItem> & { sapCode: string }): SellableItem => ({
  websiteProductId: 'hp-15s',
  websiteColour: null,
  modelName: 'HP 15s Laptop',
  stock: 10,
  mrpInPaise: 60_000_00,
  mopInPaise: 50_000_00,
  inLatestFeed: true,
  stockUpdatedAt: LAST_SHEET,
  ...o,
});

describe('which SAP code a cart line is sold under', () => {
  const whole = item({ sapCode: 'W1' });
  const blue = item({ sapCode: 'B1', websiteProductId: 'iphone-16', websiteColour: 'blue' });
  const black = item({ sapCode: 'K1', websiteProductId: 'iphone-16', websiteColour: 'black' });

  it("uses the colour's own code when the product is sold colour by colour", () => {
    expect(itemFor({ productId: 'iphone-16', colour: 'blue', quantity: 1 }, [whole, blue, black])).toBe(blue);
  });

  it('falls back to the whole-product code', () => {
    expect(itemFor({ productId: 'hp-15s', colour: 'silver', quantity: 1 }, [whole])).toBe(whole);
    expect(itemFor({ productId: 'hp-15s', quantity: 1 }, [whole])).toBe(whole);
  });

  it('asks for a colour when only colours are linked and none was chosen', () => {
    expect(itemFor({ productId: 'iphone-16', quantity: 1 }, [blue, black])).toBe('choose_colour');
  });

  it('says not sold online when nothing is linked, or the colour is not', () => {
    expect(itemFor({ productId: 'dell-xps', quantity: 1 }, [whole])).toBeNull();
    expect(itemFor({ productId: 'iphone-16', colour: 'pink', quantity: 1 }, [blue, black])).toBeNull();
  });
});

describe('stock left to sell', () => {
  it('takes off website orders placed since the sheet last changed the stock', () => {
    const it10 = item({ sapCode: 'W1', stock: 10 });
    const reservations = [
      { sapCode: 'W1', quantity: 3, placedAt: new Date('2026-11-11T10:00:00Z') }, // after the sheet
      { sapCode: 'W1', quantity: 4, placedAt: new Date('2026-11-09T10:00:00Z') }, // before: already in SAP's count
      { sapCode: 'X9', quantity: 5, placedAt: new Date('2026-11-11T10:00:00Z') }, // another code
    ];
    expect(availableUnits(it10, reservations)).toBe(7);
  });

  it('is nothing for a code the last full sheet dropped, and never below zero', () => {
    expect(availableUnits(item({ sapCode: 'W1', inLatestFeed: false }), [])).toBe(0);
    expect(
      availableUnits(item({ sapCode: 'W1', stock: 1 }), [{ sapCode: 'W1', quantity: 3, placedAt: new Date('2026-11-12') }]),
    ).toBe(0);
  });
});

describe('pricing a cart', () => {
  it('prices at MOP from the sheet, never anything the browser sent', () => {
    const [line] = priceLines([{ productId: 'hp-15s', quantity: 2 }], [item({ sapCode: 'W1' })], []);
    expect(line).toMatchObject({ sapCode: 'W1', name: 'HP 15s Laptop', unitPaise: 50_000_00, mrpPaise: 60_000_00, problem: null });
  });

  it('adds up the same item added twice', () => {
    expect(mergeLines([
      { productId: 'a', quantity: 1 },
      { productId: 'a', colour: null, quantity: 2 },
      { productId: 'a', colour: 'blue', quantity: 1 },
    ])).toEqual([
      { productId: 'a', colour: null, quantity: 3 },
      { productId: 'a', colour: 'blue', quantity: 1 },
    ]);
  });

  it('flags lines that cannot be ordered as asked, with how many can', () => {
    const items = [
      item({ sapCode: 'A', websiteProductId: 'a', stock: 0 }),
      item({ sapCode: 'B', websiteProductId: 'b', stock: 2 }),
      item({ sapCode: 'C', websiteProductId: 'c', stock: 50 }),
    ];
    const lines = priceLines(
      [
        { productId: 'a', quantity: 1 },
        { productId: 'b', quantity: 3 },
        { productId: 'c', quantity: MAX_PER_LINE + 1 },
        { productId: 'unlinked', quantity: 1 },
      ],
      items,
      [],
    );
    expect(lines.map((l) => [l.problem, l.maxQuantity])).toEqual([
      ['out_of_stock', 0],
      ['not_enough_stock', 2],
      ['over_limit', MAX_PER_LINE],
      ['not_sold_online', 0],
    ]);
  });

  it('shares one code’s stock between two lines that use it', () => {
    const shared = item({ sapCode: 'W1', stock: 3 });
    const lines = priceLines(
      [
        { productId: 'hp-15s', colour: 'silver', quantity: 2 },
        { productId: 'hp-15s', colour: 'grey', quantity: 2 },
      ],
      [shared],
      [],
    );
    expect(lines.map((l) => l.problem)).toEqual([null, 'not_enough_stock']);
  });

  it('totals only the lines that can be ordered, plus delivery', () => {
    const lines = priceLines(
      [
        { productId: 'hp-15s', quantity: 2 },
        { productId: 'unlinked', quantity: 1 },
      ],
      [item({ sapCode: 'W1' })],
      [],
    );
    expect(totals(lines, 99_00)).toEqual({
      itemCount: 2,
      mrpTotalPaise: 120_000_00,
      subtotalPaise: 100_000_00,
      shippingPaise: 99_00,
      totalPaise: 100_000_00 + 99_00,
    });
    expect(totals([], 99_00).totalPaise).toBe(0);
  });
});

describe('order numbers', () => {
  it('carry the Indian date and six unambiguous characters', () => {
    // 20:00 UTC on the 13th is already the 14th in India.
    const n = newOrderNumber(new Date('2026-11-13T20:00:00Z'), () => 0);
    expect(n).toBe('LG261114-AAAAAA');
    expect(newOrderNumber(new Date())).toMatch(/^LG\d{6}-[A-HJ-NP-Z2-9]{6}$/);
  });
});
