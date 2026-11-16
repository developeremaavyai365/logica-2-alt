import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

const SLUG = /^[a-z0-9][a-z0-9-]{0,199}$/;

export class ListProductsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Matches(SLUG)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  brand?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'DRAFT', 'INACTIVE'])
  status?: 'ACTIVE' | 'DRAFT' | 'INACTIVE';

  @IsOptional()
  @IsIn(['missing-ean', 'not-linked', 'out-of-stock'])
  issue?: 'missing-ean' | 'not-linked' | 'out-of-stock';

  @IsOptional()
  @IsIn(['shop', 'name', 'recent', 'price'])
  sort?: 'shop' | 'name' | 'recent' | 'price';

  /** "true" lists the deleted products instead, to restore them. */
  @IsOptional()
  @IsIn(['true', 'false'])
  deleted?: 'true' | 'false';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class HistoryPageDto {
  /** The `next` of the previous page: a time and an id. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z\|[\w-]{1,64}$/)
  before?: string;
}

/** Puts products on the shop or takes them off. Drafts are published from
 *  the listing form, not in bulk. */
export class SetProductStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @Matches(SLUG, { each: true })
  slugs!: string[];

  @IsIn(['ACTIVE', 'INACTIVE'])
  status!: 'ACTIVE' | 'INACTIVE';
}
