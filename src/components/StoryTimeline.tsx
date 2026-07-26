import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { nameHistory } from '../data';

gsap.registerPlugin(ScrollTrigger);

function yearOf(date: string) {
  const match = date.match(/\d{4}/);
  return match ? match[0] : date;
}

export default function StoryTimeline() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Line fills in as the whole timeline is scrolled through.
      if (fillRef.current && wrapperRef.current) {
        gsap.fromTo(
          fillRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: 'top 75%',
              end: 'bottom 60%',
              scrub: 0.6,
            },
          },
        );
      }

      // Each card slides in from alternating sides and back out, scrubbed
      // continuously with scroll position — cinematic, wide-throw motion.
      nameHistory.forEach((_, i) => {
        const card = cardRefs.current[i];
        const dot = dotRefs.current[i];
        if (!card) return;
        const odd = i % 2 === 0;

        gsap.fromTo(
          card,
          { autoAlpha: 0, x: odd ? -140 : 140, y: 40, rotate: odd ? -8 : 8, scale: 0.88 },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'top 45%',
              scrub: 0.7,
            },
          },
        );

        if (dot) {
          gsap.fromTo(
            dot,
            { scale: 0.3, backgroundColor: '#4b5b47' },
            {
              scale: 1,
              backgroundColor: '#85AB8B',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                end: 'top 60%',
                scrub: 0.6,
              },
            },
          );
        }
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#12190f] flex items-center py-24 sm:py-32 px-4 sm:px-6 md:px-10 overflow-hidden">
      {/* Cinematic ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 15%, rgba(133,171,139,0.16), transparent 70%), radial-gradient(50% 40% at 50% 90%, rgba(61,86,56,0.18), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-3xl mx-auto">
        <div className="text-center mb-16 sm:mb-20">
          <span className="text-[#85AB8B] text-xs sm:text-sm font-semibold uppercase tracking-wide">Our story</span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-white" style={{ letterSpacing: '-0.03em' }}>
            From Eastern Logica to Logica Infoway
          </h2>
          <p className="mt-5 text-white/60 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Three decades of name changes, one continuous business — founded in 1995, registered as
            a public limited company in Kolkata, and still serving corporate and government clients
            across eight cities today.
          </p>
        </div>

        <div ref={wrapperRef} className="relative py-6">
          {/* Center connecting line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-white/10 sm:-translate-x-1/2 overflow-hidden">
            <div
              ref={fillRef}
              className="absolute inset-0 origin-top"
              style={{ transform: 'scaleY(0)', background: 'linear-gradient(180deg, #85AB8B, #3d5638)' }}
            />
          </div>

          <ul className="space-y-14 sm:space-y-20">
            {nameHistory.map((entry, i) => {
              const odd = i % 2 === 0;
              return (
                <li
                  key={entry.name}
                  className="relative grid grid-cols-[2rem_1fr] sm:grid-cols-[1fr_2rem_1fr] items-center gap-4 sm:gap-10"
                >
                  {/* Dot on the line */}
                  <div className="order-1 sm:order-2 relative flex justify-center">
                    <div
                      ref={(el) => {
                        dotRefs.current[i] = el;
                      }}
                      className="w-3.5 h-3.5 rounded-full ring-8 ring-[#12190f]"
                      style={{ backgroundColor: '#4b5b47', boxShadow: '0 0 16px 2px rgba(133,171,139,0.6)' }}
                    />
                  </div>

                  {/* Spacer on desktop for the non-card side */}
                  <div className={`hidden sm:block ${odd ? 'sm:order-3' : 'sm:order-1'}`} />

                  {/* Card */}
                  <div
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className={`order-2 ${odd ? 'sm:order-1' : 'sm:order-3'} relative rounded-2xl bg-white p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]`}
                  >
                    <span className="absolute -top-3.5 left-6 bg-[#85AB8B] text-[#1f2a1d] text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md">
                      {yearOf(entry.date)}
                    </span>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
                      <div className="flex-1">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#3d5638] mb-1">Event</h4>
                        <p className="text-sm sm:text-base text-[#4b5b47] leading-snug">{entry.event}</p>
                      </div>
                      <div className="flex-1 sm:border-l sm:border-[#1f2a1d]/10 sm:pl-6">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#3d5638] mb-1">Company Name</h4>
                        <p className="text-sm sm:text-base font-semibold text-[#1f2a1d] leading-snug">{entry.name}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-[#4b5b47]/60">{entry.date}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="text-center mt-16 sm:mt-20">
          <Link to="/about" className="inline-block text-white text-sm font-semibold hover:opacity-80 transition-opacity">
            Read our full story →
          </Link>
        </div>
      </div>
    </section>
  );
}
