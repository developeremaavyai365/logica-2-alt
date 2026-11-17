import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutService } from '../checkout/checkout.service';
import { OrderNotifier } from '../checkout/order-notifier.service';
import { AddressSnapshot } from '../checkout/order-view';
import { ORDER_TABS, OrderStatusName, STATUS_LABEL, canMove, nextSteps, refundDue } from './order-flow';
import { InvoiceTotals, financialYear, invoiceNumber, invoiceTotals, stateOfGstin } from './invoice';

export interface ListOrdersQuery {
  tab?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
}

export interface MoveOrderInput {
  to: OrderStatusName;
  note?: string;
  courierName?: string;
  trackingNumber?: string;
}

/** What an invoice keeps, so it reads the same however the products,
 *  prices or the seller's details change later. */
export interface InvoiceSnapshot {
  seller: { name: string; gstin: string; address: string; state: string };
  buyer: { name: string; phone: string; address: string[]; state: string };
  totals: InvoiceTotals;
}

const PAGE_SIZE = 25;
const ORDER_INCLUDE = { items: true, payment: true, user: { select: { name: true, email: true, phone: true } } } as const;

/** The first day of a "YYYY-MM-DD" in India, and the day after the last. */
function dayRange(from?: string, to?: string): Prisma.DateTimeFilter | undefined {
  const day = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00+05:30`) : null);
  const start = day(from);
  const end = day(to);
  if (!start && !end) return undefined;
  return { ...(start ? { gte: start } : {}), ...(end ? { lt: new Date(end.getTime() + 86_400_000) } : {}) };
}

const customerName = (user: { name: string | null; email: string | null; phone: string | null }, address: AddressSnapshot) =>
  user.name || address.fullName || user.email || user.phone || 'Customer';

/** The warehouse's orders: what is waiting at each step, one order in
 *  full, moving an order on, its GST invoice, and an Excel sheet of orders. */
@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly checkout: CheckoutService,
    private readonly notifier: OrderNotifier,
  ) {}

  private where(query: ListOrdersQuery): Prisma.OrderWhereInput {
    const tab = ORDER_TABS.find((t) => t.key === query.tab);
    const q = query.q?.trim();
    return {
      ...(tab ? { status: { in: tab.statuses as OrderStatus[] } } : {}),
      ...(dayRange(query.from, query.to) ? { createdAt: dayRange(query.from, query.to) } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: 'insensitive' } },
              { user: { name: { contains: q, mode: 'insensitive' } } },
              { user: { email: { contains: q, mode: 'insensitive' } } },
              { user: { phone: { contains: q } } },
              { items: { some: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { sapCode: { contains: q, mode: 'insensitive' } }] } } },
              { trackingNumber: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  /** One page of orders, newest first, with how many wait at each step. */
  async list(query: ListOrdersQuery) {
    await this.checkout.expireUnpaid();
    const page = Math.max(1, query.page ?? 1);
    const where = this.where(query);
    const [orders, total, grouped] = await Promise.all([
      this.prisma.order.findMany({ where, include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
      this.prisma.order.count({ where }),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    const byStatus = new Map(grouped.map((g) => [g.status as OrderStatusName, g._count._all]));
    const counts: Record<string, number> = { all: [...byStatus.values()].reduce((a, b) => a + b, 0) };
    for (const t of ORDER_TABS) counts[t.key] = t.statuses.reduce((n, s) => n + (byStatus.get(s) ?? 0), 0);

    return {
      page,
      pageSize: PAGE_SIZE,
      total,
      counts,
      orders: orders.map((o) => {
        const address = o.shippingAddress as unknown as AddressSnapshot;
        const payment = { method: o.paymentMethod, status: o.payment?.status ?? null };
        return {
          orderNumber: o.orderNumber,
          createdAt: o.createdAt,
          status: o.status,
          statusLabel: STATUS_LABEL[o.status],
          paymentMethod: o.paymentMethod,
          paymentStatus: o.payment?.status ?? null,
          refundDue: refundDue(o.status, payment),
          totalPaise: o.totalPaise,
          itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
          firstItem: o.items[0]?.name ?? '',
          customer: customerName(o.user, address),
          place: `${address.city}, ${address.postalCode}`,
        };
      }),
    };
  }

  /** One order in full, with the steps it can take next. */
  async detail(orderNumber: string) {
    await this.checkout.expireUnpaid();
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { ...ORDER_INCLUDE, statusHistory: { orderBy: { createdAt: 'asc' } }, invoice: { select: { number: true, createdAt: true } } },
    });
    if (!order) throw new NotFoundException('Order not found.');

    const [products, actors] = await Promise.all([
      this.prisma.product.findMany({
        where: { slug: { in: order.items.map((i) => i.productId) } },
        select: { slug: true, imageUrl: true, colours: { select: { key: true, images: true } } },
      }),
      this.prisma.user.findMany({
        where: { id: { in: order.statusHistory.map((h) => h.actorId).filter((id): id is string => !!id) } },
        select: { id: true, name: true, email: true, role: true },
      }),
    ]);
    const photo = (slug: string, colour: string | null) => {
      const p = products.find((x) => x.slug === slug);
      return p?.colours.find((c) => c.key === colour)?.images[0] ?? p?.imageUrl ?? '';
    };
    const actorName = (id: string | null) => {
      const a = actors.find((x) => x.id === id);
      if (!a) return id ? 'Someone' : 'Automatic';
      return a.role === 'CUSTOMER' ? 'Customer' : a.name || a.email || 'Admin';
    };
    const payment = { method: order.paymentMethod, status: order.payment?.status ?? null };
    const address = order.shippingAddress as unknown as AddressSnapshot;

    return {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      statusLabel: STATUS_LABEL[order.status],
      steps: nextSteps(order.status, payment),
      refundDue: refundDue(order.status, payment),
      subtotalPaise: order.subtotalPaise,
      shippingPaise: order.shippingPaise,
      totalPaise: order.totalPaise,
      courierName: order.courierName,
      trackingNumber: order.trackingNumber,
      customer: { name: customerName(order.user, address), email: order.user.email, phone: order.user.phone },
      address,
      payment: {
        method: order.paymentMethod,
        status: order.payment?.status ?? null,
        gateway: order.payment?.gateway ?? null,
        paymentId: order.payment?.gatewayPaymentId ?? null,
        amountPaise: order.payment?.amountPaise ?? order.totalPaise,
      },
      items: order.items.map((i) => ({
        name: i.name,
        sapCode: i.sapCode,
        productId: i.productId,
        colour: i.colour,
        quantity: i.quantity,
        unitPricePaise: i.unitPricePaise,
        mrpPaise: i.mrpPaise,
        imageUrl: photo(i.productId, i.colour),
      })),
      history: order.statusHistory.map((h) => ({ status: h.status, label: STATUS_LABEL[h.status], note: h.note, at: h.createdAt, by: actorName(h.actorId) })),
      invoice: order.invoice,
    };
  }

  /** Moves an order one step, as the order page's buttons do. */
  async move(orderNumber: string, input: MoveOrderInput, actorId: string) {
    const note = input.note?.trim() || null;
    const courierName = input.courierName?.trim() || null;
    const trackingNumber = input.trackingNumber?.trim() || null;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { orderNumber }, include: { payment: true, invoice: { select: { id: true } } } });
      if (!order) throw new NotFoundException('Order not found.');
      const payment = { method: order.paymentMethod, status: order.payment?.status ?? null };
      if (!canMove(order.status, input.to, payment)) {
        throw new ConflictException(`This order is "${STATUS_LABEL[order.status]}" now, so it cannot be marked "${STATUS_LABEL[input.to]}". Reload the page.`);
      }
      const step = nextSteps(order.status, payment).find((s) => s.to === input.to)!;
      if (step.needsTracking && !courierName) throw new BadRequestException('Write who is delivering it: the courier, or "Own delivery".');
      if (step.needsNote && !note) throw new BadRequestException('Write the reason, for the record.');

      // Only if nobody moved it meanwhile.
      const moved = await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: {
          status: input.to as OrderStatus,
          ...(input.to === 'SHIPPED' ? { courierName, trackingNumber } : {}),
        },
      });
      if (moved.count === 0) throw new ConflictException('Someone else just changed this order. Reload the page.');

      if (order.payment) {
        // Cash collected at the door; money paid back.
        if (input.to === 'DELIVERED' && order.paymentMethod === 'COD') {
          await tx.payment.update({ where: { id: order.payment.id }, data: { status: PaymentStatus.CAPTURED } });
        }
        if (input.to === 'REFUNDED') {
          await tx.payment.update({ where: { id: order.payment.id }, data: { status: PaymentStatus.REFUNDED } });
        }
        if (input.to === 'CANCELLED' && order.payment.status === PaymentStatus.PENDING) {
          await tx.payment.update({ where: { id: order.payment.id }, data: { status: PaymentStatus.FAILED } });
        }
      }
      if (input.to === 'CONFIRMED' && !order.invoice) await this.createInvoice(tx, order.id);

      const shippedNote = input.to === 'SHIPPED' ? [courierName, trackingNumber ? `tracking ${trackingNumber}` : null].filter(Boolean).join(', ') : null;
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: input.to as OrderStatus, note: [shippedNote, note].filter(Boolean).join('. ') || null, actorId },
      });
      await tx.auditLog.create({
        data: {
          actorId,
          action: `ORDER_${input.to}`,
          targetType: 'Order',
          targetId: order.id,
          metadata: { orderNumber, from: order.status, to: input.to, note, courierName, trackingNumber },
        },
      });
    });

    this.logger.log(`[ORDER] ${orderNumber} -> ${input.to}`);
    void this.notifier.statusChanged(orderNumber, input.to, note);
    return this.detail(orderNumber);
  }

  /** The seller on invoices, from the settings. */
  seller(): InvoiceSnapshot['seller'] {
    const gstin = (this.config.get<string>('SELLER_GSTIN') ?? '').trim().toUpperCase();
    return {
      name: this.config.get<string>('SELLER_NAME') ?? 'Logica Infoway Limited',
      gstin,
      address: this.config.get<string>('SELLER_ADDRESS') ?? '',
      state: stateOfGstin(gstin) ?? '',
    };
  }

  /** Makes the order's invoice: the next number in this financial year,
   *  and the GST worked out once and kept. */
  private async createInvoice(tx: Prisma.TransactionClient, orderId: string) {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true, user: { select: { name: true } } } });
    const products = await tx.product.findMany({
      where: { slug: { in: order.items.map((i) => i.productId) } },
      select: { slug: true, hsnCode: true, gstRatePercent: true },
    });
    const address = order.shippingAddress as unknown as AddressSnapshot;
    const seller = this.seller();
    const totals = invoiceTotals(
      order.items.map((i) => {
        const p = products.find((x) => x.slug === i.productId);
        return { name: i.name, sapCode: i.sapCode, hsnCode: p?.hsnCode ?? null, gstRatePercent: p?.gstRatePercent ?? null, quantity: i.quantity, unitPricePaise: i.unitPricePaise };
      }),
      order.shippingPaise,
      seller,
      { state: address.state },
    );
    const snapshot: InvoiceSnapshot = {
      seller,
      buyer: {
        name: address.fullName,
        phone: address.phone,
        address: [address.line1, address.line2, address.landmark ? `Near ${address.landmark}` : null, `${address.city}, ${address.state} ${address.postalCode}`].filter(
          (l): l is string => !!l,
        ),
        state: address.state,
      },
      totals,
    };

    const year = financialYear(new Date());
    // The highest number so far this year, plus one. The number is unique,
    // so two invoices made at the same moment cannot share it: the
    // transaction fails and the button can simply be pressed again.
    const last = await tx.invoice.findFirst({ where: { number: { startsWith: `LIL/${year}/` } }, orderBy: { number: 'desc' }, select: { number: true } });
    const seq = last ? Number(last.number.split('/').pop()) + 1 : 1;
    await tx.invoice.create({
      data: {
        orderId,
        number: invoiceNumber(year, seq),
        pdfUrl: `/admin/orders/${order.orderNumber}/print/invoice`,
        gstDetails: snapshot as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /** The invoice to print. */
  async invoice(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { invoice: true, payment: { select: { status: true, gatewayPaymentId: true } } },
    });
    if (!order) throw new NotFoundException('Order not found.');
    if (!order.invoice) throw new NotFoundException('The invoice is made when the order is confirmed.');
    const snapshot = order.invoice.gstDetails as unknown as InvoiceSnapshot;
    return {
      number: order.invoice.number,
      date: order.invoice.createdAt,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.payment?.status ?? null,
      ...snapshot,
    };
  }

  /** The orders as an Excel sheet, one row per item, for accounts and SAP. */
  async export(query: ListOrdersQuery): Promise<{ buffer: Buffer; fileName: string }> {
    const orders = await this.prisma.order.findMany({
      where: this.where(query),
      include: { ...ORDER_INCLUDE, invoice: { select: { number: true } } },
      orderBy: { createdAt: 'asc' },
      take: 20_000,
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Logica Admin';
    const sheet = workbook.addWorksheet('Orders', { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = [
      { header: 'Order number', key: 'order', width: 18 },
      { header: 'Date', key: 'date', width: 18 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Payment', key: 'method', width: 16 },
      { header: 'Payment status', key: 'paymentStatus', width: 15 },
      { header: 'Payment ID', key: 'paymentId', width: 22 },
      { header: 'Invoice number', key: 'invoice', width: 20 },
      { header: 'Customer', key: 'customer', width: 22 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Phone', key: 'phone', width: 14 },
      { header: 'City', key: 'city', width: 14 },
      { header: 'State', key: 'state', width: 14 },
      { header: 'Pincode', key: 'pincode', width: 9 },
      { header: 'Item code (SAP)', key: 'sapCode', width: 15 },
      { header: 'Product', key: 'product', width: 40 },
      { header: 'Qty', key: 'qty', width: 6 },
      { header: 'Unit price (₹)', key: 'unit', width: 13 },
      { header: 'Line total (₹)', key: 'line', width: 13 },
      { header: 'Order total (₹)', key: 'total', width: 14 },
      { header: 'Courier', key: 'courier', width: 16 },
      { header: 'Tracking number', key: 'tracking', width: 20 },
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF0FD' } };
    for (const key of ['unit', 'line', 'total']) sheet.getColumn(key).numFmt = '#,##0.00';

    for (const o of orders) {
      const address = o.shippingAddress as unknown as AddressSnapshot;
      for (const i of o.items) {
        sheet.addRow({
          order: o.orderNumber,
          date: o.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
          status: STATUS_LABEL[o.status],
          method: o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online',
          paymentStatus: o.payment?.status ?? '',
          paymentId: o.payment?.gatewayPaymentId ?? '',
          invoice: o.invoice?.number ?? '',
          customer: customerName(o.user, address),
          email: o.user.email ?? '',
          phone: address.phone,
          city: address.city,
          state: address.state,
          pincode: address.postalCode,
          sapCode: i.sapCode,
          product: i.name,
          qty: i.quantity,
          unit: i.unitPricePaise / 100,
          line: (i.unitPricePaise * i.quantity) / 100,
          total: o.totalPaise / 100,
          courier: o.courierName ?? '',
          tracking: o.trackingNumber ?? '',
        });
      }
    }

    const range = [query.from, query.to].filter(Boolean).join(' to ') || 'all dates';
    return { buffer: Buffer.from(await workbook.xlsx.writeBuffer()), fileName: `Logica orders (${range}).xlsx` };
  }
}
