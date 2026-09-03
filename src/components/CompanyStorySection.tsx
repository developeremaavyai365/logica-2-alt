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

export default function CompanyStorySection() {
  return (
    <section className="bg-white px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-28 lg:px-10 lg:pb-24 lg:pt-36">
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
          style={{ fontSize: 'clamp(24px, 3.4vw, 46px)', letterSpacing: '-0.025em', lineHeight: 1.32 }}
        />
      </div>
    </section>
  );
}
