import LogoMarquee, { type LogoItem } from './LogoMarquee';

/* The marketplaces and distributors Logica Infoway sells through, sitting
   between the four verticals and the figures without competing with either.

   Flipkart and JioMart carry an optical scale: a wordmark is read across its
   width, so a square or round mark fitted into the same box reads as the
   smallest thing in the row and loses its detail. Savex, Supertron and RP
   tech are wide wordmarks like Amazon and Redington, so they need none.

   The three distributor logos arrived on white; each was keyed to
   transparent and cropped to its artwork. Supertron's source is small, so it
   is kept at its native size rather than enlarged. */
const PARTNERS: LogoItem[] = [
  { name: 'Amazon', src: '/logos/partners/amazon.png' },
  { name: 'Flipkart', src: '/logos/partners/flipkart.svg', scale: 1.2 },
  { name: 'JioMart', src: '/logos/partners/jiomart.png', scale: 1.2 },
  { name: 'Redington', src: '/logos/partners/redington.png' },
  { name: 'Savex Technologies', src: '/logos/partners/savex.png' },
  { name: 'Supertron', src: '/logos/partners/supertron.png' },
  { name: 'RP tech (Rashi Peripherals)', src: '/logos/partners/rptech.png' },
];

export default function ChannelPartners() {
  return <LogoMarquee label="Authorised Channel Partners" items={PARTNERS} />;
}
