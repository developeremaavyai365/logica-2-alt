import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../use-in-view';

/* Full-bleed film with the invitation over it.

   The video is decoration, so it is muted, loops, carries no controls and is
   hidden from assistive tech — the segment reads the same with it stripped
   out. It is also only played while the section is actually on screen: a
   1080p loop decoding behind the footer for the whole visit is a battery and
   bandwidth cost for nothing.

   Anyone who has asked for less motion never gets it playing at all; they get
   the still first frame and the same words over it. */
const VIDEO_SRC = '/video/work-with-us.mp4';

export default function WorkWithUs() {
  const [ref, inView] = useInView<HTMLElement>(0.25);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    if (inView) {
      // Autoplay can still be refused; the poster frame stands in if so.
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-[#0A0A0A]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_SRC}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Enough wash for the type to hold over whatever frame is behind it. */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />

      <div className="relative z-10 mx-auto flex min-h-[26rem] max-w-4xl flex-col items-center justify-center px-5 py-24 text-center sm:min-h-[32rem] sm:px-8 sm:py-32 lg:min-h-[36rem]">
        <p
          className="font-inter font-semibold text-white/70"
          style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.22em' }}
        >
          WORK WITH US
        </p>

        <h2
          className="font-dm-sans mt-6 font-bold text-white"
          style={{ fontSize: 'clamp(32px, 5vw, 68px)', letterSpacing: '-0.03em', lineHeight: 1.06 }}
        >
          Build what the counter runs on
        </h2>

        <p
          className="font-inter mt-6 max-w-2xl text-white/75"
          style={{ fontSize: 'clamp(15px, 1.3vw, 19px)', lineHeight: 1.6, textWrap: 'pretty' }}
        >
          Retail floors, distribution centres, export desks and the storefront behind them — the
          work runs across all four, in offices spread across India.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:info@logicainfoway.com?subject=Career%20Enquiry"
            className="font-inter rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0A0A0A] transition-colors duration-300 hover:bg-white/85"
          >
            Email your resume
          </a>
          <Link
            to="/careers"
            className="font-inter rounded-full border-2 border-white/70 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-[#0A0A0A]"
          >
            Our offices
          </Link>
        </div>
      </div>
    </section>
  );
}
