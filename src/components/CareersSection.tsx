import { Link } from 'react-router-dom';
import RevealText from './RevealText';

/* A teaser for the careers page rather than a second version of it — the
   headline, the philosophy quote and the "no open positions yet" position are
   all lifted from that page verbatim, so the homepage cannot end up promising
   a job board the site does not have. */
const PHILOSOPHY =
  'Our philosophy is that corporate enterprises must be managed not merely in the interests ' +
  'of their owners, but equally in those of their employees, of the consumers of their ' +
  'products, of the local community and finally of the country as a whole.';

export default function CareersSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <p
          className="animate-fade-up font-inter font-semibold text-[#15803D]"
          style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.22em' }}
        >
          CAREERS
        </p>

        <h2
          className="animate-fade-up font-dm-sans mx-auto mt-6 font-bold text-[#111111]"
          style={{ fontSize: 'clamp(30px, 4.4vw, 58px)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
        >
          Grow with Logica Infoway
        </h2>

        {/* Darkens word by word on scroll, the same treatment the Who We Are
            statement and the vertical captions use. */}
        <RevealText
          segments={[{ text: PHILOSOPHY }]}
          className="font-dm-sans mx-auto mt-8 max-w-3xl"
          style={{ fontSize: 'clamp(17px, 1.8vw, 24px)', lineHeight: 1.5, letterSpacing: '-0.015em', textWrap: 'pretty' }}
        />

        <p
          className="font-inter mx-auto mt-8 max-w-xl text-black/55"
          style={{ fontSize: 'clamp(14px, 1.15vw, 16px)', lineHeight: 1.6, textWrap: 'pretty' }}
        >
          There is no live job board yet, but we are always glad to hear from people who want to
          grow with us.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/careers"
            className="font-inter rounded-full bg-[#0A0A0A] px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#1f1f1f]"
          >
            See careers
          </Link>
          <a
            href="mailto:info@logicainfoway.com?subject=Career%20Enquiry"
            className="font-inter rounded-full border-2 border-[#0A0A0A] px-7 py-3.5 text-sm font-semibold text-[#0A0A0A] transition-colors duration-300 hover:bg-[#0A0A0A] hover:text-white"
          >
            Email your resume
          </a>
        </div>
      </div>
    </section>
  );
}
