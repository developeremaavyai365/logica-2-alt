import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CheckoutService } from './checkout.service';
import { PlaceOrderDto, QuoteDto, TestPaymentDto } from './dto/checkout.dto';

const ORDER_NUMBER = /^LG\d{6}-[A-Z2-9]{6}$/;

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  /** Whether ordering is open and how customers can pay. Public, so the
   *  shop can show "Buy" or "Currently unavailable" before sign-in. */
  @Public()
  @Get('config')
  config() {
    const s = this.checkout.settings();
    return {
      enabled: s.enabled,
      cod: { enabled: s.codEnabled, maxPaise: s.codMaxPaise },
      online: { mode: s.paymentMode },
      shippingPaise: s.shippingPaise,
    };
  }

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('quote')
  quote(@Body() dto: QuoteDto) {
    return this.checkout.quote(dto.lines);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('orders')
  place(@CurrentUser() user: AuthenticatedUser, @Body() dto: PlaceOrderDto) {
    return this.checkout.place(user.id, dto);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('orders/:orderNumber/test-payment')
  testPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderNumber') orderNumber: string,
    @Body() dto: TestPaymentDto,
  ) {
    return this.checkout.testPayment(user.id, this.orderNumber(orderNumber), dto.outcome);
  }

  private orderNumber(raw: string) {
    return ORDER_NUMBER.test(raw) ? raw : '-';
  }
}
