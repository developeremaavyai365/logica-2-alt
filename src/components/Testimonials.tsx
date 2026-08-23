import { useRef, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

// Placeholder testimonials — swap in real customer quotes/photos once
// Armaan has them; layout is built to accommodate any count.
const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rohan Mehta',
    role: 'IT Head, Manufacturing Firm',
    quote: 'Logica Infoway has been our go-to for bulk laptop procurement for three years running. Genuine hardware, real warranty support, no surprises.',
    avatar: '/lifestyle/laptops.jpg',
  },
  {
    name: 'Ayesha Khan',
    role: 'Operations Manager, Retail Chain',
    quote: 'Ordered 40 desktops for our new branch rollout — delivery was on time across every city, and their support team actually picks up the phone.',
    avatar: '/lifestyle/desktops.jpg',
  },
  {
    name: 'Vikram Singh',
    role: 'Founder, Design Studio',
    quote: 'Walked into the Kolkata store looking for a laptop, ended up with genuinely useful advice on what actually fit my workflow. No upselling.',
    avatar: '/lifestyle/mobile-phones.jpg',
  },
  {
    name: 'Priya Nair',
    role: 'Procurement Lead, Government Office',
    quote: 'Three decades of dealing with government tenders shows in how they handle documentation and compliance. Zero friction on our side.',
    avatar: '/lifestyle/monitors.jpg',
  },
  {
    name: 'Arjun Reddy',
    role: 'Store Owner, Hyderabad',
    quote: 'Been a Logica customer since the early 2000s. Watched them grow from one office to a nationwide network without losing the personal touch.',
    avatar: '/lifestyle/printers.jpg',
  },
];

function StarRow() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function scrollByCard(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[0] as HTMLElement | undefined;
    const step = (card?.offsetWidth ?? 300) + 24;
    const next = Math.min(Math.max(index + dir, 0), TESTIMONIALS.length - 1);
    setIndex(next);
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  return (
    <section className="w-full bg-[#5072A7] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-center lg:gap-14">
        {/* Left: title + controls */}
        <div className="text-white">
          <Quote className="h-10 w-10 fill-white/90 text-white/90" />
          <h2
            className="font-dm-sans mt-4 font-extrabold text-white"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1.1 }}
          >
            What our customers say
          </h2>

          <div className="mt-8 hidden items-center gap-3 lg:flex">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => scrollByCard(-1)}
              disabled={index === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5072A7] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => scrollByCard(1)}
              disabled={index === TESTIMONIALS.length - 1}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5072A7] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right: card track */}
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white shadow-lg sm:w-[300px]"
            >
              <img src={t.avatar} alt={t.name} className="h-40 w-full object-cover" />
              <div className="flex flex-1 flex-col p-5">
                <p className="font-dm-sans font-semibold text-black" style={{ letterSpacing: '-0.02em' }}>
                  {t.name}
                </p>
                <p className="font-inter mt-0.5 text-xs text-black/50">{t.role}</p>
                <div className="mt-2">
                  <StarRow />
                </div>
                <p className="font-inter mt-3 flex-1 text-sm text-black/70" style={{ lineHeight: 1.5, letterSpacing: '-0.01em' }}>
                  {t.quote}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center justify-center gap-3 lg:hidden">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => scrollByCard(-1)}
            disabled={index === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5072A7] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => scrollByCard(1)}
            disabled={index === TESTIMONIALS.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5072A7] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
