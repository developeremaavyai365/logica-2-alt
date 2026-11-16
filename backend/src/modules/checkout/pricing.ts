/* What a cart costs and whether it can be ordered, worked out on the server
   from the SAP feed — never from prices the browser sends. Pure functions,
   so the rules can be tested without a database.

   A cart line names a website product and, for one sold colour by colour,
   the colour. It is sold under the SAP code an admin linked to that colour,
   or else the code linked to the whole product. A product with no linked
   code cannot be ordered online. */

/** Most units of one item in one order: enough for a family, not a reseller. */
export const MAX_PER_LINE = 5;
export const MAX_LINES = 20;
/** How long an unpaid online order holds its stock. */
export const PAYMENT_HOLD_MINUTES = 30;

export interface CartLineInput {
  productId: string;
  colour?: string | null;
  quantity: number;
}

export interface SellableItem {
  sapCode: string;
  websiteProductId: string | null;
  websiteColour: string | null;
  modelName: string;
  stock: number;
  mrpInPaise: number;
  mopInPaise: number;
  inLatestFeed: boolean;
  stockUpdatedAt: Date;
}

/** Units a website order has taken of a SAP code, and when. */
export interface Reservation {
  sapCode: string;
  quantity: number;
  placedAt: Date;
}

export type LineProblem =
  /** No SAP code is linked to this product (or colour). */
  | 'not_sold_online'
  /** The product is sold colour by colour and the line names none. */
  | 'choose_colour'
  | 'out_of_stock'
  /** Fewer left than asked for; `maxQuantity` says how many. */
  | 'not_enough_stock'
  /** More than MAX_PER_LINE asked for. */
  | 'over_limit';

export interface PricedLine {
  productId: string;
  colour: string | null;
  quantity: number;
  sapCode: string | null;
  name: string | null;
  unitPaise: number;
  mrpPaise: number;
  /** The most this line can be set to right now. */
  maxQuantity: number;
  problem: LineProblem | null;
}

export interface Totals {
  itemCount: number;
  /** What the items cost at MRP. */
  mrpTotalPaise: number;
  /** What they cost at the selling price (MOP). */
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
}

/** One line per product and colour, the same item added twice added up. */
export function mergeLines(lines: CartLineInput[]): CartLineInput[] {
  const merged = new Map<string, CartLineInput>();
  for (const line of lines) {
    const colour = line.colour || null;
    const key = `${line.productId}|${colour ?? ''}`;
    const existing = merged.get(key);
    if (existing) existing.quantity += line.quantity;
    else merged.set(key, { productId: line.productId, colour, quantity: line.quantity });
  }
  return [...merged.values()];
}

/** The SAP code a line is sold under: the chosen colour's own code, else
 *  the whole product's. */
export function itemFor(line: CartLineInput, items: SellableItem[]): SellableItem | 'choose_colour' | null {
  const forProduct = items.filter((i) => i.websiteProductId === line.productId);
  if (line.colour) {
    const own = forProduct.find((i) => i.websiteColour === line.colour);
    if (own) return own;
  }
  const whole = forProduct.find((i) => i.websiteColour === null);
  if (whole) return whole;
  // Sold colour by colour, and no (known) colour chosen.
  if (!line.colour && forProduct.length > 0) return 'choose_colour';
  return null;
}

/** Units of a code that can still be sold: the sheet's stock, less what
 *  website orders have taken since the sheet last changed that stock. A
 *  newer count from SAP is taken to include those orders already. */
export function availableUnits(item: SellableItem, reservations: Reservation[]): number {
  if (!item.inLatestFeed) return 0;
  const taken = reservations
    .filter((r) => r.sapCode === item.sapCode && r.placedAt > item.stockUpdatedAt)
    .reduce((sum, r) => sum + r.quantity, 0);
  return Math.max(0, item.stock - taken);
}

export function priceLines(lines: CartLineInput[], items: SellableItem[], reservations: Reservation[]): PricedLine[] {
  // Two lines can draw on the same code (two colours of a product sold
  // under one code), so stock is shared out line by line.
  const left = new Map<string, number>();

  return mergeLines(lines).map((line) => {
    const base = { productId: line.productId, colour: line.colour ?? null, quantity: line.quantity };
    const item = itemFor(line, items);
    if (item === null || item === 'choose_colour') {
      return {
        ...base,
        sapCode: null,
        name: null,
        unitPaise: 0,
        mrpPaise: 0,
        maxQuantity: 0,
        problem: item === null ? 'not_sold_online' : 'choose_colour',
      };
    }

    if (!left.has(item.sapCode)) left.set(item.sapCode, availableUnits(item, reservations));
    const stock = left.get(item.sapCode)!;
    const maxQuantity = Math.min(stock, MAX_PER_LINE);
    let problem: LineProblem | null = null;
    if (stock === 0) problem = 'out_of_stock';
    else if (line.quantity > stock) problem = 'not_enough_stock';
    else if (line.quantity > MAX_PER_LINE) problem = 'over_limit';
    if (!problem) left.set(item.sapCode, stock - line.quantity);

    return {
      ...base,
      sapCode: item.sapCode,
      name: item.modelName,
      unitPaise: item.mopInPaise,
      mrpPaise: Math.max(item.mrpInPaise, item.mopInPaise),
      maxQuantity,
      problem,
    };
  });
}

/** Totals over the lines that can be ordered. */
export function totals(lines: PricedLine[], shippingPaise: number): Totals {
  const ok = lines.filter((l) => !l.problem);
  const subtotalPaise = ok.reduce((sum, l) => sum + l.unitPaise * l.quantity, 0);
  return {
    itemCount: ok.reduce((sum, l) => sum + l.quantity, 0),
    mrpTotalPaise: ok.reduce((sum, l) => sum + l.mrpPaise * l.quantity, 0),
    subtotalPaise,
    shippingPaise: ok.length > 0 ? shippingPaise : 0,
    totalPaise: subtotalPaise + (ok.length > 0 ? shippingPaise : 0),
  };
}

const ORDER_CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** "LG261113-7KQ4XM": the date, then six characters that are never
 *  mistaken for one another (no 0/O, 1/I) when read out on the phone. */
export function newOrderNumber(now: Date, random: (n: number) => number = (n) => Math.floor(Math.random() * n)): string {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const date = ist.toISOString().slice(2, 10).replace(/-/g, '');
  const code = Array.from({ length: 6 }, () => ORDER_CODE_LETTERS[random(ORDER_CODE_LETTERS.length)]).join('');
  return `LG${date}-${code}`;
}
