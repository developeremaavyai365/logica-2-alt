import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const MAX_WISHLIST = 200;

/** A customer's wishlist, kept on the account so it is the same on every
 *  device. Holds the website catalogue's product ids, oldest first. */
@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<string[]> {
    const rows = await this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { productId: true },
    });
    return rows.map((r) => r.productId);
  }

  async add(userId: string, productId: string): Promise<string[]> {
    const current = await this.list(userId);
    if (current.includes(productId)) return current;
    if (current.length >= MAX_WISHLIST) {
      throw new BadRequestException(`Your wishlist can hold up to ${MAX_WISHLIST} products.`);
    }
    await this.prisma.wishlistItem.createMany({ data: [{ userId, productId }], skipDuplicates: true });
    return [...current, productId];
  }

  async remove(userId: string, productId: string): Promise<string[]> {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    return this.list(userId);
  }

  /** Adds what was saved on this device before signing in, so nothing a
   *  shopper hearted as a guest is lost. Anything past the limit is
   *  dropped rather than refusing the whole list. */
  async merge(userId: string, productIds: string[]): Promise<string[]> {
    const current = await this.list(userId);
    const room = Math.max(0, MAX_WISHLIST - current.length);
    const fresh = Array.from(new Set(productIds))
      .filter((id) => !current.includes(id))
      .slice(0, room);
    if (fresh.length > 0) {
      await this.prisma.wishlistItem.createMany({
        data: fresh.map((productId) => ({ userId, productId })),
        skipDuplicates: true,
      });
    }
    return this.list(userId);
  }
}
