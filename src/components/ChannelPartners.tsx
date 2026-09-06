import LogoMarquee, { type LogoItem } from './LogoMarquee';

/* The marketplaces and distributors Logica Infoway sells through, sitting
   between the four verticals and the figures without competing with either.

   Flipkart and JioMart carry an optical scale: a wordmark is read across its
   width, so a square or round mark fitted into the same box reads as the
   smallest thing in the row and loses its detail. */
const PARTNERS: LogoItem[] = [
  { name: 'Amazon', src: '/logos/partners/amazon.png' },
  { name: 'Flipkart', src: '/logos/partners/flipkart.svg', scale: 1.2 },
  { name: 'JioMart', src: '/logos/partners/jiomart.png', scale: 1.2 },
  { name: 'Redington', src: '/logos/partners/redington.png' },
];

export default function ChannelPartners() {
  return <LogoMarquee label="Authorised Channel Partners" items={PARTNERS} />;
}
