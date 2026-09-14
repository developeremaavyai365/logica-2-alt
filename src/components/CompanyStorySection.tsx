/* The Company's vision, carrying over the hierarchy the Annual Report gives
   it: a small label, the statement as the display line, and the paragraph
   beneath explaining it.

   An ordinary section — no pin, no scroll-driven fill, no picture. It reads
   as static text the moment it is on screen, which is why the component no
   longer measures scroll or holds any state.

   Set in capitals with FUTURE-READY picked out, as the report does; the
   report highlights it in yellow, which becomes the green this site already
   uses for accented copy. */
const VISION_LEAD = 'TO BE A LEADING, ';
const VISION_ACCENT = 'FUTURE-READY';
const VISION_TAIL = ' TECHNOLOGY RETAIL AND DISTRIBUTION ECOSYSTEM';

/* Left verbatim — this is a formal statement, so the overlap between the
   label, the statement and this opening is the Company's to change, not this
   page's. The one correction is "longterm", which was a line break in the
   report rather than a spelling. */
const SUPPORTING =
  'Our vision is to emerge as the preferred retail and distribution partner for ' +
  'global consumer technology brands in India. We aim to scale our network by ' +
  'increasing stores and strengthening our presence across urban and Tier-2 ' +
  'markets, while building a growing presence in international markets and ' +
  'creating sustainable, long-term value for all our stakeholders.';

export default function CompanyStorySection() {
  return (
    /* One centred column with ordinary section padding, the same as the
       blocks around it — only as tall as its own content. */
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* A label rather than a heading, so the statement below can be the
            largest thing here — the report sets it the same way, a small
            VISION rule over the statement. */}
        <p
          className="font-inter font-semibold uppercase text-[#15803D]"
          style={{ fontSize: 'clamp(11px, 0.95vw, 13px)', letterSpacing: '0.2em' }}
        >
          Our Vision
        </p>

        {/* The statement, and the largest type on the page after the hero. */}
        <h2
          className="font-dm-sans mt-5 max-w-4xl font-bold text-[#111111] sm:mt-6"
          style={{
            fontSize: 'clamp(26px, 4.1vw, 54px)',
            lineHeight: 1.06,
            letterSpacing: '-0.015em',
            textWrap: 'balance',
          }}
        >
          {VISION_LEAD}
          <span className="text-[#15803D]">{VISION_ACCENT}</span>
          {VISION_TAIL}
        </h2>

        {/* Deliberately much smaller than the statement so the two read in
            order — size carries the hierarchy, since both are bold. */}
        <p
          className="font-dm-sans mt-7 max-w-3xl font-bold text-[#111111] sm:mt-9"
          style={{ fontSize: 'clamp(15px, 1.35vw, 19px)', letterSpacing: '-0.015em', lineHeight: 1.5 }}
        >
          {SUPPORTING}
        </p>
      </div>
    </section>
  );
}
