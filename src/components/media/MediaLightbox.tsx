import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxPhoto {
  src: string;
  /** What the photo is of — the entry it belongs to. */
  title: string;
  /** e.g. the date, shown beside the title. */
  meta?: string;
}

/** A full-screen photo viewer: the photo large on a dark backdrop, the
 *  previous/next arrows, a counter, and a strip of thumbnails. Arrow keys,
 *  Escape and swiping work too. Opens on `index`; `onClose` ends it. */
export default function MediaLightbox({
  photos,
  index,
  onClose,
}: {
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  // Which way the last move went, so the new photo slides in from that side.
  const [direction, setDirection] = useState<1 | -1>(1);
  const [shown, setShown] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (step: 1 | -1) => {
      setDirection(step);
      setCurrent((c) => (c + step + photos.length) % photos.length);
    },
    [photos.length],
  );

  // Open: fade in, take focus, hold the page still behind.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      previousFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    const thumb = stripRef.current?.querySelector<HTMLElement>(`[data-thumb="${current}"]`);
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [current]);

  const photo = photos[current];
  if (!photo) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title}, photo ${current + 1} of ${photos.length}`}
      className={`fixed inset-0 z-[100] flex flex-col bg-[#030B1F]/95 backdrop-blur-md transition-opacity duration-300 ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top bar: what this is, where you are, close */}
      <div className="flex items-center justify-between gap-4 px-4 py-4 text-white sm:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-base">{photo.title}</p>
          {photo.meta && <p className="text-xs text-white/55">{photo.meta}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs tabular-nums text-white/75">
            {current + 1} / {photos.length}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* The photo */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        <img
          key={current}
          src={photo.src}
          alt={photo.title}
          className="max-h-full max-w-full rounded-xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] motion-safe:animate-[lightbox-in_0.45s_cubic-bezier(0.22,1,0.36,1)]"
          style={{ ['--from' as string]: `${direction * 40}px` }}
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:left-6"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div ref={stripRef} className="flex justify-start gap-2 overflow-x-auto px-4 py-4 sm:justify-center sm:px-8">
          {photos.map((p, i) => (
            <button
              key={`${p.src}-${i}`}
              type="button"
              data-thumb={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 sm:h-16 sm:w-24 ${
                i === current ? 'opacity-100 ring-2 ring-[#8FAEFF] ring-offset-2 ring-offset-[#030B1F]' : 'opacity-45 hover:opacity-80'
              }`}
            >
              <img src={p.src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
