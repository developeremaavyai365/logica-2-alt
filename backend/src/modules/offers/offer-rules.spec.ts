import { OfferInput, bankSaving, bestBankOffer, emiMonthly, lowestEmi, offerApplies, offerProblem, planPrice } from './offer-rules';

const base: OfferInput = {
  kind: 'BANK',
  provider: 'HDFC Bank',
  paymentType: 'Credit card',
  title: '',
  terms: '',
  flatOffInPaise: null,
  percentOff: null,
  maxOffInPaise: null,
  minPriceInPaise: null,
  emiMonths: [],
  interestPercent: null,
  planPriceInPaise: null,
  planPricePercent: null,
  coverMonths: null,
  categories: [],
  brands: [],
  active: true,
  endsAt: null,
};
const offer = (o: Partial<OfferInput>): OfferInput => ({ ...base, ...o });
const phone = { priceInPaise: 6_990_000, category: 'mobile-phones', brand: 'Apple' };

describe('offerProblem', () => {
  it('asks a bank offer for its bank and one kind of discount', () => {
    expect(offerProblem(offer({ provider: ' ', flatOffInPaise: 300_000 }))).toBe("Write the bank's name.");
    expect(offerProblem(offer({}))).toMatch(/Write the discount/);
    expect(offerProblem(offer({ flatOffInPaise: 300_000, percentOff: 10 }))).toMatch(/not both/);
    expect(offerProblem(offer({ flatOffInPaise: 300_000 }))).toBeNull();
  });

  it('asks EMI for months and an interest rate, where 0 is no cost EMI', () => {
    expect(offerProblem(offer({ kind: 'EMI', interestPercent: 0 }))).toMatch(/months/);
    expect(offerProblem(offer({ kind: 'EMI', emiMonths: [6] }))).toMatch(/interest/);
    expect(offerProblem(offer({ kind: 'EMI', emiMonths: [3, 6], interestPercent: 0 }))).toBeNull();
  });

  it('asks an exchange offer for its most off, and a plan for name, price and cover', () => {
    expect(offerProblem(offer({ kind: 'EXCHANGE' }))).toMatch(/most/);
    expect(offerProblem(offer({ kind: 'EXCHANGE', maxOffInPaise: 5_200_000 }))).toBeNull();
    expect(offerProblem(offer({ kind: 'PROTECTION', title: 'Screen damage', planPriceInPaise: 99_900 }))).toMatch(/months/);
    expect(offerProblem(offer({ kind: 'PROTECTION', title: 'Screen damage', planPricePercent: 5, coverMonths: 12 }))).toBeNull();
  });
});

describe('offerApplies', () => {
  it('follows the price floor, the categories, the brands and the end date', () => {
    expect(offerApplies(offer({ minPriceInPaise: 1_000_000 }), phone)).toBe(true);
    expect(offerApplies(offer({ minPriceInPaise: 9_000_000 }), phone)).toBe(false);
    expect(offerApplies(offer({ categories: ['laptops'] }), phone)).toBe(false);
    expect(offerApplies(offer({ brands: ['apple'] }), phone)).toBe(true);
    expect(offerApplies(offer({ brands: ['Samsung'] }), phone)).toBe(false);
    expect(offerApplies(offer({ endsAt: '2020-01-01T00:00:00Z' }), phone)).toBe(false);
    expect(offerApplies(offer({ active: false }), phone)).toBe(false);
  });
});

describe('the sums', () => {
  it('takes a flat amount, or a percent up to its cap', () => {
    expect(bankSaving(offer({ flatOffInPaise: 300_000 }), phone.priceInPaise)).toBe(300_000);
    expect(bankSaving(offer({ percentOff: 10 }), phone.priceInPaise)).toBe(699_000);
    expect(bankSaving(offer({ percentOff: 10, maxOffInPaise: 150_000 }), phone.priceInPaise)).toBe(150_000);
  });

  it('splits no cost EMI evenly and charges interest otherwise, rounded up to the rupee', () => {
    expect(emiMonthly(6_990_000, 6, 0)).toBe(1_165_000);
    // ₹69,900 at 15% a year for 12 months is ₹6,309.03 a month.
    expect(emiMonthly(6_990_000, 12, 15)).toBe(631_000);
  });

  it('prices a plan at a fixed amount or a percent of the product', () => {
    expect(planPrice(offer({ planPriceInPaise: 99_900 }), phone.priceInPaise)).toBe(99_900);
    expect(planPrice(offer({ planPricePercent: 5 }), phone.priceInPaise)).toBe(349_500);
  });

  it('picks the biggest bank saving and the lowest instalment', () => {
    const offers = [
      offer({ provider: 'HDFC Bank', flatOffInPaise: 300_000 }),
      offer({ provider: 'SBI', percentOff: 10, maxOffInPaise: 400_000 }),
      offer({ kind: 'EMI', provider: 'HDFC Bank', emiMonths: [3, 6], interestPercent: 0 }),
      offer({ kind: 'EMI', provider: 'Axis Bank', emiMonths: [24], interestPercent: 16 }),
    ];
    expect(bestBankOffer(offers, phone.priceInPaise)).toMatchObject({ saving: 400_000, offer: { provider: 'SBI' } });
    expect(lowestEmi(offers, phone.priceInPaise)).toMatchObject({ months: 24, offer: { provider: 'Axis Bank' } });
  });
});
