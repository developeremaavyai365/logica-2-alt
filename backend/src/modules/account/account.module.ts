import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AddressesService } from './addresses.service';
import { WishlistService } from './wishlist.service';

@Module({
  controllers: [AccountController],
  providers: [AddressesService, WishlistService],
  exports: [AddressesService],
})
export class AccountModule {}
