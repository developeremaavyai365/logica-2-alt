import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CatalogueController } from './catalogue.controller';
import { SapImportController } from './sap-import.controller';
import { SapImportService } from './sap-import.service';

@Module({
  controllers: [SapImportController, CatalogueController],
  providers: [SapImportService, RolesGuard],
})
export class SapImportModule {}
