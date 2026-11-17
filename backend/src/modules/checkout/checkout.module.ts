import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { MailModule } from '../../mail/mail.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { OrderNotifier } from './order-notifier.service';

@Module({
  imports: [AccountModule, MailModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, OrderNotifier],
  exports: [CheckoutService, OrderNotifier],
})
export class CheckoutModule {}
