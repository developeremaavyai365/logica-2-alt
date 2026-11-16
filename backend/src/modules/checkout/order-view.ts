import { Order, OrderItem, OrderStatusHistory, Payment } from '@prisma/client';
import { PAYMENT_HOLD_MINUTES } from './pricing';

/** The delivery address as copied onto an order. */
export interface AddressSnapshot {
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

export type FullOrder = Order & {
  items: OrderItem[];
  payment: Payment | null;
  statusHistory?: OrderStatusHistory[];
};

/** An order as the customer's pages show it. */
export function toOrderView(order: FullOrder) {
  const mrpTotalPaise = order.items.reduce((sum, i) => sum + i.mrpPaise * i.quantity, 0);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.payment?.status ?? null,
    createdAt: order.createdAt,
    /** Until when an unpaid online order can still be paid. */
    payBy:
      order.status === 'PAYMENT_PENDING'
        ? new Date(order.createdAt.getTime() + PAYMENT_HOLD_MINUTES * 60_000)
        : null,
    subtotalPaise: order.subtotalPaise,
    shippingPaise: order.shippingPaise,
    totalPaise: order.totalPaise,
    mrpTotalPaise,
    address: order.shippingAddress as unknown as AddressSnapshot,
    items: order.items.map((i) => ({
      productId: i.productId,
      colour: i.colour,
      name: i.name,
      quantity: i.quantity,
      unitPricePaise: i.unitPricePaise,
      mrpPaise: i.mrpPaise,
    })),
    history: (order.statusHistory ?? [])
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((h) => ({ status: h.status, note: h.note, at: h.createdAt })),
  };
}

export type OrderView = ReturnType<typeof toOrderView>;
