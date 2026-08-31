import { useEffect, useRef, useState } from 'react';

/* The full name is set as one unit — "LOGICA INFOWAY" at a single weight and
   size, not a large word with a smaller qualifier under it — and the
   registered logo is revealed once the name has landed.

   The entrance runs off an IntersectionObserver, since the section sits well
   down the page and a load-time animation would finish before anyone reached
   it. A safety timer reveals everything regardless after REVEAL_FALLBACK, so
   an observer that never fires cannot leave the section blank. */
const REVEAL_FALLBACK = 2500;
const LOGO_DELAY = 820;

export default function BrandMarkSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [nameIn, setNameIn] = useState(false);
  const [logoIn, setLogoIn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    let logoTimer: ReturnType<typeof setTimeout>;

    const reveal = () => {
      setNameIn(true);
      logoTimer = setTimeout(() => setLogoIn(true), LOGO_DELAY);
    };

    const fallback = setTimeout(reveal, REVEAL_FALLBACK);

    let observer: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              clearTimeout(fallback);
              reveal();
            }
          });
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
    }

    return () => {
      clearTimeout(fallback);
      clearTimeout(logoTimer);
      observer?.disconnect();
    };
  }, []);

  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-40">
      <div ref={ref} className="mx-auto flex max-w-6xl flex-col items-center">
        {/* The whole name, one size and one weight, sized to the container so
            it holds together as a single line rather than two registers. */}
        <h2
          className="font-dm-sans text-center font-extrabold uppercase leading-none text-[#0A0A0A] transition-all ease-out"
          style={{
            fontSize: 'clamp(34px, 8.4vw, 122px)',
            letterSpacing: '-0.035em',
            opacity: nameIn ? 1 : 0,
            transform: nameIn ? 'translateY(0)' : 'translateY(22px)',
            transitionDuration: '820ms',
          }}
        >
          Logica Infoway
        </h2>

        {/* The registered mark, held back until the name has settled */}
        <img
          src="/logica-trademark.png"
          alt="Logica registered trademark"
          className="mt-12 h-auto w-full transition-all ease-out sm:mt-16"
          style={{
            maxWidth: 'clamp(200px, 30vw, 400px)',
            opacity: logoIn ? 1 : 0,
            transform: logoIn ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.94)',
            transitionDuration: '760ms',
          }}
        />
      </div>
    </section>
  );
}
