import { useSyncExternalStore } from 'react';
import { apiFetch } from './api-client';
import type { CartLine } from '../store';
import { isOrderable, liveCatalogueLoaded } from '../live-catalogue';

/* Checkout as the backend runs it: whether ordering is open, what a cart
   costs (priced on the server from the SAP feed), placing an order, and
   the orders themselves. */

export interface CheckoutConfig {
  enabled: boolean;
  cod: { enabled: boolean; maxPaise: number };
  online: { mode: 'off' | 'test' };
  shippingPaise: number;
}

export type LineProblem = 'not_sold_online' | 'choose_colour' | 'out_of_stock' | 'not_enough_stock' | 'over_limit';

export interface QuoteLine {
  productId: string;
  colour: string | null;
  quantity: number;
  sapCode: string | null;
  name: string | null;
  unitPaise: number;
  mrpPaise: number;
  maxQuantity: number;
  problem: LineProblem | null;
}

export interface Quote {
  lines: QuoteLine[];
  itemCount: number;
  mrpTotalPaise: number;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  orderable: boolean;
  cod: { allowed: boolean; reason: string | null };
  online: { allowed: boolean; mode: 'off' | 'test' };
}

export interface PlacedOrder {
  orderNumber: string;
  status: string;
  paymentMethod: 'COD' | 'ONLINE';
  totalPaise: number;
  next: 'pay' | 'done';
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  label: string;
}

export interface OrderView {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: string | null;
  createdAt: string;
  payBy: string | null;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  mrpTotalPaise: number;
  address: OrderAddress;
  items: {
    productId: string;
    colour: string | null;
    name: string;
    quantity: number;
    unitPricePaise: number;
    mrpPaise: number;
  }[];
  history: { status: string; note: string | null; at: string }[];
}

/** What each problem means to a shopper. */
export function problemText(line: QuoteLine): string {
  switch (line.problem) {
    case 'not_sold_online':
      return 'Not available to order online yet. Please remove it to continue.';
    case 'choose_colour':
      return 'Please choose a colour for this item on its page.';
    case 'out_of_stock':
      return 'Out of stock. Please remove it to continue.';
    case 'not_enough_stock':
      return `Only ${line.maxQuantity} left. Please reduce the quantity.`;
    case 'over_limit':
      return `You can buy up to ${line.maxQuantity} of this item in one order.`;
    default:
      return '';
  }
}

export const toQuoteLines = (cart: CartLine[]) =>
  cart.map((l) => ({ productId: l.id, ...(l.colour && { colour: l.colour }), quantity: l.qty }));

export const getQuote = (cart: CartLine[]) =>
  apiFetch<Quote>('/checkout/quote', { method: 'POST', body: { lines: toQuoteLines(cart) } });

export const placeOrder = (body: {
  addressId: string;
  paymentMethod: 'COD' | 'ONLINE';
  lines: ReturnType<typeof toQuoteLines>;
  idempotencyKey: string;
}) => apiFetch<PlacedOrder>('/checkout/orders', { method: 'POST', body });

export const testPayment = (orderNumber: string, outcome: 'success' | 'failure') =>
  apiFetch<OrderView>(`/checkout/orders/${orderNumber}/test-payment`, { method: 'POST', body: { outcome } });

export const getOrder = (orderNumber: string) => apiFetch<OrderView>(`/orders/${encodeURIComponent(orderNumber)}`);
export const listOrders = () => apiFetch<OrderView[]>('/orders');

export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

// ── Whether ordering is open ─────────────────────────────────────────────
// Fetched once per visit and shared, so the shop's buttons and the cart all
// agree. Null until it arrives (or if the backend cannot be reached), in
// which case the shop behaves as before checkout existed.

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
let config: CheckoutConfig | null = null;
let requested = false;
const listeners = new Set<() => void>();

function loadConfig() {
  if (requested || !API_URL) return;
  requested = true;
  fetch(`${API_URL}/checkout/config`, { credentials: 'omit' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data: CheckoutConfig | null) => {
      if (data && typeof data.enabled === 'boolean') {
        config = data;
        listeners.forEach((l) => l());
      }
    })
    .catch(() => {
      // Backend unreachable: keep null.
    });
}

const subscribe = (listener: () => void) => {
  loadConfig();
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useCheckoutConfig(): CheckoutConfig | null {
  return useSyncExternalStore(subscribe, () => config);
}

/** Whether the shop should offer "Add to cart" for a product (in a colour).
 *  Only once ordering is open and the live list is known: a product with
 *  no SAP code cannot be ordered, so it shows "Currently unavailable". */
export function useCanOrder(): (productId: string, colour?: string | null) => boolean {
  const cfg = useCheckoutConfig();
  return (productId, colour) => !(cfg?.enabled && liveCatalogueLoaded() && !isOrderable(productId, colour));
}
