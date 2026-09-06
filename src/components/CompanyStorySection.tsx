import { useEffect, useRef, useState } from 'react';
import RevealText, { type RevealSegment } from './RevealText';

/* One continuous statement, split into segments only so the two emphasised
   phrases keep their own colour once the words are broken apart for the
   scroll reveal — not because it is two pieces of copy. It reads and fills
   as a single run of text.

   Cut to about half its former length. The counter figures and the list of
   office cities went first: the stats block and the vertical captions
   directly below already publish them, so repeating them here only slowed
   the statement down on the way to the point. 1995 and the 15+ countries
   stay as the two anchors, plus sign kept rather than written out so this
   cannot end up asserting an exact 15 where the rest of the site says "or
   more". */
const STATEMENT: RevealSegment[] = [
  {
    text:
      'Four businesses, one discipline: put the right technology in the right hands. ' +
      'Through counters, distribution centres, export desks and a storefront that ' +
      'never closes, we move computing, mobility and network infrastructure to',
  },
  { text: 'the people and institutions that run on them', emphasis: true },
  {
    text:
      '— and have since 1995. What has not moved in three decades is the standard ' +
      'the counter is held to:',
  },
  { text: 'genuine stock, the brand’s own warranty, one price', emphasis: true },
  {
    text:
      '— whether the buyer is a household, a corporate desk, or in one of the 15+ ' +
      'countries we ship to.',
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
          {/* A heading in its own right, at the same size as every other
              section heading on the page — not the small green label this
              used to be. */}
          <h2
            className="animate-fade-up font-dm-sans font-bold text-[#111111]"
            style={{ fontSize: 'clamp(24px, 2.8vw, 38px)', letterSpacing: '-0.03em', lineHeight: 1.12 }}
          >
            Who We Are
          </h2>

          {/* One statement, set large with room to breathe — the emphasis is
              carried by two phrases rather than by size alone. It darkens word
              by word as the reader scrolls through the pin, the same treatment
              the Logica Infoway captions use. */}
          <RevealText
            segments={STATEMENT}
            className="font-dm-sans mt-8 sm:mt-10"
            style={{ fontSize: 'clamp(17px, 1.9vw, 26px)', letterSpacing: '-0.025em', lineHeight: 1.38 }}
            progress={progress ?? undefined}
          />
        </div>
      </div>
    </section>
  );
}
