import { ProductStatus } from '@prisma/client';

/* The admin products list: what each product shows on the shop and what is
   missing from its listing. Kept apart from the database code so it can be
   tested on its own. */

export interface ProductRowInput {
  slug: string;
  name: string;
  status: ProductStatus;
  imageUrl: string;
  position: number;
  priceInPaise: number;
  mrpInPaise: number | null;
  inStock: boolean;
  ean: string | null;
  updatedAt: Date;
  deletedAt?: Date | null;
  brand: { name: string } | null;
  category: { slug: string; name: string };
  colours: { key: string; name: string; ean: string | null }[];
}

/** A SAP code linked to a website product. */
export interface LinkedSapInput {
  sapCode: string;
  websiteProductId: string | null;
  websiteColour: string | null;
  mopInPaise: number;
  mrpInPaise: number;
  stock: number;
  ean: string | null;
}

export type ProductIssue = 'missing-ean' | 'not-linked' | 'out-of-stock';
export type ProductSort = 'shop' | 'name' | 'recent' | 'price';

export interface AdminProductRow {
  slug: string;
  name: string;
  brand: string;
  category: { slug: string; name: string };
  status: ProductStatus;
  imageUrl: string;
  position: number;
  updatedAt: string;
  /** When it was deleted; null for a product not deleted. */
  deletedAt: string | null;
  /** Where the shop's price and stock come from: the linked SAP codes, or
   *  the catalogue's own values while none is linked. */
  source: 'sap' | 'catalogue';
  pricePaise: number;
  mrpPaise: number | null;
  /** Units in the SAP sheet; null for a product priced from the catalogue. */
  stock: number | null;
  inStock: boolean;
  sapCodes: { sapCode: string; colour: string | null; stock: number; mopInPaise: number; mrpInPaise: number }[];
  /** Barcodes: how many of the product's sellable units (the product, or each
   *  colour) have one, and the code itself when there is a single unit. */
  ean: { have: number; need: number; value: string | null };
  colourCount: number;
  issues: ProductIssue[];
}

const present = (code: string | null | undefined): code is string => !!code && code.trim() !== '';

export function summariseProduct(product: ProductRowInput, linked: LinkedSapInput[]): AdminProductRow {
  const codes = linked.filter((s) => s.websiteProductId === product.slug);
  const whole = codes.filter((s) => !s.websiteColour);

  let source: AdminProductRow['source'] = 'catalogue';
  let pricePaise = product.priceInPaise;
  let mrpPaise = product.mrpInPaise;
  let stock: number | null = null;
  let inStock = product.inStock;
  if (codes.length > 0) {
    // As the shop shows it: from the cheapest linked code, in stock if any is.
    const cheapest = [...codes].sort((a, b) => a.mopInPaise - b.mopInPaise)[0];
    source = 'sap';
    pricePaise = cheapest.mopInPaise;
    mrpPaise = cheapest.mrpInPaise;
    stock = codes.reduce((sum, s) => sum + Math.max(0, s.stock), 0);
    inStock = stock > 0;
  }

  let ean: AdminProductRow['ean'];
  if (product.colours.length === 0) {
    const value = [product.ean, ...codes.map((s) => s.ean)].find(present) ?? null;
    ean = { have: value ? 1 : 0, need: 1, value };
  } else {
    // Each colour is its own sellable unit with its own barcode.
    const have = product.colours.filter(
      (c) => present(c.ean) || codes.some((s) => s.websiteColour === c.key && present(s.ean)),
    ).length;
    ean = { have, need: product.colours.length, value: null };
  }

  const issues: ProductIssue[] = [];
  if (ean.have < ean.need) issues.push('missing-ean');
  if (codes.length === 0) issues.push('not-linked');
  if (!inStock) issues.push('out-of-stock');

  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name ?? '',
    category: product.category,
    status: product.status,
    imageUrl: product.imageUrl,
    position: product.position,
    updatedAt: product.updatedAt.toISOString(),
    deletedAt: product.deletedAt ? product.deletedAt.toISOString() : null,
    source,
    pricePaise,
    mrpPaise,
    stock,
    inStock,
    sapCodes: [...whole, ...codes.filter((s) => s.websiteColour)].map((s) => ({
      sapCode: s.sapCode,
      colour: s.websiteColour,
      stock: s.stock,
      mopInPaise: s.mopInPaise,
      mrpInPaise: s.mrpInPaise,
    })),
    ean,
    colourCount: product.colours.length,
    issues,
  };
}

export interface ListQuery {
  search?: string;
  category?: string;
  brand?: string;
  status?: ProductStatus;
  issue?: ProductIssue;
  sort?: ProductSort;
  page: number;
  pageSize: number;
}

const matchesSearch = (row: AdminProductRow, term: string) => {
  const t = term.toLowerCase();
  return (
    row.name.toLowerCase().includes(t) ||
    row.slug.includes(t) ||
    row.brand.toLowerCase().includes(t) ||
    row.sapCodes.some((s) => s.sapCode.toLowerCase().includes(t)) ||
    (row.ean.value ?? '').includes(t)
  );
};

const SORTS: Record<ProductSort, (a: AdminProductRow, b: AdminProductRow) => number> = {
  shop: (a, b) => a.position - b.position || a.slug.localeCompare(b.slug),
  name: (a, b) => a.name.localeCompare(b.name),
  recent: (a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.position - b.position,
  price: (a, b) => a.pricePaise - b.pricePaise || a.position - b.position,
};

/** Filters, counts and one page of the list.
 *
 *  The counts follow the other filters, so each tab and chip says how many
 *  it would show: status counts ignore the status filter, issue counts
 *  ignore the issue filter. */
export function listProducts(rows: AdminProductRow[], query: ListQuery) {
  const term = query.search?.trim();
  const base = rows.filter(
    (r) =>
      (!term || matchesSearch(r, term)) &&
      (!query.category || r.category.slug === query.category) &&
      (!query.brand || r.brand === query.brand),
  );
  const withStatus = base.filter((r) => !query.status || r.status === query.status);
  const matching = withStatus.filter((r) => !query.issue || r.issues.includes(query.issue));

  const countStatus = (s: ProductStatus) => base.filter((r) => r.status === s).length;
  const countIssue = (i: ProductIssue) => withStatus.filter((r) => r.issues.includes(i)).length;

  const sorted = [...matching].sort(SORTS[query.sort ?? 'shop']);
  const start = (query.page - 1) * query.pageSize;

  return {
    total: matching.length,
    page: query.page,
    pageSize: query.pageSize,
    counts: {
      all: base.length,
      ACTIVE: countStatus(ProductStatus.ACTIVE),
      DRAFT: countStatus(ProductStatus.DRAFT),
      INACTIVE: countStatus(ProductStatus.INACTIVE),
      'missing-ean': countIssue('missing-ean'),
      'not-linked': countIssue('not-linked'),
      'out-of-stock': countIssue('out-of-stock'),
    },
    items: sorted.slice(start, start + query.pageSize),
  };
}
