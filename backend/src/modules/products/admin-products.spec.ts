import { ProductStatus } from '@prisma/client';
import { LinkedSapInput, ProductRowInput, listProducts, summariseProduct } from './admin-products';
import { AdminProductsService } from './admin-products.service';

const product = (overrides: Partial<ProductRowInput> & { slug: string }): ProductRowInput => ({
  name: `Product ${overrides.slug}`,
  status: ProductStatus.ACTIVE,
  imageUrl: `/products/${overrides.slug}.jpg`,
  position: 0,
  priceInPaise: 50_000_00,
  mrpInPaise: 55_000_00,
  inStock: true,
  ean: null,
  updatedAt: new Date('2026-11-16T00:00:00Z'),
  brand: { name: 'HP' },
  category: { slug: 'laptops', name: 'Laptops' },
  colours: [],
  ...overrides,
});

const sap = (overrides: Partial<LinkedSapInput> & { sapCode: string; websiteProductId: string }): LinkedSapInput => ({
  websiteColour: null,
  mopInPaise: 40_000_00,
  mrpInPaise: 45_000_00,
  stock: 3,
  ean: null,
  ...overrides,
});

describe('summarising a product for the admin list', () => {
  it('uses the catalogue price and stock while no SAP code is linked', () => {
    const row = summariseProduct(product({ slug: 'a', inStock: false }), []);
    expect(row).toMatchObject({ source: 'catalogue', pricePaise: 50_000_00, mrpPaise: 55_000_00, stock: null, inStock: false });
    expect(row.issues).toEqual(['missing-ean', 'not-linked', 'out-of-stock']);
  });

  it('shows the SAP price of the cheapest linked code and the total stock, as the shop does', () => {
    const row = summariseProduct(product({ slug: 'a', colours: [{ key: 'black', name: 'Black', ean: null }, { key: 'blue', name: 'Blue', ean: null }] }), [
      sap({ sapCode: 'S1', websiteProductId: 'a', websiteColour: 'black', mopInPaise: 72_900_00, mrpInPaise: 79_900_00, stock: 0 }),
      sap({ sapCode: 'S2', websiteProductId: 'a', websiteColour: 'blue', mopInPaise: 70_000_00, mrpInPaise: 79_900_00, stock: 4 }),
      sap({ sapCode: 'OTHER', websiteProductId: 'b', stock: 99 }),
    ]);
    expect(row).toMatchObject({ source: 'sap', pricePaise: 70_000_00, mrpPaise: 79_900_00, stock: 4, inStock: true });
    expect(row.sapCodes.map((s) => s.sapCode)).toEqual(['S1', 'S2']);
  });

  it('is out of stock when every linked code is at zero', () => {
    const row = summariseProduct(product({ slug: 'a', inStock: true }), [sap({ sapCode: 'S1', websiteProductId: 'a', stock: 0 })]);
    expect(row.inStock).toBe(false);
    expect(row.issues).toContain('out-of-stock');
  });

  it("takes a product's barcode from the listing or from its SAP code", () => {
    expect(summariseProduct(product({ slug: 'a', ean: '8901234567890' }), []).ean).toEqual({ have: 1, need: 1, value: '8901234567890' });
    expect(
      summariseProduct(product({ slug: 'a' }), [sap({ sapCode: 'S1', websiteProductId: 'a', ean: '8900000000017' })]).ean,
    ).toEqual({ have: 1, need: 1, value: '8900000000017' });
  });

  it('needs a barcode for every colour, from the colour or its own SAP code', () => {
    const colours = [
      { key: 'black', name: 'Black', ean: '8901111111111' },
      { key: 'blue', name: 'Blue', ean: null },
      { key: 'pink', name: 'Pink', ean: null },
    ];
    const row = summariseProduct(product({ slug: 'a', colours, ean: '8909999999999' }), [
      sap({ sapCode: 'S2', websiteProductId: 'a', websiteColour: 'blue', ean: '8902222222222' }),
    ]);
    // The product-level code does not stand in for a colour's own.
    expect(row.ean).toEqual({ have: 2, need: 3, value: null });
    expect(row.issues).toContain('missing-ean');
  });
});

describe('the admin product list', () => {
  const rows = [
    summariseProduct(product({ slug: 'hp-15', name: 'HP 15s Laptop', position: 2, ean: '8901234567890' }), [
      sap({ sapCode: '100234', websiteProductId: 'hp-15' }),
    ]),
    summariseProduct(product({ slug: 'dell-14', name: 'Dell Inspiron 14', brand: { name: 'Dell' }, position: 1 }), []),
    summariseProduct(
      product({ slug: 'iphone', name: 'Apple iPhone 16', brand: { name: 'Apple' }, category: { slug: 'mobile-phones', name: 'Mobile Phones' }, position: 0, status: ProductStatus.INACTIVE }),
      [],
    ),
    summariseProduct(product({ slug: 'draft-1', name: 'New listing', position: 3, status: ProductStatus.DRAFT }), []),
  ];
  const q = { page: 1, pageSize: 25 };

  it('lists in shop order by default and counts every status', () => {
    const out = listProducts(rows, q);
    expect(out.items.map((r) => r.slug)).toEqual(['iphone', 'dell-14', 'hp-15', 'draft-1']);
    expect(out.counts).toMatchObject({ all: 4, ACTIVE: 2, DRAFT: 1, INACTIVE: 1 });
  });

  it('finds by name, brand, SAP code or barcode', () => {
    expect(listProducts(rows, { ...q, search: 'inspiron' }).items.map((r) => r.slug)).toEqual(['dell-14']);
    expect(listProducts(rows, { ...q, search: 'apple' }).items.map((r) => r.slug)).toEqual(['iphone']);
    expect(listProducts(rows, { ...q, search: '100234' }).items.map((r) => r.slug)).toEqual(['hp-15']);
    expect(listProducts(rows, { ...q, search: '8901234567890' }).items.map((r) => r.slug)).toEqual(['hp-15']);
  });

  it('filters by status and issue, with counts that follow the other filters', () => {
    const active = listProducts(rows, { ...q, status: ProductStatus.ACTIVE });
    expect(active.items.map((r) => r.slug)).toEqual(['dell-14', 'hp-15']);
    // Status tabs keep counting across statuses; issue chips count within the tab.
    expect(active.counts).toMatchObject({ all: 4, ACTIVE: 2, 'not-linked': 1, 'missing-ean': 1 });

    const unlinked = listProducts(rows, { ...q, issue: 'not-linked' });
    expect(unlinked.items.map((r) => r.slug)).toEqual(['iphone', 'dell-14', 'draft-1']);
  });

  it('filters by category and brand, sorts, and pages', () => {
    expect(listProducts(rows, { ...q, category: 'mobile-phones' }).items.map((r) => r.slug)).toEqual(['iphone']);
    expect(listProducts(rows, { ...q, brand: 'Dell' }).items.map((r) => r.slug)).toEqual(['dell-14']);
    expect(listProducts(rows, { ...q, sort: 'name' }).items.map((r) => r.slug)).toEqual(['iphone', 'dell-14', 'hp-15', 'draft-1']);
    const page2 = listProducts(rows, { ...q, page: 2, pageSize: 3 });
    expect(page2).toMatchObject({ total: 4, page: 2 });
    expect(page2.items.map((r) => r.slug)).toEqual(['draft-1']);
  });
});

describe('activating and deactivating products', () => {
  function fakeDb(initial: { slug: string; status: ProductStatus }[]) {
    const products = new Map(initial.map((p) => [p.slug, { ...p }]));
    const audit: Record<string, unknown>[] = [];
    let forgotten = 0;
    const prisma = {
      product: {
        findMany: async ({ where }: { where: { slug: { in: string[] }; status: { not: ProductStatus } } }) =>
          // Copies, as the database returns.
          where.slug.in
            .map((s) => products.get(s))
            .filter((p) => p && p.status !== where.status.not)
            .map((p) => ({ ...p! })),
        updateMany: async ({ where, data }: { where: { slug: { in: string[] } }; data: { status: ProductStatus } }) => {
          where.slug.in.forEach((s) => (products.get(s)!.status = data.status));
        },
      },
      auditLog: { createMany: async ({ data }: { data: Record<string, unknown>[] }) => audit.push(...data) },
      $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
    };
    const catalogue = { forget: () => forgotten++ };
    const service = new AdminProductsService(prisma as never, catalogue as never);
    return { service, products, audit, forgotten: () => forgotten };
  }

  it('changes only products not already in that state, logs each, and refreshes the shop list', async () => {
    const db = fakeDb([
      { slug: 'a', status: ProductStatus.ACTIVE },
      { slug: 'b', status: ProductStatus.ACTIVE },
      { slug: 'c', status: ProductStatus.INACTIVE },
    ]);
    const result = await db.service.setStatus(['a', 'c', 'a', 'missing'], 'INACTIVE', 'admin-1');
    expect(result).toEqual({ updated: 1 });
    expect(db.products.get('a')!.status).toBe(ProductStatus.INACTIVE);
    expect(db.products.get('b')!.status).toBe(ProductStatus.ACTIVE);
    expect(db.audit).toEqual([
      { actorId: 'admin-1', action: 'PRODUCT_DEACTIVATED', targetType: 'Product', targetId: 'a', metadata: { from: 'ACTIVE', to: 'INACTIVE' } },
    ]);
    expect(db.forgotten()).toBe(1);
  });

  it('does nothing, and keeps the shop list, when nothing would change', async () => {
    const db = fakeDb([{ slug: 'a', status: ProductStatus.ACTIVE }]);
    expect(await db.service.setStatus(['a'], 'ACTIVE', 'admin-1')).toEqual({ updated: 0 });
    expect(db.audit).toHaveLength(0);
    expect(db.forgotten()).toBe(0);
  });
});
