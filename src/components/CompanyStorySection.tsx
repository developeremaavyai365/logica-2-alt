import { useEffect, useRef, useState } from 'react';
import RevealText, { type RevealSegment } from './RevealText';

/* The Company's vision, carrying over the hierarchy the Annual Report gives
   it: the statement is the display line and the paragraph beneath explains
   it, rather than both running together as one block of text.

   Set in capitals and with FUTURE-READY picked out, as the report does — the
   report highlights it in yellow, which becomes the green this site already
   uses for accented copy. */
const VISION_LEAD = 'TO BE A LEADING, ';
const VISION_ACCENT = 'FUTURE-READY';
const VISION_TAIL = ' TECHNOLOGY RETAIL AND DISTRIBUTION ECOSYSTEM';

/* The supporting paragraph. One unaccented run: the closing phrase used to
   carry the green, which put a second accent under a statement that already
   has one and split the paragraph in two for no reason. It reads as a single
   piece now, set bold throughout.

   Left verbatim — this is a formal statement, so the overlap between the
   label, the statement and this opening is the Company's to change, not this
   page's. The one correction is "longterm", which was a line break in the
   report rather than a spelling. */
const STATEMENT: RevealSegment[] = [
  {
    text:
      'Our vision is to emerge as the preferred retail and distribution partner for ' +
      'global consumer technology brands in India. We aim to scale our network by ' +
      'increasing stores and strengthening our presence across urban and Tier-2 ' +
      'markets, while building a growing presence in international markets and ' +
      'creating sustainable, long-term value for all our stakeholders.',
  },
];

/** How far the reader has scrolled through the pin, 0-1.
 *
 *  Measured against the tall outer container rather than the paragraph's own
 *  position, which is what makes the fill track the pin: while the inner
 *  block is stuck to the top of the screen it does not move, so measuring it
 *  would report no progress at all.
 *
 *  Returns null when the container is not tall enough to pin — on a phone,
 *  where the pin is switched off — and the paragraph then measures itself as
 *  it always did. */
function usePinProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anyone who has asked for less motion gets the finished text outright.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const travel = r.height - vh;
      if (travel <= 0) {
        setProgress(null);
        return;
      }
      setProgress(Math.min(1, Math.max(0, -r.top / travel)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);

  return progress;
}

export default function CompanyStorySection() {
  const pinRef = useRef<HTMLElement>(null);
  const progress = usePinProgress(pinRef);

  return (
    /* Tall enough to hold the statement on screen while it fills: 100vh of
       that is the pinned view, the remaining 50vh is the scroll that drives
       the fill. That travel was 120vh when the statement was twice as long —
       left alone, half the words would have filled over the same distance and
       the reader would be scrolling a screen and a bit watching very little
       happen. Not pinned below sm — a phone has barely room for the statement
       itself, let alone a screen's worth of travel around it, so there it
       stays an ordinary block and the paragraph goes back to measuring its
       own position. */
    <section ref={pinRef} className="bg-white sm:h-[150vh]">
      <div className="flex items-center px-5 py-16 sm:sticky sm:top-0 sm:h-screen sm:px-8 sm:py-0 lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Steps back to a label so the vision statement below can be the
              largest thing in the section — the report sets it the same way,
              a small VISION rule over the statement. */}
          <h2
            className="animate-fade-up font-inter font-semibold uppercase text-[#15803D]"
            style={{ fontSize: 'clamp(11px, 0.95vw, 13px)', letterSpacing: '0.2em' }}
          >
            Our Vision
          </h2>

          {/* The statement itself, and the largest type on the page after the
              hero. Not put through the scroll reveal: it is the one line the
              section exists to deliver, so it is legible the moment the
              section is reached rather than waiting on scroll. */}
          <p
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
          </p>

          {/* The supporting paragraph, deliberately much smaller than the
              statement so the two read in order — size carries the hierarchy
              now that both are bold. It darkens word by word as the reader
              scrolls through the pin, the same treatment the Logica Infoway
              captions use. */}
          <RevealText
            segments={STATEMENT}
            className="font-dm-sans mt-7 max-w-3xl font-bold sm:mt-9"
            style={{ fontSize: 'clamp(15px, 1.35vw, 19px)', letterSpacing: '-0.015em', lineHeight: 1.5 }}
            progress={progress ?? undefined}
          />
        </div>
      </div>
    </section>
  );
}
