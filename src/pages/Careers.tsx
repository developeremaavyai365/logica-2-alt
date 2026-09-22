import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Careers() {
  return (
    <div className="w-full bg-[#ECEDEC]">
      <Header />

      {/* Full-bleed photo hero — the one place on the site's inner pages
          this is worth breaking from the flat eyebrow+h1 pattern every other
          page uses, since a page asking someone to come work here has more
          to gain from showing the place than every other page does.

          Source is 480x270 — well short of what a full-bleed hero normally
          wants, so it's stretched here on request rather than by default;
          expect it to read soft above roughly tablet width until a larger
          version replaces it. object-cover keeps the subject centred
          instead of squashing the frame. */}
      <section className="relative isolate overflow-hidden bg-[#0A0A0A]">
        <img
          src="/images/careers/why-work-with-us.webp"
          alt="A Logica Infoway team member in the office, with colleagues at work behind him"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />

        <div className="relative z-10 mx-auto flex h-[22rem] max-w-3xl flex-col items-center justify-center px-5 text-center sm:h-[26rem] sm:px-8 lg:h-[30rem]">
          <h1
            className="font-dm-sans font-bold text-white"
            style={{ fontSize: 'clamp(30px, 4.4vw, 56px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            Grow with Logica Infoway
          </h1>
          <Link
            to="/careers/open-roles"
            className="mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#0A0A0A] transition-colors duration-300 hover:bg-white/85"
          >
            View Roles
          </Link>
        </div>
      </section>

      {/* Why work with us — text only now that the same photo is the hero
          above it; showing it twice, back to back, would have read as a
          mistake rather than a choice. Centred to match the Philosophy-style
          blocks the rest of the site uses for a single column of copy.

          Led with the company's own stated philosophy rather than a bullet
          list of reasons to join — it's the real, published line (the same
          one the About page and the site's earlier Careers page carried
          verbatim), and it's the one place that statement names employees
          on equal footing with owners, customers and community, which is
          exactly the case a "why work with us" reader wants made. Kept as
          one solid black block rather than picking out a phrase in the
          accent colour — the statement reads as a single line of intent,
          not one word promoted over the rest of it. */}
      <section className="w-full bg-white py-16 sm:py-20 px-4 sm:px-6 md:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="font-dm-sans font-bold text-[#000000]"
            style={{ fontSize: 'clamp(24px, 2.6vw, 34px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Why Work With Us
          </h2>
          <blockquote
            className="mt-6 font-bold text-[#000000]"
            style={{ fontSize: 'clamp(17px, 1.9vw, 24px)', letterSpacing: '-0.015em', lineHeight: 1.5 }}
          >
            &ldquo;Our philosophy is that corporate enterprises must be managed not merely in the
            interests of their owners, but equally in those of their employees, of the consumers
            of their products, of the local community and finally of the country as a
            whole.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Everything below this is being rebuilt piece by piece — next
          sections land here as they're ready. */}

      <Footer />
    </div>
  );
}
