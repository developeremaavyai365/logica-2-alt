import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categories as allCategories } from '../data';

gsap.registerPlugin(ScrollTrigger);

// Edit this map to swap the media shown per category — video for a motion
// clip, image for a still. `fit: 'contain'` is for portrait/vertical clips
// (mobile, desktop-AIO, monitor are all 9:16) so they don't get cropped and
// zoomed into a landscape frame; `cover` is for clips already shot 16:9.
const CATEGORY_MEDIA: Record<string, { type: 'video' | 'image'; src: string; fit: 'cover' | 'contain' }> = {
  laptops: { type: 'video', src: '/videos/laptops-showcase.mp4', fit: 'cover' },
  'mobile-phones': { type: 'video', src: '/videos/mobile-showcase.mp4', fit: 'cover' },
  accessories: { type: 'video', src: '/videos/showcase-accessories.mp4', fit: 'cover' },
  desktops: { type: 'video', src: '/videos/showcase-desktop-aio.mp4', fit: 'contain' },
  monitors: { type: 'video', src: '/videos/showcase-monitor.mp4', fit: 'contain' },
  printers: { type: 'video', src: '/videos/printers-showcase.mp4', fit: 'cover' },
  wireless: { type: 'video', src: '/videos/showcase-true-wireless.mp4', fit: 'cover' },
};

// Excluded from this scroll segment only — still shown in Shop, nav, footer.
const EXCLUDED_SLUGS = new Set(['software', 'laptop-bags', 'storage-devices']);
const categories = allCategories.filter((c) => !EXCLUDED_SLUGS.has(c.slug));

// One background tint per category, cycling through the site's own green
// palette (same family as the hero gradient) so the backdrop shifts subtly
// with each scroll instead of staying flat.
const CATEGORY_BG: Record<string, string> = {
  laptops: '#e9f1e8',
  'mobile-phones': '#dbe8d6',
  accessories: '#cde0c7',
  desktops: '#c3d9bf',
  monitors: '#d7e6d4',
  printers: '#e3ede0',
  wireless: '#d0e2cb',
};

// A practical, real-world use-case line per category — shown as a bold,
// two-line heading over the video itself. Line one is plain white, line two
// picks up the category's accent color.
const CATEGORY_USE_CASE: Record<string, { line1: string; line2: string }> = {
  laptops: { line1: 'Built for boardrooms,', line2: 'bootcamps and beyond' },
  'mobile-phones': { line1: 'Stay ahead with', line2: 'the latest 5G mobiles' },
  accessories: { line1: 'Every desk,', line2: 'dialed in and ready' },
  desktops: { line1: 'Power through the', line2: 'workload, every day' },
  monitors: { line1: 'See more,', line2: 'decide faster' },
  printers: { line1: 'From invoices to', line2: 'blueprints, printed right' },
  wireless: { line1: 'Calls that sound', line2: 'as clear as they matter' },
};

// A vivid accent color per category for the second heading line — distinct
// per category so the overlay dynamically shifts color as you scroll.
const CATEGORY_ACCENT: Record<string, string> = {
  laptops: '#85AB8B',
  'mobile-phones': '#7BD1E0',
  accessories: '#F0C36D',
  desktops: '#9FD8A3',
  monitors: '#8FB8E0',
  printers: '#E0A96D',
  wireless: '#B9E0C9',
};

export default function CategoryStickyScroll() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    if (!wrapper || !sticky) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      pin: sticky,
      pinSpacing: false,
      onUpdate: (self) => {
        const index = Math.min(categories.length - 1, Math.floor(self.progress * categories.length));
        setActive(index);
      },
    });

    return () => trigger.kill();
  }, []);

  const bg = CATEGORY_BG[categories[active].slug] ?? '#f4f8f3';

  return (
    <div ref={wrapperRef} className="relative bg-white" style={{ height: `${categories.length * 100}vh` }}>
      <div
        ref={stickyRef}
        className="relative h-screen w-full overflow-hidden transition-colors duration-700"
        style={{ backgroundColor: bg }}
      >
        {categories.map((cat, i) => {
          const media = CATEGORY_MEDIA[cat.slug];
          if (!media) return null;
          const fitClass = media.fit === 'contain' ? 'object-contain' : 'object-cover';
          return (
            <div
              key={cat.slug}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: active === i ? 1 : 0 }}
            >
              {media.fit === 'contain' && media.type === 'video' && (
                <video
                  src={media.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
                />
              )}
              {media.type === 'video' ? (
                <video
                  src={media.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`relative w-full h-full ${fitClass}`}
                />
              ) : (
                <img src={media.src} alt={cat.name} className={`relative w-full h-full ${fitClass}`} />
              )}
            </div>
          );
        })}

        {/* Scrims for text legibility, top and bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/0 to-black/0" />

        {/* Overlaid use-case heading */}
        <div className="absolute left-6 sm:left-10 md:left-14 top-8 sm:top-12 right-6 sm:right-10 md:right-1/3">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight transition-colors duration-700">
            <span className="block text-white">{CATEGORY_USE_CASE[categories[active].slug].line1}</span>
            <span className="block" style={{ color: CATEGORY_ACCENT[categories[active].slug] ?? '#85AB8B' }}>
              {CATEGORY_USE_CASE[categories[active].slug].line2}
            </span>
          </h2>
        </div>

        {/* Overlaid category name + CTA */}
        <div className="absolute left-6 sm:left-10 md:left-14 bottom-8 sm:bottom-12 flex items-center gap-4 sm:gap-6">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white" style={{ letterSpacing: '-0.03em' }}>
            {categories[active].name}
          </h3>
          <Link
            to={`/shop/${categories[active].slug}`}
            className="btn-liquid border-2 border-[#85AB8B] text-white text-xs font-semibold uppercase tracking-wide px-5 py-3 rounded-lg transition-colors"
            style={{ '--liquid': '#85AB8B', '--liquid-ink': '#1f2a1d' } as CSSProperties}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
