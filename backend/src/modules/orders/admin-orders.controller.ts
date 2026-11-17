import { Body, Controller, Get, NotFoundException, Param, Post, Query, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import type { Response } from 'express';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminOrdersService } from './admin-orders.service';
import { ORDER_TABS, OrderStatusName, STATUS_LABEL } from './order-flow';

const ORDER_NUMBER = /^LG\d{6}-[A-Z2-9]{6}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class ListOrdersDto {
  @IsOptional() @IsIn([...ORDER_TABS.map((t) => t.key), 'all']) tab?: string;
  @IsOptional() @IsString() @MaxLength(80) q?: string;
  @IsOptional() @Matches(DATE) from?: string;
  @IsOptional() @Matches(DATE) to?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
}

export class MoveOrderDto {
  @IsIn(Object.keys(STATUS_LABEL)) to!: OrderStatusName;
  @IsOptional() @IsString() @MaxLength(300) note?: string;
  @IsOptional() @IsString() @MaxLength(60) courierName?: string;
  @IsOptional() @IsString() @MaxLength(60) trackingNumber?: string;
}

const orderParam = (orderNumber: string) => {
  if (!ORDER_NUMBER.test(orderNumber)) throw new NotFoundException('Order not found.');
  return orderNumber;
};

/** The warehouse's orders. Admins only. */
@Controller('admin/orders')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get()
  list(@Query() query: ListOrdersDto) {
    return this.orders.list(query);
  }

  /** The orders as an Excel sheet: the same tab, search and dates. */
  @Get('export')
  async export(@Query() query: ListOrdersDto, @Res({ passthrough: true }) res: Response) {
    const { buffer, fileName } = await this.orders.export(query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName.replace(/[^\w .()-]/g, '')}"`,
      'Cache-Control': 'no-store',
    });
    return new StreamableFile(buffer);
  }

  @Get(':orderNumber')
  detail(@Param('orderNumber') orderNumber: string) {
    return this.orders.detail(orderParam(orderNumber));
  }

  @Get(':orderNumber/invoice')
  invoice(@Param('orderNumber') orderNumber: string) {
    return this.orders.invoice(orderParam(orderNumber));
  }

  @Post(':orderNumber/status')
  move(@Param('orderNumber') orderNumber: string, @Body() body: MoveOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.orders.move(orderParam(orderNumber), body, user.id);
  }
}
