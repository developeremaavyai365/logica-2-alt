import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TitleFormatsService } from './title-formats.service';

const nullable = (_: unknown, value: unknown) => value !== null && value !== undefined;

/** Which format: a brand (null for every brand) in a category (null for
 *  every category). */
export class TitleFormatTargetDto {
  @IsOptional()
  @ValidateIf(nullable)
  @IsString()
  @MaxLength(60)
  brand?: string | null;

  @IsOptional()
  @ValidateIf(nullable)
  @Matches(/^[a-z0-9][a-z0-9-]{0,199}$/)
  category?: string | null;
}

export class SaveTitleFormatDto extends TitleFormatTargetDto {
  @IsString()
  @MaxLength(300)
  pattern!: string;
}

/** The product title formats, per brand and category. Admins only. */
@Controller('admin/title-formats')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class TitleFormatsController {
  constructor(private readonly formats: TitleFormatsService) {}

  @Get()
  list() {
    return this.formats.list();
  }

  @Put()
  save(@Body() body: SaveTitleFormatDto, @CurrentUser() user: AuthenticatedUser) {
    return this.formats.save(body.brand ?? null, body.category ?? null, body.pattern, user.id);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  reset(@Body() body: TitleFormatTargetDto, @CurrentUser() user: AuthenticatedUser) {
    return this.formats.reset(body.brand ?? null, body.category ?? null, user.id);
  }
}
