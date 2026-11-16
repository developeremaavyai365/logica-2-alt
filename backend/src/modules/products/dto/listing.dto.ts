import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { GST_RATES } from '../listing-rules';

const SLUG = /^[a-z0-9][a-z0-9-]{0,199}$/;
/** A photo: a path on the website (/products/…) or an uploaded file's address. */
const PHOTO = /^(\/[\w\-./%]+|https?:\/\/[^\s"'<>]+)$/;
const nullable = (_: unknown, value: unknown) => value !== null && value !== undefined;

export class SpecDto {
  @IsString()
  @MaxLength(80)
  label!: string;

  @IsString()
  @MaxLength(3000)
  value!: string;
}

export class ColourDto {
  @Matches(/^[a-z0-9][a-z0-9-]{0,39}$/, { message: 'A colour key is lower-case letters, digits and hyphens.' })
  key!: string;

  @IsString()
  @MaxLength(40)
  name!: string;

  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'A swatch colour is a hex code like #1F2C46.' })
  hex!: string;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  family!: string[];

  @IsArray()
  @ArrayMaxSize(15)
  @Matches(PHOTO, { each: true })
  images!: string[];

  @IsOptional()
  @ValidateIf(nullable)
  @IsBoolean()
  inStock?: boolean | null;

  @IsOptional()
  @ValidateIf(nullable)
  @Matches(/^\d{8,14}$/, { message: 'An EAN is 8 to 14 digits.' })
  ean?: string | null;
}

/** A product listing as the admin form sends it, to create or to save. */
export class SaveListingDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @Matches(SLUG)
  categorySlug!: string;

  @IsString()
  @MaxLength(60)
  brandName!: string;

  @IsIn(['DRAFT', 'ACTIVE', 'INACTIVE'])
  status!: 'DRAFT' | 'ACTIVE' | 'INACTIVE';

  @IsInt()
  @Min(0)
  @Max(10_000_000_000)
  priceInPaise!: number;

  @IsOptional()
  @ValidateIf(nullable)
  @IsInt()
  @Min(0)
  @Max(10_000_000_000)
  mrpInPaise?: number | null;

  @IsBoolean()
  inStock!: boolean;

  /** Photos in order; the first is the main one. */
  @IsArray()
  @ArrayMaxSize(20)
  @Matches(PHOTO, { each: true })
  gallery!: string[];

  /** Photos shown after a chosen colour's own (line-ups, box contents). */
  @IsArray()
  @ArrayMaxSize(20)
  @Matches(PHOTO, { each: true })
  sharedImages!: string[];

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  highlights!: string[];

  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => SpecDto)
  specs!: SpecDto[];

  @IsString()
  @MaxLength(8000)
  description!: string;

  @IsOptional()
  @ValidateIf(nullable)
  @IsString()
  @MaxLength(60)
  modelNumber?: string | null;

  @IsOptional()
  @ValidateIf(nullable)
  @IsString()
  @MaxLength(60)
  partNumber?: string | null;

  @IsOptional()
  @ValidateIf(nullable)
  @Matches(/^\d{8,14}$/, { message: 'An EAN is 8 to 14 digits.' })
  ean?: string | null;

  @IsOptional()
  @ValidateIf(nullable)
  @Matches(/^\d{4,8}$/, { message: 'An HSN code is 4 to 8 digits.' })
  hsnCode?: string | null;

  @IsOptional()
  @ValidateIf(nullable)
  @IsIn(GST_RATES)
  gstRatePercent?: number | null;

  @IsOptional()
  @ValidateIf(nullable)
  @IsString()
  @MaxLength(300)
  warranty?: string | null;

  @IsOptional()
  @ValidateIf(nullable)
  @IsString()
  @MaxLength(500)
  inTheBox?: string | null;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ColourDto)
  colours!: ColourDto[];

  /** Sent as true to go ahead with a selling-price change of 40% or more. */
  @IsOptional()
  @IsBoolean()
  confirmPriceChange?: boolean;
}
