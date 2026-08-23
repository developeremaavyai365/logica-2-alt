interface Offer {
  bank: string;
  color: string;
  text: string;
}

const OFFERS: Offer[] = [
  { bank: 'HSBC', color: '#DB0011', text: 'Get Upto Rs 12,000 Instant Discount on HSBC Bank Cards for EMI and Non-EMI' },
  { bank: 'ICICI Bank', color: '#F58220', text: 'Get 5% Upto Rs 7,500 Instant Discount on ICICI Bank Credit Cards EMI' },
  { bank: 'YES BANK', color: '#00205B', text: 'Get 5% Instant Discount Upto Rs 2500 on YES Bank Credit Card EMI' },
  { bank: 'IDFC First Bank', color: '#8B1874', text: 'Get 5% Instant Discount Upto Rs.10,000 on IDFC First Bank Credit Card EMI' },
];

const LOOP_OFFERS = [...OFFERS, ...OFFERS];

export default function OffersStrip() {
  return (
    <section className="w-full overflow-hidden border-y border-black/10 bg-white">
      <div
        className="animate-marquee flex w-max"
        style={{ animationDuration: `${OFFERS.length * 6}s` }}
      >
        {LOOP_OFFERS.map((offer, i) => (
          <div key={i} className="flex w-[288px] shrink-0 items-center gap-3 border-r border-black/10 px-5 py-4">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: offer.color }} />
            <div>
              <p className="font-inter text-xs font-semibold text-black" style={{ letterSpacing: '-0.01em' }}>
                {offer.bank}
              </p>
              <p className="font-inter mt-0.5 text-xs text-black/70" style={{ letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                {offer.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
