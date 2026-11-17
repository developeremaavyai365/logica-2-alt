import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { customerMessage, OrderStatusName } from '../orders/order-flow';
import { customerUpdate, EmailOrder, warehouseAlert } from './order-emails';
import { AddressSnapshot } from './order-view';

/** Sends the order emails. An email that fails is logged, never thrown:
 *  an order is placed, or moved on, whether or not its email went out. */
@Injectable()
export class OrderNotifier {
  private readonly logger = new Logger(OrderNotifier.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  /** The warehouse emails in ORDER_ALERT_EMAILS. */
  warehouseEmails(): string[] {
    return (this.config.get<string>('ORDER_ALERT_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
  }

  /** A new order (cash on delivery, or paid): the warehouse's alert and the
   *  customer's "we have your order". */
  async orderPlaced(orderNumber: string): Promise<void> {
    const order = await this.load(orderNumber);
    if (!order) return;
    const site = this.config.get<string>('FRONTEND_URL') ?? '';
    const alert = warehouseAlert(order, `${site}/admin/orders/${order.orderNumber}`);
    for (const to of this.warehouseEmails()) {
      await this.send(to, alert.subject, alert.html, 'ORDER ALERT');
    }
    await this.customer(order, 'PLACED', null);
  }

  /** The customer's email for a step the warehouse took. */
  async statusChanged(orderNumber: string, status: OrderStatusName, note: string | null): Promise<void> {
    const order = await this.load(orderNumber);
    if (order) await this.customer(order, status, note);
  }

  private async customer(order: EmailOrder, status: OrderStatusName, note: string | null) {
    const message = customerMessage(status, { ...order, note });
    if (!message || !order.customer.email) return;
    const site = this.config.get<string>('FRONTEND_URL') ?? '';
    const email = customerUpdate(order, message, `${site}/orders/${order.orderNumber}`);
    await this.send(order.customer.email, email.subject, email.html, `ORDER ${status}`);
  }

  private async send(to: string, subject: string, html: string, logLabel: string) {
    try {
      await this.mail.sendHtml({ to, subject, html, logLabel });
    } catch (err) {
      this.logger.error(`Could not send "${subject}" to ${to}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private async load(orderNumber: string): Promise<EmailOrder | null> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true, user: { select: { email: true, name: true, phone: true } } },
      });
      if (!order) return null;
      return {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        totalPaise: order.totalPaise,
        shippingPaise: order.shippingPaise,
        items: order.items.map((i) => ({ name: i.name, sapCode: i.sapCode, quantity: i.quantity, unitPricePaise: i.unitPricePaise })),
        address: order.shippingAddress as unknown as AddressSnapshot,
        customer: { name: order.user.name || order.user.email || order.user.phone || 'Customer', email: order.user.email ?? '' },
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
      };
    } catch (err) {
      this.logger.error(`Could not load order ${orderNumber} for its email: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }
}
