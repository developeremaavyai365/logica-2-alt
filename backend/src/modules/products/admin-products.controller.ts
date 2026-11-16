import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ListProductsDto, SetProductStatusDto } from './dto/admin-products.dto';
import { SaveListingDto } from './dto/listing.dto';
import { AdminProductsService } from './admin-products.service';
import { ListingsService } from './listings.service';
import { PhotoStorageService } from './photo-storage.service';

const SLUG = /^[a-z0-9][a-z0-9-]{0,199}$/;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const slugParam = (slug: string) => {
  if (!SLUG.test(slug)) throw new BadRequestException('Not a product address.');
  return slug;
};

/** The admin products pages. Admins only: the global JwtAuthGuard requires a
 *  login, and RolesGuard checks the role from the verified token.
 *
 *  Fixed paths ("options", "photos", "status") are declared before ":slug",
 *  so they are never read as a product address. */
@Controller('admin/products')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminProductsController {
  constructor(
    private readonly products: AdminProductsService,
    private readonly listings: ListingsService,
    private readonly photos: PhotoStorageService,
  ) {}

  @Get()
  list(@Query() query: ListProductsDto) {
    return this.products.list({
      search: query.search,
      category: query.category,
      brand: query.brand,
      status: query.status,
      issue: query.issue,
      sort: query.sort,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });
  }

  /** Categories with their spec fields, brands and GST rates, for the form. */
  @Get('options')
  options() {
    return this.listings.formOptions();
  }

  /** Activates or deactivates products in bulk. */
  @Post('status')
  @HttpCode(HttpStatus.OK)
  setStatus(@Body() body: SetProductStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.products.setStatus(body.slugs, body.status, user.id);
  }

  /** Uploads one product photo; returns its address for the listing. */
  @Post('photos')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_PHOTO_BYTES, files: 1 } }))
  uploadPhoto(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Attach a photo (JPG, PNG or WebP, up to 5 MB).');
    return this.photos.save(file.buffer);
  }

  /** Creates a listing. */
  @Post()
  create(@Body() body: SaveListingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.listings.save(null, body, user.id);
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.listings.get(slugParam(slug));
  }

  @Put(':slug')
  save(@Param('slug') slug: string, @Body() body: SaveListingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.listings.save(slugParam(slug), body, user.id);
  }
}
