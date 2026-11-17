import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ShopOffer } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Offer, OfferInput, offerProblem } from './offer-rules';

/** An offer as the website and the admin page get it. */
export function toOffer(row: ShopOffer): Offer {
  return {
    id: row.id,
    kind: row.kind,
    provider: row.provider,
    paymentType: row.paymentType,
    title: row.title,
    terms: row.terms,
    flatOffInPaise: row.flatOffInPaise,
    percentOff: row.percentOff,
    maxOffInPaise: row.maxOffInPaise,
    minPriceInPaise: row.minPriceInPaise,
    emiMonths: row.emiMonths,
    interestPercent: row.interestPercent,
    planPriceInPaise: row.planPriceInPaise,
    planPricePercent: row.planPricePercent,
    coverMonths: row.coverMonths,
    categories: row.categories,
    brands: row.brands,
    active: row.active,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
  };
}

/** The input with its text trimmed and its lists tidied, ready to check. */
export function tidyOffer(input: OfferInput): OfferInput {
  const list = (values: string[]) => [...new Set(values.map((v) => v.trim()).filter(Boolean))];
  return {
    ...input,
    provider: input.provider.trim(),
    paymentType: input.paymentType.trim(),
    title: input.title.trim(),
    terms: input.terms.trim(),
    emiMonths: [...new Set(input.emiMonths)].sort((a, b) => a - b),
    categories: list(input.categories),
    brands: list(input.brands),
  };
}

function toData(o: OfferInput) {
  const { endsAt, ...rest } = o;
  return { ...rest, endsAt: endsAt ? new Date(endsAt) : null };
}

/** The offers shown on product pages: bank offers, EMI, exchange and
 *  protection plans, set up by admins. */
@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every offer, for the admin page. */
  async list(): Promise<Offer[]> {
    const rows = await this.prisma.shopOffer.findMany({ orderBy: [{ kind: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }] });
    return rows.map(toOffer);
  }

  /** The offers on now, for the website. Which product each is for is
   *  worked out on the page, with the same rules. */
  async live(): Promise<Offer[]> {
    const rows = await this.prisma.shopOffer.findMany({
      where: { active: true, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
      orderBy: [{ kind: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toOffer);
  }

  async create(input: OfferInput): Promise<Offer> {
    const offer = this.checked(input);
    const last = await this.prisma.shopOffer.aggregate({ where: { kind: offer.kind }, _max: { position: true } });
    const row = await this.prisma.shopOffer.create({ data: { ...toData(offer), position: (last._max.position ?? 0) + 1 } });
    return toOffer(row);
  }

  async update(id: string, input: OfferInput): Promise<Offer> {
    const offer = this.checked(input);
    await this.mustExist(id);
    const row = await this.prisma.shopOffer.update({ where: { id }, data: toData(offer) });
    return toOffer(row);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    await this.mustExist(id);
    await this.prisma.shopOffer.delete({ where: { id } });
    return { deleted: true };
  }

  private checked(input: OfferInput): OfferInput {
    const offer = tidyOffer(input);
    const problem = offerProblem(offer);
    if (problem) throw new BadRequestException(problem);
    return offer;
  }

  private async mustExist(id: string) {
    const found = await this.prisma.shopOffer.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('That offer is no longer there.');
  }
}
