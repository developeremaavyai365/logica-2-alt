import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { PRODUCT_ID } from '../../account/dto/wishlist.dto';
import { MAX_LINES } from '../pricing';

export class CartLineDto {
  @Matches(PRODUCT_ID)
  productId!: string;

  @IsOptional()
  @Matches(/^[a-z0-9][a-z0-9-]{0,39}$/)
  colour?: string | null;

  /** Up to 99 is accepted so an over-full cart line comes back with a
   *  clear "up to 5" problem instead of a bare validation error. */
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}

export class QuoteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_LINES)
  @ValidateNested({ each: true })
  @Type(() => CartLineDto)
  lines!: CartLineDto[];
}

export class PlaceOrderDto extends QuoteDto {
  @IsUUID()
  addressId!: string;

  @IsIn(['COD', 'ONLINE'])
  paymentMethod!: 'COD' | 'ONLINE';

  /** A fresh id the checkout page makes for each order attempt. */
  @IsUUID()
  idempotencyKey!: string;
}

export class TestPaymentDto {
  @IsIn(['success', 'failure'])
  outcome!: 'success' | 'failure';
}
