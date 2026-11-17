import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma, ProductStatus } from '@prisma/client';
import { randomBytes, randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AddressesService } from '../account/addresses.service';
import { OrderNotifier } from './order-notifier.service';
import { AddressSnapshot, OrderView, toOrderView } from './order-view';
import {
  CartLineInput,
  PAYMENT_HOLD_MINUTES,
  PricedLine,
  Reservation,
  SellableItem,
  Totals,
  mergeLines,
  newOrderNumber,
  priceLines,
  totals,
} from './pricing';

export interface CheckoutSettings {
  enabled: boolean;
  paymentMode: 'off' | 'test';
  codEnabled: boolean;
  codMaxPaise: number;
  shippingPaise: number;
}

export interface Quote extends Totals {
  lines: PricedLine[];
  /** True when every line can be ordered as it is. */
  orderable: boolean;
  cod: { allowed: boolean; reason: string | null };
  online: { allowed: boolean; mode: 'off' | 'test' };
}

export interface PlacedOrder {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalPaise: number;
  /** "pay": go to the payment page. "done": nothing more to do. */
  next: 'pay' | 'done';
}

type Tx = Prisma.TransactionClient;

const SELLABLE_FIELDS = {
  sapCode: true,
  websiteProductId: true,
  websiteColour: true,
  modelName: true,
  stock: true,
  mrpInPaise: true,
  mopInPaise: true,
  inLatestFeed: true,
  stockUpdatedAt: true,
} as const;

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

/** Prices a cart, places orders and takes (for now, pretend) payments.
 *  Every price and stock figure comes from the SAP feed on the server. */
@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly addresses: AddressesService,
    private readonly notifier: OrderNotifier,
  ) {}

  settings(): CheckoutSettings {
    return {
      enabled: this.config.get('CHECKOUT_ENABLED') === 'true',
      paymentMode: this.config.get('PAYMENT_MODE') === 'test' ? 'test' : 'off',
      codEnabled: this.config.get('COD_ENABLED') !== 'false',
      codMaxPaise: Number(this.config.get('COD_MAX_RUPEES') ?? 50_000) * 100,
      shippingPaise: Number(this.config.get('SHIPPING_FEE_RUPEES') ?? 0) * 100,
    };
  }

  /** What the cart costs now and what stands in the way of ordering it. */
  async quote(lines: CartLineInput[]): Promise<Quote> {
    await this.expireUnpaid();
    return this.prisma.$transaction((tx) => this.priceWith(tx, lines, false));
  }

  async place(
    userId: string,
    input: { addressId: string; paymentMethod: 'COD' | 'ONLINE'; lines: CartLineInput[]; idempotencyKey: string },
  ): Promise<PlacedOrder> {
    const settings = this.settings();
    if (!settings.enabled) throw new ForbiddenException('Online ordering is not open yet.');

    const repeat = await this.byIdempotencyKey(userId, input.idempotencyKey);
    if (repeat) return repeat;
    await this.expireUnpaid();

    // A clash on the random order number is retried; a clash on the
    // idempotency key means the same attempt arrived twice at once.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const placed = await this.prisma.$transaction((tx) => this.create(tx, userId, input, settings), { timeout: 15_000 });
        // Cash on delivery is a new order at once; an online one once paid.
        if (placed.status === OrderStatus.PLACED) void this.notifier.orderPlaced(placed.orderNumber);
        return placed;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          const target = String(err.meta?.target ?? '');
          if (target.includes('idempotencyKey')) {
            const existing = await this.byIdempotencyKey(userId, input.idempotencyKey);
            if (existing) return existing;
          }
          if (target.includes('orderNumber')) continue;
        }
        throw err;
      }
    }
    throw new ConflictException('Could not place the order. Please try again.');
  }

  /** The pretend payment page's answer. Only in PAYMENT_MODE=test. */
  async testPayment(userId: string, orderNumber: string, outcome: 'success' | 'failure'): Promise<OrderView> {
    if (this.settings().paymentMode !== 'test') throw new NotFoundException();
    await this.expireUnpaid();

    const order = await this.prisma.order.findFirst({
      where: { orderNumber, userId },
      include: { items: true, payment: true },
    });
    if (!order) throw new NotFoundException('Order not found.');
    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException(`The ${PAYMENT_HOLD_MINUTES} minutes to pay for this order have passed, so it was cancelled.`);
    }
    if (order.status !== OrderStatus.PAYMENT_PENDING || !order.payment) {
      throw new ConflictException('This order is already paid.');
    }

    if (outcome === 'failure') {
      await this.prisma.payment.update({ where: { id: order.payment.id }, data: { status: PaymentStatus.FAILED } });
    } else {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: order.payment.id },
          data: { status: PaymentStatus.CAPTURED, gatewayPaymentId: `test_pay_${randomBytes(6).toString('hex')}` },
        }),
        this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.PLACED } }),
        this.prisma.orderStatusHistory.create({
          data: { orderId: order.id, status: OrderStatus.PLACED, note: 'Payment received (test mode).', actorId: userId },
        }),
      ]);
      this.logger.log(`[ORDER] ${order.orderNumber} paid (test) — ${rupees(order.totalPaise)}`);
      void this.notifier.orderPlaced(order.orderNumber);
    }
    return this.orderFor(userId, orderNumber);
  }

  async orderFor(userId: string, orderNumber: string): Promise<OrderView> {
    const order = await this.prisma.order.findFirst({
      where: { orderNumber, userId },
      include: { items: true, payment: true, statusHistory: true },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return toOrderView(order);
  }

  async ordersFor(userId: string): Promise<OrderView[]> {
    await this.expireUnpaid();
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, payment: true },
      take: 100,
    });
    return orders.map(toOrderView);
  }

  /** Cancels online orders left unpaid past the hold, giving their stock
   *  back. Run whenever orders or stock are looked at, so no timer is
   *  needed. */
  async expireUnpaid(now = new Date()): Promise<number> {
    const cutoff = new Date(now.getTime() - PAYMENT_HOLD_MINUTES * 60_000);
    const stale = await this.prisma.order.findMany({
      where: { status: OrderStatus.PAYMENT_PENDING, createdAt: { lt: cutoff } },
      select: { id: true, payment: { select: { id: true, status: true } } },
      take: 200,
    });
    if (stale.length === 0) return 0;
    const ids = stale.map((o) => o.id);
    await this.prisma.$transaction([
      this.prisma.order.updateMany({
        where: { id: { in: ids }, status: OrderStatus.PAYMENT_PENDING },
        data: { status: OrderStatus.CANCELLED },
      }),
      this.prisma.payment.updateMany({
        where: { orderId: { in: ids }, status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] } },
        data: { status: PaymentStatus.FAILED },
      }),
      this.prisma.orderStatusHistory.createMany({
        data: ids.map((orderId) => ({
          orderId,
          status: OrderStatus.CANCELLED,
          note: `Payment was not completed within ${PAYMENT_HOLD_MINUTES} minutes.`,
        })),
      }),
    ]);
    return ids.length;
  }

  // ── inside a transaction ─────────────────────────────────────────────

  private async create(
    tx: Tx,
    userId: string,
    input: { addressId: string; paymentMethod: 'COD' | 'ONLINE'; lines: CartLineInput[]; idempotencyKey: string },
    settings: CheckoutSettings,
  ): Promise<PlacedOrder> {
    const address = await this.addresses.owned(tx, userId, input.addressId);
    // Lock the codes being bought, so two shoppers cannot both take the
    // last unit: the second waits, then sees it gone.
    const quote = await this.priceWith(tx, input.lines, true);

    if (!quote.orderable) {
      throw new ConflictException({
        message: 'Some items in your cart have changed. Please check them and try again.',
        quote,
      });
    }
    if (input.paymentMethod === 'COD' && !quote.cod.allowed) throw new BadRequestException(quote.cod.reason);
    if (input.paymentMethod === 'ONLINE' && !quote.online.allowed) {
      throw new BadRequestException('Online payment is not available yet.');
    }

    const online = input.paymentMethod === 'ONLINE';
    const status = online ? OrderStatus.PAYMENT_PENDING : OrderStatus.PLACED;
    const orderNumber = newOrderNumber(new Date(), randomInt);
    const shippingAddress: AddressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      label: address.label ?? 'Home',
    };

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status,
        paymentMethod: online ? PaymentMethod.ONLINE : PaymentMethod.COD,
        addressId: address.id,
        shippingAddress: shippingAddress as unknown as Prisma.InputJsonValue,
        subtotalPaise: quote.subtotalPaise,
        taxPaise: 0,
        shippingPaise: quote.shippingPaise,
        totalPaise: quote.totalPaise,
        idempotencyKey: input.idempotencyKey,
        items: {
          create: quote.lines.map((l) => ({
            sapCode: l.sapCode!,
            productId: l.productId,
            colour: l.colour,
            name: l.name!,
            quantity: l.quantity,
            unitPricePaise: l.unitPaise,
            mrpPaise: l.mrpPaise,
          })),
        },
        statusHistory: {
          create: {
            status,
            note: online ? 'Waiting for payment.' : 'Order placed. Pay cash on delivery.',
            actorId: userId,
          },
        },
        payment: {
          create: {
            gateway: online ? settings.paymentMode : 'cod',
            gatewayOrderId: online ? `test_order_${randomBytes(6).toString('hex')}` : orderNumber,
            amountPaise: quote.totalPaise,
          },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: 'ORDER_PLACED',
        targetType: 'Order',
        targetId: order.id,
        metadata: { orderNumber, paymentMethod: input.paymentMethod, totalPaise: quote.totalPaise },
      },
    });
    this.logger.log(`[ORDER] ${orderNumber} placed (${input.paymentMethod}) — ${rupees(quote.totalPaise)}`);

    return {
      orderNumber,
      status,
      paymentMethod: order.paymentMethod,
      totalPaise: order.totalPaise,
      next: online ? 'pay' : 'done',
    };
  }

  private async priceWith(tx: Tx, rawLines: CartLineInput[], lock: boolean): Promise<Quote> {
    const settings = this.settings();
    const lines = mergeLines(rawLines);
    const productIds = [...new Set(lines.map((l) => l.productId))];

    if (lock && productIds.length > 0) {
      // Always in the same order, so two checkouts never wait on each other.
      await tx.$queryRaw`SELECT "sapCode" FROM "SapItem" WHERE "websiteProductId" IN (${Prisma.join(productIds)}) ORDER BY "sapCode" FOR UPDATE`;
    }
    const linkedItems: SellableItem[] = await tx.sapItem.findMany({
      where: { websiteProductId: { in: productIds } },
      select: SELLABLE_FIELDS,
    });
    // A product an admin has taken off the shop (or not published yet) is
    // not sold, even from a cart filled before. Products not in the
    // catalogue table at all are left to their SAP links, as before.
    const withdrawn = new Set(
      (
        await tx.product.findMany({
          where: { slug: { in: productIds }, OR: [{ status: { not: ProductStatus.ACTIVE } }, { deletedAt: { not: null } }] },
          select: { slug: true },
        })
      ).map((p) => p.slug),
    );
    const items = linkedItems.filter((i) => !i.websiteProductId || !withdrawn.has(i.websiteProductId));
    const reservations = await this.reservations(tx, items.map((i) => i.sapCode));
    const priced = priceLines(lines, items, reservations);
    const sums = totals(priced, settings.shippingPaise);
    const orderable = priced.length > 0 && priced.every((l) => !l.problem);

    let codReason: string | null = null;
    if (!settings.codEnabled) codReason = 'Cash on delivery is not available.';
    else if (sums.totalPaise > settings.codMaxPaise) {
      codReason = `Cash on delivery is available on orders up to ${rupees(settings.codMaxPaise)}.`;
    }

    return {
      lines: priced,
      ...sums,
      orderable,
      cod: { allowed: codReason === null, reason: codReason },
      online: { allowed: settings.paymentMode !== 'off', mode: settings.paymentMode },
    };
  }

  /** Units taken by website orders that still hold stock: every order not
   *  cancelled, except unpaid online ones past their hold. */
  private async reservations(tx: Tx, sapCodes: string[]): Promise<Reservation[]> {
    if (sapCodes.length === 0) return [];
    const cutoff = new Date(Date.now() - PAYMENT_HOLD_MINUTES * 60_000);
    const rows = await tx.orderItem.findMany({
      where: {
        sapCode: { in: sapCodes },
        order: {
          OR: [
            { status: { notIn: [OrderStatus.CANCELLED, OrderStatus.PAYMENT_PENDING] } },
            { status: OrderStatus.PAYMENT_PENDING, createdAt: { gte: cutoff } },
          ],
        },
      },
      select: { sapCode: true, quantity: true, order: { select: { createdAt: true } } },
    });
    return rows.map((r) => ({ sapCode: r.sapCode, quantity: r.quantity, placedAt: r.order.createdAt }));
  }

  private async byIdempotencyKey(userId: string, key: string): Promise<PlacedOrder | null> {
    const order = await this.prisma.order.findUnique({ where: { idempotencyKey: key } });
    if (!order || order.userId !== userId) return null;
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalPaise: order.totalPaise,
      next: order.status === OrderStatus.PAYMENT_PENDING ? 'pay' : 'done',
    };
  }
}
