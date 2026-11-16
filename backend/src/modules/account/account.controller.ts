import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { AddressesService } from './addresses.service';
import { AddressDto } from './dto/address.dto';
import { MergeWishlistDto, PRODUCT_ID } from './dto/wishlist.dto';
import { WishlistService } from './wishlist.service';

function productId(raw: string): string {
  if (!PRODUCT_ID.test(raw)) throw new BadRequestException('Unknown product.');
  return raw;
}

/** The signed-in customer's saved addresses and wishlist. Every route here
 *  needs a signed-in user (the app-wide guard) and only ever touches that
 *  user's own rows. */
@Controller()
export class AccountController {
  constructor(
    private readonly addresses: AddressesService,
    private readonly wishlist: WishlistService,
  ) {}

  @Get('addresses')
  listAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.addresses.list(user.id);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('addresses')
  createAddress(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddressDto) {
    return this.addresses.create(user.id, dto);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Patch('addresses/:id')
  updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AddressDto,
  ) {
    return this.addresses.update(user.id, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('addresses/:id/default')
  makeDefault(@CurrentUser() user: AuthenticatedUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.addresses.makeDefault(user.id, id);
  }

  @Delete('addresses/:id')
  removeAddress(@CurrentUser() user: AuthenticatedUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.addresses.remove(user.id, id);
  }

  @Get('wishlist')
  async listWishlist(@CurrentUser() user: AuthenticatedUser) {
    return { productIds: await this.wishlist.list(user.id) };
  }

  @Put('wishlist/:productId')
  async addToWishlist(@CurrentUser() user: AuthenticatedUser, @Param('productId') raw: string) {
    return { productIds: await this.wishlist.add(user.id, productId(raw)) };
  }

  @Delete('wishlist/:productId')
  async removeFromWishlist(@CurrentUser() user: AuthenticatedUser, @Param('productId') raw: string) {
    return { productIds: await this.wishlist.remove(user.id, productId(raw)) };
  }

  @HttpCode(HttpStatus.OK)
  @Post('wishlist/merge')
  async mergeWishlist(@CurrentUser() user: AuthenticatedUser, @Body() dto: MergeWishlistDto) {
    return { productIds: await this.wishlist.merge(user.id, dto.productIds) };
  }
}
