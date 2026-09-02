/* Reels from the official Logica Infoway account.

   Instagram's embed wraps every reel in its own chrome: an avatar, the
   handle, a "View profile" button and the audio credit above the video, then
   likes, comment box and "View more on Instagram" below it. That chrome is
   inside a cross-origin iframe, so it cannot be styled or hidden from here —
   the only way to show the video alone is to clip it.

   So each reel sits in a box the size of the video itself, with the iframe
   pulled up by the height of the header and given far more height than the
   box, letting overflow hide everything underneath. Instagram's own play
   overlay stays, since that is what starts the video.

   Embedding the reel URLs directly rather than going through embed.js: the
   script exists to resize the blockquote to fit the whole post, which is the
   opposite of what is wanted here. */

import { Instagram } from 'lucide-react';
import { socials } from '../data';

/** Taken from the shared socials list rather than written out again here, so
 *  this and the contact page and the footer cannot drift apart. */
const INSTAGRAM_URL =
  socials.find((s) => s.label === 'Instagram')?.href ??
  'https://www.instagram.com/logicainfowayofficial/';
/** Same fill the contact page uses for its Instagram icon. */
const INSTAGRAM_FILL = '#d6249f';

/** Height of Instagram's header block — avatar, handle, audio credit. */
const HEADER_CROP = 54;
/** Video height as a multiple of its width, as the embed renders it. */
const MEDIA_RATIO = 1.25;

const REELS: string[] = [
  'DcSxqsMTB2Z',
  'DXwfzTGz3vW',
  'DV3LYExk5_U',
  'DMAfKEKTf3j',
  'DIjOSjAzZNs',
];

function Reel({ code, index }: { code: string; index: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-black/[0.08] bg-[#F4F4F2]"
      style={{ aspectRatio: `1 / ${MEDIA_RATIO}` }}
    >
      <iframe
        src={`https://www.instagram.com/reel/${code}/embed/`}
        title={`Logica Infoway reel ${index + 1}`}
        loading="lazy"
        scrolling="no"
        allowFullScreen
        className="absolute left-0 block w-full border-0"
        style={{
          top: `-${HEADER_CROP}px`,
          // Generous: the box clips it, and a short iframe would letterbox.
          height: `calc(100% + ${HEADER_CROP + 340}px)`,
        }}
      />
    </div>
  );
}

export default function CompanyReels() {
  return (
    <section className="w-full bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <p
          className="font-inter font-semibold text-[#15803D]"
          style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.22em' }}
        >
          ON THE FLOOR
        </p>
        <h2
          className="font-dm-sans mt-4 font-bold text-[#111111]"
          style={{ fontSize: 'clamp(26px, 3.4vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}
        >
          From the Logica floor
        </h2>
        {/* An even grid rather than a scroller: two up on a phone, three on a
            tablet, all five in a row on a desktop. */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {REELS.map((code, i) => (
            <Reel key={code} code={code} index={i} />
          ))}
        </div>

        {/* The contact page's treatment: white circle, the brand fill rising
            from the bottom on hover, the icon turning over and going white. */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="group mt-10 inline-flex items-center gap-4 sm:mt-12"
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-black/10 bg-white sm:h-14 sm:w-14">
            <span
              className="absolute inset-0 top-full transition-all duration-500 group-hover:top-0"
              style={{ background: INSTAGRAM_FILL }}
            />
            <Instagram
              className="relative z-10 h-5 w-5 text-black transition-all duration-500 group-hover:text-white group-hover:[transform:rotateY(360deg)]"
              strokeWidth={1.75}
            />
          </span>
          <span
            className="font-dm-sans font-bold text-[#0A0A0A] transition-colors duration-500"
            style={{ fontSize: 'clamp(15px, 1.4vw, 19px)', letterSpacing: '-0.02em' }}
          >
            <span className="transition-colors duration-500 group-hover:text-[#d6249f]">
              Follow us on Instagram
            </span>
            <span className="font-inter mt-0.5 block text-[13px] font-normal text-black/45">
              @logicainfowayofficial
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
