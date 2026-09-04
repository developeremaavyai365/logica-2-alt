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

      {/* svh rather than vh: on a phone, vh is the height with the browser
          chrome hidden, so a 100vh block sits taller than the screen and the
          button lands under the address bar until you scroll. */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8 [min-height:100svh]">
        <h2
          className="font-dm-sans font-bold text-white"
          style={{ fontSize: 'clamp(28px, 3.6vw, 50px)', letterSpacing: '-0.03em', lineHeight: 1.04 }}
        >
          Grow with Logica Infoway
        </h2>

        <Link
          to="/careers"
          className="font-inter mt-10 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#0A0A0A] transition-colors duration-300 hover:bg-white/85 sm:mt-12"
        >
          Explore careers
        </Link>
      </div>
    </section>
  );
}
