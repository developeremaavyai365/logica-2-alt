/* The order rules the server uses, shared with the admin Orders pages so
   they show exactly the steps the server allows, and the invoice reads the
   same as the server's sums. Both files are plain TypeScript with no
   imports. */

export { STATUS_LABEL, ORDER_TABS, nextSteps, refundDue } from '../../backend/src/modules/orders/order-flow';
export type { OrderStatusName, OrderStep, PaymentMethodName, PaymentStatusName } from '../../backend/src/modules/orders/order-flow';
export { rupeesInWords } from '../../backend/src/modules/orders/invoice';
export type { InvoiceLine, InvoiceTotals } from '../../backend/src/modules/orders/invoice';

import type { OrderStatusName } from '../../backend/src/modules/orders/order-flow';

/** A status badge's colours. */
export const STATUS_STYLE: Record<OrderStatusName, string> = {
  PAYMENT_PENDING: 'bg-[#F1F2F6] text-[#6B7280]',
  PLACED: 'bg-[#EEF1FF] text-[#3D4FE0]',
  CONFIRMED: 'bg-violet-50 text-violet-700',
  PROCESSING: 'bg-amber-50 text-amber-700',
  SHIPPED: 'bg-sky-50 text-sky-700',
  OUT_FOR_DELIVERY: 'bg-sky-50 text-sky-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
  RETURNED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-[#F1F2F6] text-[#6B7280]',
};

export const paiseText = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const orderDate = (iso: string | Date, withTime = true) =>
  new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });

/** What the payment is, in words. */
export function paymentWords(method: 'COD' | 'ONLINE', status: string | null): string {
  if (method === 'COD') return status === 'CAPTURED' ? 'Cash collected' : status === 'REFUNDED' ? 'Refunded' : 'Cash on delivery';
  if (status === 'CAPTURED') return 'Paid online';
  if (status === 'REFUNDED') return 'Refunded';
  if (status === 'FAILED') return 'Payment failed';
  return 'Not paid yet';
}
