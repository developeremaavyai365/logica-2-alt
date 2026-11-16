import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { BulkListingsService } from './bulk-listings.service';
import { ListingsService } from './listings.service';
import { TitleFormatsController } from './title-formats.controller';
import { TitleFormatsService } from './title-formats.service';
import { PhotoStorageService } from './photo-storage.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController, AdminProductsController, TitleFormatsController],
  providers: [ProductsService, AdminProductsService, ListingsService, BulkListingsService, TitleFormatsService, PhotoStorageService, RolesGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
