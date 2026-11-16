import { Controller, Get, Headers, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { ProductsService } from './products.service';

/** The product catalogue the website loads: every active product with its
 *  details, photos and colours. Public, and cacheable for a minute; a browser
 *  that already has the current version gets a short "not modified". */
@Controller('catalogue')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get('products')
  async catalogue(@Headers('if-none-match') ifNoneMatch: string | undefined, @Res({ passthrough: true }) res: Response) {
    const catalogue = await this.products.publicCatalogue();
    const etag = `"${catalogue.version}"`;
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.setHeader('ETag', etag);
    if (ifNoneMatch === etag) {
      res.status(304);
      return undefined;
    }
    return catalogue;
  }
}
