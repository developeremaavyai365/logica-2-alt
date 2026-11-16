import { ArrayMaxSize, IsArray, Matches } from 'class-validator';

/** The website catalogue's product ids: lower-case words and dashes. */
export const PRODUCT_ID = /^[a-z0-9][a-z0-9-]{0,199}$/;

export class MergeWishlistDto {
  @IsArray()
  @ArrayMaxSize(200)
  @Matches(PRODUCT_ID, { each: true })
  productIds!: string[];
}
