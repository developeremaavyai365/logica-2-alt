import RevealText, { type RevealSegment } from './RevealText';

/* The statement, in segments so the emphasised phrase keeps its own colour
   once the words are split apart for the scroll reveal. */
const STATEMENT: RevealSegment[] = [
  {
    text:
      'Four businesses, one discipline: put the right technology in the right hands. ' +
      'Through retail counters, distribution centres, export desks and a storefront ' +
      'that never closes, we move computing, mobility and network infrastructure to',
  },
  { text: 'the people and institutions that run on them', emphasis: true },
  { text: '\u2014 from the warehouse floor to the last mile.' },
];

/* The second half, set smaller so the opening statement still leads.

   Every figure and claim here is one the site already carries elsewhere: the
   1995 founding and the ten-plus categories come from the trust strip, the
   eight cities and the corporate and government client base from the same
   place, the counters, centres and countries from the stats block, and the
   offices from the map. Nothing has been added that a reader could not check
   against another page. */
const STATEMENT_MORE: RevealSegment[] = [
  {
    text:
      'We have been at it since 1995. Three decades on, the shape of the company has changed ' +
      'more than the discipline has: 82+ counters and five distribution centres in place of one ' +
      'shop, 10+ categories in place of a handful, and offices in Kolkata, Delhi, Mumbai, ' +
      'Bengaluru, Gurugram and Hyderabad holding the whole thing together. What has not moved ' +
      'is the standard the counter is held to \u2014',
  },
  { text: 'genuine stock, the brand\u2019s own warranty, one price', emphasis: true },
  {
    text:
      'whether the order comes from a household, a corporate desk, a government department or a ' +
      'buyer in one of the 7+ countries we ship to. The catalogue is the same online as it is in ' +
      'the shop, and the people who sold it are the people who service it afterwards.',
  },
];

export default function CompanyStorySection() {
  return (
    <section className="bg-white px-5 pb-12 pt-16 sm:px-8 sm:pb-14 sm:pt-20 lg:px-10 lg:pb-16 lg:pt-24">
      {/* Brand green rather than a grey tint: it carries the same accent as the
          emphasised phrase below, and clears AA on white at 5:1 where the old
          45% black did not. */}
      <p
        className="animate-fade-up font-inter text-center font-semibold text-[#15803D]"
        style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.22em' }}
      >
        WHO WE ARE
      </p>

      <div className="animate-fade-up mx-auto mt-10 flex max-w-5xl flex-col items-center text-center sm:mt-14">
        {/* One statement, set large with room to breathe — the emphasis is
            carried by a single phrase rather than by size alone. It darkens
            word by word as the block is scrolled through, the same treatment
            the Logica Infoway captions use. */}
        <RevealText
          segments={STATEMENT}
          className="font-dm-sans"
          style={{ fontSize: 'clamp(19px, 2.2vw, 30px)', letterSpacing: '-0.025em', lineHeight: 1.32 }}
        />

        {/* Its own RevealText rather than more words in the first: each fills
            as it is actually reached, so the lower half is not already dark by
            the time the reader gets to it. Narrower measure too — this runs
            long, and a 5xl line length at this size is tiring to read. */}
        <RevealText
          segments={STATEMENT_MORE}
          className="font-inter mt-8 max-w-3xl sm:mt-10"
          style={{ fontSize: 'clamp(14px, 1.15vw, 17px)', lineHeight: 1.7, textWrap: 'pretty' }}
        />
      </div>
    </section>
  );
}
