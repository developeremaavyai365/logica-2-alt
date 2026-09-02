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
        <p
          className="font-inter mt-4 max-w-2xl text-black/55"
          style={{ fontSize: 'clamp(14px, 1.2vw, 17px)', lineHeight: 1.6 }}
        >
          Inside the stores, the launches and the everyday work — straight from{' '}
          <a
            href="https://www.instagram.com/logicainfowayofficial/"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-[#15803D] underline-offset-4 hover:underline"
          >
            @logicainfowayofficial
          </a>
          .
        </p>

        {/* An even grid rather than a scroller: two up on a phone, three on a
            tablet, all five in a row on a desktop. */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {REELS.map((code, i) => (
            <Reel key={code} code={code} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
