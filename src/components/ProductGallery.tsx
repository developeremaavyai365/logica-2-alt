import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/** How many tiles the grid shows. With more photos than this, the last tile
 *  is a "+N" button that opens the viewer on it. */
const GRID_TILES = 5;

function useWide() {
  const query = '(min-width: 640px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setWide(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return wide;
}

/** Full-screen photo viewer: arrows, thumbnails, and the keyboard
 *  (left / right / Escape). */
function Viewer({ images, alt, start, onClose }: { images: string[]; alt: string; start: number; onClose: () => void }) {
  const [at, setAt] = useState(start);
  const step = (by: number) => setAt((i) => (i + by + images.length) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setAt((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setAt((i) => (i - 1 + images.length) % images.length);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [images.length, onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${alt}: photos`} className="fixed inset-0 z-[100] flex flex-col bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-shop-line px-4 py-3 sm:px-6">
        <p className="min-w-0 truncate text-sm font-medium text-shop-ink">{alt}</p>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs tabular-nums text-shop-ink/50">
            {at + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photos"
            autoFocus
            className="flex h-10 w-10 items-center justify-center rounded-full border border-shop-line text-shop-ink transition-colors hover:border-shop-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-shop-canvas p-6 sm:p-12">
        <img key={images[at]} src={images[at]} alt={`${alt}, photo ${at + 1}`} className="h-full w-full object-contain mix-blend-multiply" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-shop-line bg-white text-shop-ink shadow-sm transition-colors hover:border-shop-ink sm:left-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-shop-line bg-white text-shop-ink shadow-sm transition-colors hover:border-shop-ink sm:right-6"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto border-t border-shop-line p-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Photo ${i + 1}`}
              aria-current={at === i}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-shop-canvas transition-colors ${
                at === i ? 'border-shop-ink' : 'border-transparent hover:border-shop-line'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

/** The product photos laid out as a two-column grid of large tiles (a
 *  swipeable strip on phones). Any photo opens the full-screen viewer.
 *  `corner` (wishlist, share) sits on the first photo. */
export default function ProductGallery({
  images,
  alt,
  productId,
  corner,
}: {
  images: string[];
  alt: string;
  productId: string;
  corner?: ReactNode;
}) {
  const wide = useWide();
  const [viewing, setViewing] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setViewing(null), []);

  const overflow = images.length > GRID_TILES;
  const tiles = overflow ? images.slice(0, GRID_TILES) : images;
  const hidden = images.length - (GRID_TILES - 1);

  const photo = (src: string, i: number) => (
    <motion.img
      layoutId={i === 0 ? `product-photo-${productId}` : undefined}
      src={src}
      alt={i === 0 ? alt : `${alt}, photo ${i + 1}`}
      loading={i < 2 ? 'eager' : 'lazy'}
      className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
    />
  );

  return (
    <>
      {wide ? (
        <div className={`grid gap-3 ${tiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {tiles.map((src, i) => {
            const more = overflow && i === GRID_TILES - 1;
            return (
              <div key={src} className="relative">
                <button
                  type="button"
                  onClick={() => setViewing(i)}
                  aria-label={more ? `See all ${images.length} photos` : `Open photo ${i + 1}`}
                  className={`group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-shop-canvas ${
                    tiles.length === 1 ? 'aspect-[4/3] p-4' : 'aspect-square p-2'
                  }`}
                >
                  {photo(src, i)}
                  {more && (
                    <span className="absolute inset-0 flex items-center justify-center bg-shop-ink/55 font-dm-sans text-3xl font-bold text-white backdrop-blur-[2px]">
                      +{hidden}
                    </span>
                  )}
                </button>
                {i === 0 && corner && <div className="absolute right-3 top-3 flex flex-col gap-2">{corner}</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative">
          <div
            ref={strip}
            onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
            className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-shop-canvas [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setViewing(i)}
                aria-label={`Open photo ${i + 1}`}
                className="group flex aspect-square w-full shrink-0 snap-center items-center justify-center p-2"
              >
                {photo(src, i)}
              </button>
            ))}
          </div>
          {corner && <div className="absolute right-3 top-3 flex flex-col gap-2">{corner}</div>}
          {images.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
              {images.map((src, i) => (
                <span key={src} className={`h-1.5 rounded-full transition-all ${slide === i ? 'w-5 bg-shop-ink' : 'w-1.5 bg-shop-ink/20'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {viewing !== null && <Viewer images={images} alt={alt} start={viewing} onClose={close} />}
    </>
  );
}
