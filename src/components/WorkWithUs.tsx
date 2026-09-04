import { Link } from 'react-router-dom';

/* The office photograph full-bleed, with the invitation over it. */
const PHOTO = '/images/work-with-us.jpg';

export default function WorkWithUs() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0A0A0A]">
      <img
        src={PHOTO}
        alt="The Logica Infoway team at work in the office"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />

      {/* Enough wash for the type to hold over the photograph. */}
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
