import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminOffersController, OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
  controllers: [OffersController, AdminOffersController],
  providers: [OffersService, RolesGuard],
})
export class OffersModule {}
