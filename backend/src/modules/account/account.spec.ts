import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { AddressesService, MAX_ADDRESSES } from './addresses.service';
import { AddressDto } from './dto/address.dto';
import { MAX_WISHLIST, WishlistService } from './wishlist.service';

/* A small in-memory stand-in for the two Prisma tables these services use,
   with just the queries they make. */
type Row = Record<string, any>;

function matches(row: Row, where: Row = {}): boolean {
  return Object.entries(where).every(([k, v]) => {
    if (k === 'NOT') return !matches(row, v);
    if (k === 'userId_productId') return row.userId === v.userId && row.productId === v.productId;
    return row[k] === v;
  });
}

function table(rows: Row[], prefix: string) {
  let seq = 0;
  let clock = 0;
  const sorted = (list: Row[], orderBy: Row | Row[] = []) => {
    const keys = (Array.isArray(orderBy) ? orderBy : [orderBy]).flatMap((o) => Object.entries(o));
    return [...list].sort((a, b) => {
      for (const [k, dir] of keys) {
        const x = typeof a[k] === 'boolean' ? Number(a[k]) : a[k];
        const y = typeof b[k] === 'boolean' ? Number(b[k]) : b[k];
        if (x !== y) return (x < y ? -1 : 1) * (dir === 'desc' ? -1 : 1);
      }
      return 0;
    });
  };
  return {
    rows,
    findMany: async ({ where, orderBy, select }: Row = {}) =>
      sorted(rows.filter((r) => matches(r, where)), orderBy).map((r) =>
        select ? Object.fromEntries(Object.keys(select).map((k) => [k, r[k]])) : { ...r },
      ),
    findFirst: async ({ where, orderBy }: Row = {}) => {
      const found = sorted(rows.filter((r) => matches(r, where)), orderBy)[0];
      return found ? { ...found } : null;
    },
    count: async ({ where }: Row = {}) => rows.filter((r) => matches(r, where)).length,
    create: async ({ data }: Row) => {
      const row = { id: `${prefix}-${++seq}`, createdAt: new Date(++clock), deletedAt: null, ...data };
      rows.push(row);
      return { ...row };
    },
    createMany: async ({ data }: Row) => {
      for (const d of data) {
        if (!rows.some((r) => r.userId === d.userId && r.productId === d.productId)) {
          rows.push({ id: `${prefix}-${++seq}`, createdAt: new Date(++clock), ...d });
        }
      }
      return { count: data.length };
    },
    update: async ({ where, data }: Row) => {
      const row = rows.find((r) => r.id === where.id)!;
      Object.assign(row, data);
      return { ...row };
    },
    updateMany: async ({ where, data }: Row) => {
      const hit = rows.filter((r) => matches(r, where));
      hit.forEach((r) => Object.assign(r, data));
      return { count: hit.length };
    },
    deleteMany: async ({ where }: Row) => {
      const before = rows.length;
      for (let i = rows.length - 1; i >= 0; i--) if (matches(rows[i], where)) rows.splice(i, 1);
      return { count: before - rows.length };
    },
  };
}

function fakePrisma() {
  const prisma: any = { address: table([], 'addr'), wishlistItem: table([], 'wish') };
  prisma.$transaction = (fn: (tx: unknown) => unknown) => fn(prisma);
  return prisma;
}

const address = (overrides: Partial<AddressDto> = {}): AddressDto =>
  Object.assign(new AddressDto(), {
    fullName: 'Asha Verma',
    phone: '9876543210',
    postalCode: '110020',
    line1: '21/26 Sanjay Colony',
    city: 'New Delhi',
    state: 'Delhi',
    label: 'Home',
    ...overrides,
  });

async function errorsFor(body: Record<string, unknown>) {
  const dto = plainToInstance(AddressDto, body);
  const errors = await validate(dto);
  return { dto, fields: errors.map((e) => e.property) };
}

describe('address form rules', () => {
  const valid = {
    fullName: '  Asha Verma ',
    phone: '+91 98765-43210',
    postalCode: '110020',
    line1: '21/26 Sanjay Colony',
    city: 'New Delhi',
    state: 'Delhi',
    label: 'Home',
  };

  it('accepts a normal address and tidies the phone number and name', async () => {
    const { dto, fields } = await errorsFor(valid);
    expect(fields).toEqual([]);
    expect(dto.phone).toBe('9876543210');
    expect(dto.fullName).toBe('Asha Verma');
  });

  it('refuses a phone that is not an Indian mobile', async () => {
    expect((await errorsFor({ ...valid, phone: '12345' })).fields).toContain('phone');
    expect((await errorsFor({ ...valid, phone: '5876543210' })).fields).toContain('phone');
  });

  it('refuses a PIN code that is not six digits or starts with 0', async () => {
    expect((await errorsFor({ ...valid, postalCode: '11002' })).fields).toContain('postalCode');
    expect((await errorsFor({ ...valid, postalCode: '010020' })).fields).toContain('postalCode');
  });

  it('only takes states from the list, and Home / Work / Other', async () => {
    expect((await errorsFor({ ...valid, state: 'Delhii' })).fields).toContain('state');
    expect((await errorsFor({ ...valid, label: 'Office' })).fields).toContain('label');
  });
});

describe('saved addresses', () => {
  let prisma: ReturnType<typeof fakePrisma>;
  let service: AddressesService;

  beforeEach(() => {
    prisma = fakePrisma();
    service = new AddressesService(prisma);
  });

  it('makes the first address the default, and later ones not unless asked', async () => {
    const first = await service.create('u1', address());
    const second = await service.create('u1', address({ line1: 'Second house' }));
    expect(first.isDefault).toBe(true);
    expect(second.isDefault).toBe(false);
  });

  it('keeps exactly one default when another is chosen', async () => {
    const first = await service.create('u1', address());
    const second = await service.create('u1', address({ line1: 'Second house', isDefault: true }));
    const list = await service.list('u1');
    expect(list.filter((a) => a.isDefault).map((a) => a.id)).toEqual([second.id]);
    expect(list[0].id).toBe(second.id);

    const after = await service.makeDefault('u1', first.id);
    expect(after.filter((a) => a.isDefault).map((a) => a.id)).toEqual([first.id]);
  });

  it('does not let the default be switched off without picking another', async () => {
    const only = await service.create('u1', address());
    const edited = await service.update('u1', only.id, address({ city: 'Gurugram', state: 'Haryana', isDefault: false }));
    expect(edited.isDefault).toBe(true);
    expect(edited.city).toBe('Gurugram');
  });

  it('hides a removed address but keeps the row, and hands the default on', async () => {
    const older = await service.create('u1', address());
    const newer = await service.create('u1', address({ line1: 'Newer house' }));
    const list = await service.remove('u1', older.id);
    expect(list.map((a) => a.id)).toEqual([newer.id]);
    expect(list[0].isDefault).toBe(true);
    expect(prisma.address.rows).toHaveLength(2);
  });

  it("never shows or changes someone else's address", async () => {
    const theirs = await service.create('u2', address());
    expect(await service.list('u1')).toEqual([]);
    await expect(service.update('u1', theirs.id, address({ city: 'Hacked' }))).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove('u1', theirs.id)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.makeDefault('u1', theirs.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it(`stops at ${MAX_ADDRESSES} addresses`, async () => {
    for (let i = 0; i < MAX_ADDRESSES; i++) await service.create('u1', address({ line1: `House ${i}` }));
    await expect(service.create('u1', address())).rejects.toThrow(/up to/);
  });
});

describe('wishlist on the account', () => {
  let service: WishlistService;

  beforeEach(() => {
    service = new WishlistService(fakePrisma());
  });

  it('adds once, removes, and keeps the order things were saved in', async () => {
    await service.add('u1', 'hp-15s');
    await service.add('u1', 'iphone-16');
    expect(await service.add('u1', 'hp-15s')).toEqual(['hp-15s', 'iphone-16']);
    expect(await service.remove('u1', 'hp-15s')).toEqual(['iphone-16']);
  });

  it("merges what was saved before signing in, without duplicates or touching others' lists", async () => {
    await service.add('u1', 'hp-15s');
    await service.add('u2', 'dell-xps');
    expect(await service.merge('u1', ['iphone-16', 'hp-15s', 'iphone-16'])).toEqual(['hp-15s', 'iphone-16']);
    expect(await service.list('u2')).toEqual(['dell-xps']);
  });

  it(`never holds more than ${MAX_WISHLIST}`, async () => {
    const many = Array.from({ length: MAX_WISHLIST + 10 }, (_, i) => `p-${i}`);
    expect(await service.merge('u1', many)).toHaveLength(MAX_WISHLIST);
    await expect(service.add('u1', 'one-more')).rejects.toThrow(/up to/);
  });
});
