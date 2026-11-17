/* The rules for the offers on product pages: what makes an offer complete,
   which products it is for, and the sums it shows (the saving, the monthly
   EMI, a plan's price). Plain TypeScript with no imports, so the website
   uses the same file and shows exactly what the server decides. Money is in
   paise throughout. */

export type OfferKind = 'BANK' | 'EMI' | 'EXCHANGE' | 'PROTECTION';

export const OFFER_KINDS: OfferKind[] = ['BANK', 'EMI', 'EXCHANGE', 'PROTECTION'];

/** An offer as the admin writes it. */
export interface OfferInput {
  kind: OfferKind;
  provider: string;
  paymentType: string;
  title: string;
  terms: string;
  flatOffInPaise: number | null;
  percentOff: number | null;
  maxOffInPaise: number | null;
  minPriceInPaise: number | null;
  emiMonths: number[];
  interestPercent: number | null;
  planPriceInPaise: number | null;
  planPricePercent: number | null;
  coverMonths: number | null;
  categories: string[];
  brands: string[];
  active: boolean;
  /** ISO date-time, or null for no end. */
  endsAt: string | null;
}

export interface Offer extends OfferInput {
  id: string;
}

/** The product an offer is checked against. */
export interface OfferTarget {
  priceInPaise: number;
  category: string;
  brand: string;
}

/** The months EMI is usually offered for. */
export const EMI_MONTH_CHOICES = [3, 6, 9, 12, 18, 24];

/** What is missing or wrong in an offer, in words for the admin; null when
 *  it can be saved. */
export function offerProblem(o: OfferInput): string | null {
  const positive = (n: number | null) => n !== null && n > 0;
  switch (o.kind) {
    case 'BANK':
      if (!o.provider.trim()) return "Write the bank's name.";
      if (!positive(o.flatOffInPaise) && !positive(o.percentOff)) return 'Write the discount: an amount in rupees, or a percent.';
      if (positive(o.flatOffInPaise) && positive(o.percentOff)) return 'Give the discount as an amount or as a percent, not both.';
      if (o.percentOff !== null && o.percentOff > 90) return 'A percent discount is at most 90%.';
      break;
    case 'EMI':
      if (!o.provider.trim()) return "Write the bank's name.";
      if (o.emiMonths.length === 0) return 'Choose at least one number of months.';
      if (o.emiMonths.some((m) => !Number.isInteger(m) || m < 1 || m > 60)) return 'Months are whole numbers from 1 to 60.';
      if (o.interestPercent === null || o.interestPercent < 0) return 'Write the yearly interest rate (0 for no cost EMI).';
      if (o.interestPercent > 60) return 'The yearly interest rate is at most 60%.';
      break;
    case 'EXCHANGE':
      if (!positive(o.maxOffInPaise)) return 'Write the most a customer can get off for their old device.';
      break;
    case 'PROTECTION':
      if (!o.title.trim()) return "Write the plan's name.";
      if (!positive(o.planPriceInPaise) && !positive(o.planPricePercent)) return "Write the plan's price: an amount in rupees, or a percent of the product's price.";
      if (positive(o.planPriceInPaise) && positive(o.planPricePercent)) return "Give the plan's price as an amount or as a percent, not both.";
      if (!o.coverMonths || o.coverMonths < 1 || o.coverMonths > 120) return 'Write how many months the plan covers (1 to 120).';
      break;
  }
  for (const n of [o.flatOffInPaise, o.percentOff, o.maxOffInPaise, o.minPriceInPaise, o.planPriceInPaise, o.planPricePercent]) {
    if (n !== null && (!Number.isFinite(n) || n < 0)) return 'Amounts cannot be below zero.';
  }
  if (o.endsAt !== null && Number.isNaN(Date.parse(o.endsAt))) return 'The end date is not a date.';
  if (o.terms.length > 600) return 'Keep the conditions under 600 characters.';
  return null;
}

/** Whether an offer is shown for this product now. */
export function offerApplies(o: OfferInput, t: OfferTarget, now: number = Date.now()): boolean {
  if (!o.active) return false;
  if (o.endsAt && Date.parse(o.endsAt) < now) return false;
  if (o.minPriceInPaise && t.priceInPaise < o.minPriceInPaise) return false;
  if (o.categories.length && !o.categories.includes(t.category)) return false;
  if (o.brands.length && !o.brands.some((b) => b.toLowerCase() === t.brand.toLowerCase())) return false;
  return true;
}

/** What a bank offer takes off this price. */
export function bankSaving(o: OfferInput, priceInPaise: number): number {
  if (o.flatOffInPaise) return Math.min(o.flatOffInPaise, priceInPaise);
  const off = Math.floor((priceInPaise * (o.percentOff ?? 0)) / 100);
  return o.maxOffInPaise ? Math.min(off, o.maxOffInPaise) : off;
}

/** The monthly instalment, rounded up to the rupee: the price split evenly
 *  for no cost EMI, otherwise the usual reducing-balance instalment. */
export function emiMonthly(priceInPaise: number, months: number, yearlyInterestPercent: number): number {
  if (months < 1) return priceInPaise;
  const r = yearlyInterestPercent / 12 / 100;
  const each = r === 0 ? priceInPaise / months : (priceInPaise * r * (1 + r) ** months) / ((1 + r) ** months - 1);
  return Math.ceil(each / 100) * 100;
}

/** A protection plan's price for this product, rounded up to the rupee. */
export function planPrice(o: OfferInput, priceInPaise: number): number {
  if (o.planPriceInPaise) return o.planPriceInPaise;
  return Math.ceil((priceInPaise * (o.planPricePercent ?? 0)) / 100 / 100) * 100;
}

/** The lowest monthly instalment among the EMI offers, with its offer. */
export function lowestEmi(offers: OfferInput[], priceInPaise: number): { offer: OfferInput; months: number; monthly: number } | null {
  let best: { offer: OfferInput; months: number; monthly: number } | null = null;
  for (const o of offers) {
    if (o.kind !== 'EMI') continue;
    for (const months of o.emiMonths) {
      const monthly = emiMonthly(priceInPaise, months, o.interestPercent ?? 0);
      if (!best || monthly < best.monthly) best = { offer: o, months, monthly };
    }
  }
  return best;
}

/** The bank offer that saves the most on this price. */
export function bestBankOffer(offers: OfferInput[], priceInPaise: number): { offer: OfferInput; saving: number } | null {
  let best: { offer: OfferInput; saving: number } | null = null;
  for (const o of offers) {
    if (o.kind !== 'BANK') continue;
    const saving = bankSaving(o, priceInPaise);
    if (saving > 0 && (!best || saving > best.saving)) best = { offer: o, saving };
  }
  return best;
}
