import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AddressDto } from './dto/address.dto';

/** More than enough for anyone; stops a script filling the table. */
export const MAX_ADDRESSES = 20;

export interface AddressView {
  id: string;
  fullName: string;
  phone: string;
  postalCode: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  label: string;
  isDefault: boolean;
}

export function toView(a: Address): AddressView {
  return {
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    postalCode: a.postalCode,
    line1: a.line1,
    line2: a.line2,
    landmark: a.landmark,
    city: a.city,
    state: a.state,
    label: a.label ?? 'Home',
    isDefault: a.isDefault,
  };
}

/** A customer's saved delivery addresses. Exactly one is the default
 *  whenever they have any: the first one saved, or whichever they pick.
 *  Removing an address hides it rather than deleting it, because orders
 *  placed to it still point at it. */
@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<AddressView[]> {
    const rows = await this.prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map(toView);
  }

  async create(userId: string, dto: AddressDto): Promise<AddressView> {
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.address.count({ where: { userId, deletedAt: null } });
      if (count >= MAX_ADDRESSES) {
        throw new BadRequestException(`You can save up to ${MAX_ADDRESSES} addresses. Remove one to add another.`);
      }
      const isDefault = count === 0 || dto.isDefault === true;
      if (isDefault) await this.clearDefault(tx, userId);
      const row = await tx.address.create({ data: { userId, ...this.fields(dto), isDefault } });
      return toView(row);
    });
  }

  async update(userId: string, id: string, dto: AddressDto): Promise<AddressView> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await this.owned(tx, userId, id);
      // The default can be moved to another address but not just switched
      // off, or there would be none.
      const isDefault = existing.isDefault || dto.isDefault === true;
      if (isDefault && !existing.isDefault) await this.clearDefault(tx, userId);
      const row = await tx.address.update({ where: { id }, data: { ...this.fields(dto), isDefault } });
      return toView(row);
    });
  }

  async makeDefault(userId: string, id: string): Promise<AddressView[]> {
    await this.prisma.$transaction(async (tx) => {
      await this.owned(tx, userId, id);
      await this.clearDefault(tx, userId);
      await tx.address.update({ where: { id }, data: { isDefault: true } });
    });
    return this.list(userId);
  }

  async remove(userId: string, id: string): Promise<AddressView[]> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await this.owned(tx, userId, id);
      await tx.address.update({ where: { id }, data: { deletedAt: new Date(), isDefault: false } });
      if (existing.isDefault) {
        // The most recently added remaining address takes over.
        const next = await tx.address.findFirst({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });
        if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    });
    return this.list(userId);
  }

  /** The address, if it is this customer's and not removed. Someone else's
   *  address gets the same answer as one that does not exist. */
  async owned(tx: Prisma.TransactionClient, userId: string, id: string): Promise<Address> {
    const row = await tx.address.findFirst({ where: { id, userId, deletedAt: null } });
    if (!row) throw new NotFoundException('Address not found.');
    return row;
  }

  private clearDefault(tx: Prisma.TransactionClient, userId: string) {
    return tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  }

  private fields(dto: AddressDto) {
    return {
      fullName: dto.fullName,
      phone: dto.phone,
      postalCode: dto.postalCode,
      line1: dto.line1,
      line2: dto.line2 || null,
      landmark: dto.landmark || null,
      city: dto.city,
      state: dto.state,
      label: dto.label,
      country: 'IN',
    };
  }
}
