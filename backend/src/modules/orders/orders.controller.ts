import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

/** Real order history, not a placeholder — reads straight from the same
 *  Order table checkout will eventually write to. There's no live
 *  checkout flow wired up yet, so this legitimately returns an empty list
 *  for every account today; it isn't hiding fabricated data. */
@Controller('orders')
export class OrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const orders = await this.prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalPaise: order.totalPaise,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productName: item.variant.product.name,
        quantity: item.quantity,
        unitPricePaise: item.unitPricePaise,
      })),
    }));
  }
}
