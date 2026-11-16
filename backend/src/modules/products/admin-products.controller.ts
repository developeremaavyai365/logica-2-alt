import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ListProductsDto, SetProductStatusDto } from './dto/admin-products.dto';
import { AdminProductsService } from './admin-products.service';

/** The admin products page. Admins only: the global JwtAuthGuard requires a
 *  login, and RolesGuard checks the role from the verified token. */
@Controller('admin/products')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminProductsController {
  constructor(private readonly products: AdminProductsService) {}

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

  /** Activates or deactivates products in bulk. */
  @Post('status')
  @HttpCode(HttpStatus.OK)
  setStatus(@Body() body: SetProductStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.products.setStatus(body.slugs, body.status, user.id);
  }
}
