import { useState } from 'react';
import { Play } from 'lucide-react';

interface Reel {
  video: string;
  label: string;
  views: string;
}

// Placeholder reel content built from the project's existing showcase clips —
// swap each `video` for a real company reel once available; `views` are
// mock placeholder counts, not real analytics.
const REELS: Reel[] = [
  { video: '/videos/showcase-true-wireless.mp4', label: 'Unboxing the latest audio drop', views: '1.4K' },
  { video: '/videos/showcase-accessories.mp4', label: 'Inside our accessories wall', views: '881' },
  { video: '/videos/mobile-showcase.mp4', label: 'Flagship phones, launch day', views: '704' },
  { video: '/videos/showcase-monitor.mp4', label: 'Setting up a creator desk', views: '633' },
  { video: '/videos/showcase-desktop-aio.mp4', label: 'A walk through the store floor', views: '594' },
  { video: '/videos/new-product-pc.mp4', label: 'What just landed this week', views: '512' },
];

function ReelCard({ reel }: { reel: Reel }) {
  const [playing, setPlaying] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setPlaying((v) => !v)}
      className="group relative h-[420px] w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl bg-black text-left sm:h-[480px] sm:w-[250px]"
    >
      <video
        src={reel.video}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay={playing}
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

      <span className="font-inter absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {reel.views}
      </span>

      {!playing && (
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black transition-transform group-hover:scale-110">
          <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
        </span>
      )}

      <p className="font-inter absolute inset-x-3 bottom-3 line-clamp-2 text-sm font-medium text-white" style={{ letterSpacing: '-0.01em' }}>
        {reel.label}
      </p>
    </button>
  );
}

export default function CompanyReels() {
  return (
    <section className="w-full bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <h2
        className="font-dm-sans mx-auto max-w-6xl bg-gradient-to-r from-black to-[#15803D] bg-clip-text font-extrabold text-transparent"
        style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', letterSpacing: '-0.04em' }}
      >
        From the Logica Floor
      </h2>
      <p
        className="font-inter mx-auto mt-2 max-w-6xl bg-gradient-to-r from-black to-[#15803D] bg-clip-text text-sm font-extrabold text-transparent sm:text-base"
        style={{ letterSpacing: '-0.01em' }}
      >
        A look inside our stores, launches and everyday work.
      </p>

      <div className="scrollbar-none mx-auto mt-8 flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:gap-5">
        {REELS.map((reel) => (
          <ReelCard key={reel.video} reel={reel} />
        ))}
      </div>
    </section>
  );
}
