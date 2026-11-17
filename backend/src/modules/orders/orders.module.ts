import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { CheckoutModule } from '../checkout/checkout.module';

@Module({
  imports: [CheckoutModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [AdminOrdersService, RolesGuard],
})
export class OrdersModule {}
