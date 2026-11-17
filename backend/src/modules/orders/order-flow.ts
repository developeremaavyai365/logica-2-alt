/* How an order moves from "new" to "delivered", in the words the warehouse
   and the customer see. Plain TypeScript with no imports, so the admin page
   uses the same file and shows exactly the buttons the server allows. */

export type OrderStatusName =
  | 'PAYMENT_PENDING'
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethodName = 'COD' | 'ONLINE';
export type PaymentStatusName = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'PARTIALLY_REFUNDED' | 'REFUNDED';

/** Each status in the warehouse's words. */
export const STATUS_LABEL: Record<OrderStatusName, string> = {
  PAYMENT_PENDING: 'Awaiting payment',
  PLACED: 'New',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
};

/** One button on the order page: where it takes the order. */
export interface OrderStep {
  to: OrderStatusName;
  label: string;
  /** Shown under the button, so staff know what it does. */
  hint: string;
  /** Asks for the courier and tracking number. */
  needsTracking?: boolean;
  /** Asks for a reason. */
  needsNote?: boolean;
  /** A step that undoes the sale: shown apart, in red. */
  danger?: boolean;
}

const CANCEL: OrderStep = {
  to: 'CANCELLED',
  label: 'Cancel order',
  hint: 'The stock is freed and the customer is told.',
  needsNote: true,
  danger: true,
};

/** Money has been taken for the order: paid online, or cash collected. */
export function isPaid(payment: { method: PaymentMethodName; status: PaymentStatusName | null }): boolean {
  return payment.status === 'CAPTURED';
}

/** The buttons for an order as it stands. */
export function nextSteps(status: OrderStatusName, payment: { method: PaymentMethodName; status: PaymentStatusName | null }): OrderStep[] {
  switch (status) {
    case 'PAYMENT_PENDING':
      return [{ ...CANCEL, hint: 'The customer has not paid yet. The order also cancels itself after 30 minutes.' }];
    case 'PLACED':
      return [{ to: 'CONFIRMED', label: 'Confirm order', hint: 'Stock checked. Makes the GST invoice.' }, CANCEL];
    case 'CONFIRMED':
      return [{ to: 'PROCESSING', label: 'Mark packed', hint: 'Packed and ready to hand over.' }, CANCEL];
    case 'PROCESSING':
      return [
        { to: 'SHIPPED', label: 'Mark shipped', hint: 'Handed to the courier or rider.', needsTracking: true },
        CANCEL,
      ];
    case 'SHIPPED':
      return [
        { to: 'OUT_FOR_DELIVERY', label: 'Out for delivery', hint: 'With the delivery person today.' },
        { to: 'DELIVERED', label: 'Mark delivered', hint: payment.method === 'COD' ? 'Delivered and cash collected.' : 'Delivered to the customer.' },
        { to: 'RETURNED', label: 'Returned to us', hint: 'The parcel came back undelivered.', needsNote: true, danger: true },
      ];
    case 'OUT_FOR_DELIVERY':
      return [
        { to: 'DELIVERED', label: 'Mark delivered', hint: payment.method === 'COD' ? 'Delivered and cash collected.' : 'Delivered to the customer.' },
        { to: 'RETURNED', label: 'Returned to us', hint: 'The parcel came back undelivered.', needsNote: true, danger: true },
      ];
    case 'DELIVERED':
      return [{ to: 'RETURNED', label: 'Customer returned it', hint: 'The product came back after delivery.', needsNote: true, danger: true }];
    case 'RETURNED':
    case 'CANCELLED':
      return isPaid(payment)
        ? [{ to: 'REFUNDED', label: 'Mark refunded', hint: 'The money has been paid back to the customer.', needsNote: true }]
        : [];
    case 'REFUNDED':
      return [];
  }
}

/** Whether the warehouse may move an order from one status to another. */
export function canMove(
  from: OrderStatusName,
  to: OrderStatusName,
  payment: { method: PaymentMethodName; status: PaymentStatusName | null },
): boolean {
  return nextSteps(from, payment).some((s) => s.to === to);
}

/** Money owed back: paid, and the order did not go through. */
export function refundDue(status: OrderStatusName, payment: { method: PaymentMethodName; status: PaymentStatusName | null }): boolean {
  return (status === 'CANCELLED' || status === 'RETURNED') && isPaid(payment);
}

/** The groups on the admin Orders page, as tabs. */
export const ORDER_TABS: { key: string; label: string; statuses: OrderStatusName[] }[] = [
  { key: 'new', label: 'New', statuses: ['PLACED'] },
  { key: 'to-pack', label: 'To pack', statuses: ['CONFIRMED'] },
  { key: 'to-ship', label: 'To ship', statuses: ['PROCESSING'] },
  { key: 'on-the-way', label: 'On the way', statuses: ['SHIPPED', 'OUT_FOR_DELIVERY'] },
  { key: 'delivered', label: 'Delivered', statuses: ['DELIVERED'] },
  { key: 'closed', label: 'Cancelled & returned', statuses: ['CANCELLED', 'RETURNED', 'REFUNDED'] },
  { key: 'unpaid', label: 'Awaiting payment', statuses: ['PAYMENT_PENDING'] },
];

/** What the customer is told at each step, by email. Null: no email. */
export function customerMessage(
  status: OrderStatusName,
  order: { courierName?: string | null; trackingNumber?: string | null; note?: string | null; paymentMethod: PaymentMethodName },
): { subject: string; heading: string; body: string } | null {
  switch (status) {
    case 'PLACED':
      return {
        subject: 'We have your order',
        heading: 'Thank you for your order',
        body:
          order.paymentMethod === 'COD'
            ? 'We have received your order and will confirm it shortly. Please keep the amount ready to pay on delivery.'
            : 'We have received your order and your payment. We will confirm it shortly.',
      };
    case 'CONFIRMED':
      return { subject: 'Your order is confirmed', heading: 'Your order is confirmed', body: 'We are getting it ready to send.' };
    case 'SHIPPED':
      return {
        subject: 'Your order is on its way',
        heading: 'Your order is on its way',
        body: order.trackingNumber
          ? `It has been handed to ${order.courierName || 'the courier'}. Tracking number: ${order.trackingNumber}.`
          : `It has been handed to ${order.courierName || 'our delivery team'}.`,
      };
    case 'OUT_FOR_DELIVERY':
      return { subject: 'Your order arrives today', heading: 'Out for delivery', body: 'Your order is with the delivery person and arrives today.' };
    case 'DELIVERED':
      return { subject: 'Your order was delivered', heading: 'Delivered', body: 'Your order has been delivered. We hope you enjoy it.' };
    case 'CANCELLED':
      return {
        subject: 'Your order was cancelled',
        heading: 'Your order was cancelled',
        body: `${order.note ? `${order.note} ` : ''}If you paid online, the money will be returned to you.`,
      };
    case 'REFUNDED':
      return { subject: 'Your refund is on its way', heading: 'Refund made', body: 'We have paid the money back. Banks usually take 5 to 7 working days to show it.' };
    default:
      return null;
  }
}
