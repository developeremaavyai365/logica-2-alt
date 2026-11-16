import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { CheckoutModule } from '../checkout/checkout.module';

@Module({
  imports: [CheckoutModule],
  controllers: [OrdersController],
})
export class OrdersModule {}
