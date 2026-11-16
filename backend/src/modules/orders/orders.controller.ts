import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CheckoutService } from '../checkout/checkout.service';

const ORDER_NUMBER = /^LG\d{6}-[A-Z2-9]{6}$/;

/** The signed-in customer's own orders, newest first. */
@Controller('orders')
export class OrdersController {
  constructor(private readonly checkout: CheckoutService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.checkout.ordersFor(user.id);
  }

  @Get(':orderNumber')
  async one(@CurrentUser() user: AuthenticatedUser, @Param('orderNumber') orderNumber: string) {
    if (!ORDER_NUMBER.test(orderNumber)) throw new NotFoundException('Order not found.');
    await this.checkout.expireUnpaid();
    return this.checkout.orderFor(user.id, orderNumber);
  }
}
