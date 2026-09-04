import RevealText, { type RevealSegment } from './RevealText';

/* Closes the careers film with what the company says it is for.

   The quote is the one the careers page already carries, word for word — it
   is the company's stated philosophy, not a line written for this block, and
   the two should never drift apart.

   The foundation sentence picks up the quote's own last clause, "the country
   as a whole", rather than making a separate claim of its own. It says that
   Logica Infoway runs Super Soul Foundation and links out to it; it does not
   describe what the foundation does, because nothing on this site sets that
   out and an unsourced description of a charity's work is not something to
   invent. */
const PHILOSOPHY: RevealSegment[] = [
  {
    text:
      '“Our philosophy is that corporate enterprises must be managed not merely in the ' +
      'interests of their owners, but equally in those of their employees, of the consumers ' +
      'of their products, of the local community and finally of',
  },
  { text: 'the country as a whole', emphasis: true },
  { text: '.”' },
];

export default function PhilosophySection() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p
          className="animate-fade-up font-inter font-semibold text-[#15803D]"
          style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.22em' }}
        >
          WHAT WE STAND FOR
        </p>

        {/* Darkens word by word on scroll, the same treatment the Who We Are
            statement uses. */}
        <RevealText
          segments={PHILOSOPHY}
          className="font-dm-sans mt-8 sm:mt-10"
          style={{ fontSize: 'clamp(17px, 1.9vw, 26px)', letterSpacing: '-0.025em', lineHeight: 1.38, textWrap: 'pretty' }}
        />

        {/* Plain text rather than another RevealText: that component splits
            its copy into one span per word, so a link cannot sit inside it. */}
        <p
          className="font-inter mt-8 max-w-2xl text-black/60 sm:mt-10"
          style={{ fontSize: 'clamp(14px, 1.15vw, 17px)', lineHeight: 1.7, textWrap: 'pretty' }}
        >
          That last part is why Logica Infoway runs the{' '}
          <a
            href="https://www.supersoulfoundation.com/index.php"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#15803D] underline decoration-[#15803D]/30 underline-offset-4 transition-colors hover:decoration-[#15803D]"
          >
            Super Soul Foundation
          </a>
          , its work for the good of society carried on alongside the business rather than
          apart from it.
        </p>
      </div>
    </section>
  );
}
