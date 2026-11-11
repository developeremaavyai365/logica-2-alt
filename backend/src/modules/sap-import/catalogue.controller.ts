import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SapImportService } from './sap-import.service';

/** The live price list the shop reads on every visit: for each SAP code an
 *  admin has linked to a website product, its selling price, MRP and whether
 *  it is in stock. Public — it is what any shopper sees on the page — and
 *  briefly cacheable, since it only changes when a sheet is applied. */
@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly imports: SapImportService) {}

  @Public()
  @Get('live')
  @Header('Cache-Control', 'public, max-age=60')
  async live() {
    return { items: await this.imports.live() };
  }
}
