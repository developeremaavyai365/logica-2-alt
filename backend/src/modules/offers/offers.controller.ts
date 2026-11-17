import { Body, Controller, Delete, Get, Header, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OFFER_KINDS, OfferInput, OfferKind } from './offer-rules';
import { OffersService } from './offers.service';

const present = (_: unknown, value: unknown) => value !== null && value !== undefined;

/** An offer as the admin page sends it. The checks on what each kind needs
 *  are in offer-rules.ts. */
export class OfferDto implements OfferInput {
  @IsIn(OFFER_KINDS)
  kind!: OfferKind;

  @IsString() @MaxLength(80) provider!: string;
  @IsString() @MaxLength(80) paymentType!: string;
  @IsString() @MaxLength(120) title!: string;
  @IsString() @MaxLength(600) terms!: string;

  @IsOptional() @ValidateIf(present) @IsInt() flatOffInPaise!: number | null;
  @IsOptional() @ValidateIf(present) @IsNumber() percentOff!: number | null;
  @IsOptional() @ValidateIf(present) @IsInt() maxOffInPaise!: number | null;
  @IsOptional() @ValidateIf(present) @IsInt() minPriceInPaise!: number | null;

  @IsArray() @ArrayMaxSize(12) @IsInt({ each: true }) @Type(() => Number) emiMonths!: number[];
  @IsOptional() @ValidateIf(present) @IsNumber() interestPercent!: number | null;

  @IsOptional() @ValidateIf(present) @IsInt() planPriceInPaise!: number | null;
  @IsOptional() @ValidateIf(present) @IsNumber() planPricePercent!: number | null;
  @IsOptional() @ValidateIf(present) @IsInt() coverMonths!: number | null;

  @IsArray() @ArrayMaxSize(60) @IsString({ each: true }) @MaxLength(200, { each: true }) categories!: string[];
  @IsArray() @ArrayMaxSize(60) @IsString({ each: true }) @MaxLength(60, { each: true }) brands!: string[];

  @IsBoolean() active!: boolean;
  @IsOptional() @ValidateIf(present) @IsISO8601() endsAt!: string | null;
}

/** Normalise the optional numbers the page leaves out to null. */
function input(body: OfferDto): OfferInput {
  const n = (v: number | null | undefined) => (v === undefined ? null : v);
  return {
    ...body,
    flatOffInPaise: n(body.flatOffInPaise),
    percentOff: n(body.percentOff),
    maxOffInPaise: n(body.maxOffInPaise),
    minPriceInPaise: n(body.minPriceInPaise),
    interestPercent: n(body.interestPercent),
    planPriceInPaise: n(body.planPriceInPaise),
    planPricePercent: n(body.planPricePercent),
    coverMonths: n(body.coverMonths),
    endsAt: body.endsAt ?? null,
  };
}

/** The offers on now, for product pages. */
@Controller('offers')
export class OffersController {
  constructor(private readonly offers: OffersService) {}

  @Public()
  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  live() {
    return this.offers.live();
  }
}

/** Setting up offers. Admins only. */
@Controller('admin/offers')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminOffersController {
  constructor(private readonly offers: OffersService) {}

  @Get()
  list() {
    return this.offers.list();
  }

  @Post()
  create(@Body() body: OfferDto) {
    return this.offers.create(input(body));
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: OfferDto) {
    return this.offers.update(id, input(body));
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.offers.remove(id);
  }
}
