import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { ListingsService } from './listings.service';
import { PhotoStorageService } from './photo-storage.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService, AdminProductsService, ListingsService, PhotoStorageService, RolesGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
