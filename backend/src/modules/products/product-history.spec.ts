import { ConflictException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { AdminProductsService } from './admin-products.service';
import { AuditRow, toHistoryEntry } from './product-history';

const at = new Date('2026-11-16T09:30:00.000Z');
const row = (action: string, metadata: unknown, extra: Partial<AuditRow> = {}): AuditRow => ({
  id: 'a1',
  action,
  targetType: 'Product',
  targetId: 'hp-15s',
  metadata,
  createdAt: at,
  actor: { name: null, email: 'admin@logica.test' },
  ...extra,
});

describe('a product history line', () => {
  it('lists the fields an edit changed, with who and when', () => {
    expect(
      toHistoryEntry(row('PRODUCT_UPDATED', { changes: [{ field: 'mrpInPaise', from: 55_390_00, to: 52_990_00 }] }, { actor: { name: 'Asha', email: 'a@x' } }), 'hp-15s'),
    ).toEqual({
      id: 'a1',
      at: '2026-11-16T09:30:00.000Z',
      actor: 'Asha',
      title: 'Edited',
      detail: null,
      changes: [{ field: 'mrpInPaise', from: 55_390_00, to: 52_990_00 }],
    });
  });

  it('says when a change came from a bulk sheet, and names a product added by one', () => {
    const edit = toHistoryEntry(row('PRODUCT_UPDATED', { via: 'bulk upload', fileName: 'prices.xlsx', changes: [] }), 'hp-15s');
    expect(edit).toMatchObject({ title: 'Saved with no changes', detail: 'From the bulk sheet “prices.xlsx”', actor: 'admin@logica.test' });
    expect(toHistoryEntry(row('PRODUCT_CREATED', { status: 'DRAFT', via: 'bulk upload', fileName: 'new.csv' }), 'hp-15s')).toMatchObject({
      title: 'Added as a draft',
      detail: 'From the bulk sheet “new.csv”',
    });
  });

  it('shows going on and off the shop, deleting and restoring', () => {
    expect(toHistoryEntry(row('PRODUCT_DEACTIVATED', { from: 'ACTIVE', to: 'INACTIVE' }), 'hp-15s')).toMatchObject({
      title: 'Taken off the shop',
      changes: [{ field: 'status', from: 'ACTIVE', to: 'INACTIVE' }],
    });
    expect(toHistoryEntry(row('PRODUCT_DELETED', { from: 'ACTIVE', to: 'INACTIVE' }), 'hp-15s').title).toBe('Deleted');
    expect(toHistoryEntry(row('PRODUCT_RESTORED', { clearedBarcodes: [], status: 'DRAFT' }), 'hp-15s').title).toBe('Restored as a draft');
    expect(toHistoryEntry(row('PRODUCT_RESTORED', { clearedBarcodes: ['8901234567890'], status: 'INACTIVE' }), 'hp-15s')).toMatchObject({
      title: 'Restored, off the shop',
      detail: 'Its EAN 8901234567890 had since been given to another product, so it was removed from this one.',
    });
  });

  it('shows SAP codes linked to the product, moved off it and unlinked, and an action with no one behind it', () => {
    const sap = (action: string, metadata: unknown) => row(action, metadata, { targetType: 'SapItem', targetId: '100234', actor: null });
    expect(toHistoryEntry(sap('SAP_ITEM_LINKED', { productId: 'hp-15s', colour: 'silver', previousProductId: 'hp-14' }), 'hp-15s')).toMatchObject({
      title: 'Linked SAP code 100234',
      detail: 'For the colour silver. Its price and stock now come from the SAP sheet. It was on hp-14 before.',
      actor: 'System',
    });
    expect(toHistoryEntry(sap('SAP_ITEM_LINKED', { productId: 'hp-14', previousProductId: 'hp-15s' }), 'hp-15s')).toMatchObject({
      title: 'SAP code 100234 moved to another product',
      detail: 'Now on hp-14.',
    });
    expect(toHistoryEntry(sap('SAP_ITEM_UNLINKED', { productId: null, previousProductId: 'hp-15s', previousColour: 'blue' }), 'hp-15s')).toMatchObject({
      title: 'Unlinked SAP code 100234',
      detail: 'It was the code for the colour blue.',
    });
  });
});

describe('deleting and restoring a product', () => {
  interface Product {
    id: string;
    slug: string;
    name: string;
    status: ProductStatus;
    ean: string | null;
    deletedAt: Date | null;
    colours: { id: string; ean: string | null }[];
  }

  function fakeDb(products: Product[], linkedSlugs: string[] = []) {
    const audit: Record<string, unknown>[] = [];
    const live = (p: Product, notId: string) => p.deletedAt === null && p.id !== notId;
    const prisma = {
      product: {
        findFirst: async ({ where }: { where: { slug: string; deletedAt: null | { not: null } } }) =>
          products.find((p) => p.slug === where.slug && (where.deletedAt === null ? p.deletedAt === null : p.deletedAt !== null)) ?? null,
        findMany: async ({ where }: { where: { id: { not: string }; ean: { in: string[] } } }) =>
          products.filter((p) => live(p, where.id.not) && p.ean && where.ean.in.includes(p.ean)).map((p) => ({ ean: p.ean })),
        update: async ({ where, data }: { where: { id: string }; data: Partial<Product> }) => Object.assign(products.find((p) => p.id === where.id)!, data),
      },
      productColour: {
        findMany: async ({ where }: { where: { ean: { in: string[] }; product: { id: { not: string } } } }) =>
          products
            .filter((p) => live(p, where.product.id.not))
            .flatMap((p) => p.colours)
            .filter((c) => c.ean && where.ean.in.includes(c.ean))
            .map((c) => ({ ean: c.ean })),
        update: async ({ where, data }: { where: { id: string }; data: { ean: null } }) =>
          Object.assign(products.flatMap((p) => p.colours).find((c) => c.id === where.id)!, data),
      },
      sapItem: {
        findFirst: async ({ where }: { where: { websiteProductId: string } }) => (linkedSlugs.includes(where.websiteProductId) ? { sapCode: '100234' } : null),
      },
      auditLog: { create: async ({ data }: { data: Record<string, unknown> }) => audit.push(data) },
      $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
    };
    const service = new AdminProductsService(prisma as never, { forget: () => undefined } as never);
    return { service, products, audit };
  }

  const product = (slug: string, extra: Partial<Product> = {}): Product => ({
    id: `id-${slug}`,
    slug,
    name: slug.toUpperCase(),
    status: ProductStatus.ACTIVE,
    ean: null,
    deletedAt: null,
    colours: [],
    ...extra,
  });

  it('hides a product, takes it off the shop and logs it', async () => {
    const db = fakeDb([product('hp-15s')]);
    await db.service.remove('hp-15s', 'admin-1');
    expect(db.products[0]).toMatchObject({ status: ProductStatus.INACTIVE });
    expect(db.products[0].deletedAt).toBeInstanceOf(Date);
    expect(db.audit).toEqual([
      { actorId: 'admin-1', action: 'PRODUCT_DELETED', targetType: 'Product', targetId: 'hp-15s', metadata: { name: 'HP-15S', from: 'ACTIVE', to: 'INACTIVE' } },
    ]);
  });

  it('keeps a deleted draft a draft, and restores it as one', async () => {
    const db = fakeDb([product('new-one', { status: ProductStatus.DRAFT })]);
    await db.service.remove('new-one', 'admin-1');
    expect(db.products[0].status).toBe(ProductStatus.DRAFT);
    expect(await db.service.restore('new-one', 'admin-1')).toMatchObject({ status: ProductStatus.DRAFT });
    expect(db.products[0]).toMatchObject({ deletedAt: null, status: ProductStatus.DRAFT });
  });

  it('refuses to delete a product a SAP code is linked to', async () => {
    const db = fakeDb([product('hp-15s')], ['hp-15s']);
    await expect(db.service.remove('hp-15s', 'admin-1')).rejects.toBeInstanceOf(ConflictException);
    expect(db.products[0].deletedAt).toBeNull();
  });

  it('restores a product that was on the shop off the shop, taking off any barcode another product has been given since', async () => {
    const db = fakeDb([
      product('hp-15s', {
        deletedAt: new Date(),
        status: ProductStatus.INACTIVE,
        ean: '8901234567890',
        colours: [
          { id: 'c1', ean: '4006381333931' },
          { id: 'c2', ean: '96385074' },
        ],
      }),
      product('dell-15', { ean: '8901234567890', colours: [{ id: 'c3', ean: '4006381333931' }] }),
    ]);
    const result = await db.service.restore('hp-15s', 'admin-1');
    expect(result).toEqual({ restored: 'hp-15s', status: ProductStatus.INACTIVE, clearedBarcodes: ['8901234567890', '4006381333931'] });
    expect(db.products[0]).toMatchObject({ deletedAt: null, status: ProductStatus.INACTIVE, ean: null });
    expect(db.products[0].colours).toEqual([
      { id: 'c1', ean: null },
      { id: 'c2', ean: '96385074' },
    ]);
    expect(db.audit[0]).toMatchObject({ action: 'PRODUCT_RESTORED', metadata: { clearedBarcodes: ['8901234567890', '4006381333931'] } });
  });
});
