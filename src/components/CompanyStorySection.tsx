import RevealText, { type RevealSegment } from './RevealText';

/* One continuous statement, split into segments only so the two emphasised
   phrases keep their own colour once the words are broken apart for the
   scroll reveal — not because it is two pieces of copy. It reads and fills
   as a single run of text.

   Every figure in the back half is one the site already carries elsewhere:
   1995 and the 10+ categories from the trust strip, along with the corporate
   and government client base; 82+ counters, five distribution centres and 7+
   countries from the stats block; the seven offices from the map. The plus
   signs are kept rather than written out, so this cannot end up asserting an
   exact 82 or an exact 7 where the rest of the site says "or more". */
const STATEMENT: RevealSegment[] = [
  {
    text:
      'Four businesses, one discipline: put the right technology in the right hands. ' +
      'Through retail counters, distribution centres, export desks and a storefront ' +
      'that never closes, we move computing, mobility and network infrastructure to',
  },
  { text: 'the people and institutions that run on them', emphasis: true },
  {
    text:
      '— from the warehouse floor to the last mile. We have been at it since 1995. ' +
      'Three decades on, the shape of the company has changed more than the discipline has: ' +
      '82+ counters and five distribution centres in place of one shop, 10+ categories in ' +
      'place of a handful, and offices in Kolkata, Delhi, Noida, Lucknow, Mumbai, Bengaluru ' +
      'and Hyderabad holding the whole thing together. What has not moved is the standard ' +
      'the ' +
      'counter is held to —',
  },
  { text: 'genuine stock, the brand’s own warranty, one price', emphasis: true },
  {
    text:
      '— whether the order comes from a household, a corporate desk, a government ' +
      'department or a buyer in one of the 7+ countries we ship to. The catalogue is the same ' +
      'online as it is in the shop, and the people who sold it are the people who service it ' +
      'afterwards.',
  },
];

export default function CompanyStorySection() {
  return (
    <section className="bg-white px-5 pb-12 pt-16 sm:px-8 sm:pb-14 sm:pt-20 lg:px-10 lg:pb-16 lg:pt-24">
      {/* Brand green rather than a grey tint: it carries the same accent as the
          emphasised phrase below, and clears AA on white at 5:1 where the old
          45% black did not. */}
      <div className="animate-fade-up mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* One statement, set large with room to breathe — the emphasis is
            carried by two phrases rather than by size alone. It darkens word
            by word as the block is scrolled through, the same treatment the
            Logica Infoway captions use.

            Slightly smaller than it was, since it now runs to a full
            paragraph: at the old 30px a statement this long filled the screen
            on its own. */}
        <RevealText
          segments={STATEMENT}
          className="font-dm-sans"
          style={{ fontSize: 'clamp(17px, 1.9vw, 26px)', letterSpacing: '-0.025em', lineHeight: 1.38 }}
        />
      </div>
    </section>
  );
}
