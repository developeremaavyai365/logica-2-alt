import { useEffect, useState } from 'react';
import { apiFetch } from './api-client';
import type { Offer } from '../../backend/src/modules/offers/offer-rules';

/* The offers on product pages (bank offers, EMI, exchange, protection
   plans), with the server's own rules file so the page works out exactly
   what the server would. */

export {
  bankSaving,
  bestBankOffer,
  emiMonthly,
  lowestEmi,
  offerApplies,
  offerProblem,
  planPrice,
  EMI_MONTH_CHOICES,
  OFFER_KINDS,
} from '../../backend/src/modules/offers/offer-rules';
export type { Offer, OfferInput, OfferKind, OfferTarget } from '../../backend/src/modules/offers/offer-rules';

let cached: Offer[] | null = null;
let loading: Promise<Offer[]> | null = null;

function load(): Promise<Offer[]> {
  if (!loading) {
    loading = apiFetch<Offer[]>('/offers')
      .then((offers) => (cached = offers))
      .catch(() => {
        // No offers is a fine page; try again on the next product.
        loading = null;
        return [];
      });
  }
  return loading;
}

/** The offers on now; empty until they arrive (or if they cannot load). */
export function useLiveOffers(): Offer[] {
  const [offers, setOffers] = useState<Offer[]>(cached ?? []);
  useEffect(() => {
    let on = true;
    void load().then((o) => on && setOffers(o));
    return () => {
      on = false;
    };
  }, []);
  return offers;
}

/** "₹3,000", from paise. */
export const rupeesText = (paise: number) => `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;

/** How an offer reads in one line, for the admin list and the product page. */
export function offerHeadline(o: Offer | Omit<Offer, 'id'>): string {
  switch (o.kind) {
    case 'BANK':
      return o.flatOffInPaise
        ? `${rupeesText(o.flatOffInPaise)} off`
        : `${o.percentOff}% off${o.maxOffInPaise ? ` up to ${rupeesText(o.maxOffInPaise)}` : ''}`;
    case 'EMI':
      return `${o.interestPercent ? `EMI at ${o.interestPercent}% a year` : 'No cost EMI'} · ${o.emiMonths.join(', ')} months`;
    case 'EXCHANGE':
      return o.title || `Up to ${rupeesText(o.maxOffInPaise ?? 0)} off on exchange`;
    case 'PROTECTION':
      return o.title;
  }
}
