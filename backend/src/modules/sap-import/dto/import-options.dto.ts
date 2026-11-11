import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';

/** The text fields sent alongside the sheet. The file itself is handled by
 *  FileInterceptor, not this DTO. Everything in a multipart form arrives as
 *  text, hence 'true' / 'false' rather than a boolean. */
export class ImportOptionsDto {
  /** 'partial' (default): update only the products the sheet lists.
   *  'full': the sheet is the whole catalogue — anything it leaves out is
   *  marked out of stock. */
  @IsOptional()
  @IsIn(['partial', 'full'])
  mode?: 'partial' | 'full';

  /** Sent as 'true' to go ahead with a full sheet that would take most of
   *  the catalogue out of stock. */
  @IsOptional()
  @IsIn(['true', 'false'])
  confirmLargeRemoval?: 'true' | 'false';
}

export class ListItemsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number;

  /** 'yes': only codes linked to a website product; 'no': only those not. */
  @IsOptional()
  @IsIn(['yes', 'no'])
  linked?: 'yes' | 'no';
}

/** Links one SAP code to a website product (and colour), or unlinks it when
 *  `productId` is null. Product ids and colour keys are the website's own
 *  slugs: lower-case letters, digits and hyphens. */
export class LinkItemDto {
  @IsString()
  @MaxLength(60)
  sapCode!: string;

  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{0,199}$/)
  productId!: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{0,39}$/)
  colour?: string | null;
}
