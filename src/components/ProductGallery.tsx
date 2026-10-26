import { useState } from 'react';
import { motion } from 'framer-motion';

/** The product photos as one card: the main image and, below it, a strip of
 *  angle thumbnails. */
export default function ProductGallery({ images, alt, productId }: { images: string[]; alt: string; productId: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-shop-line bg-white">
      {/* Module — main image */}
      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-shop-canvas p-6 sm:p-8">
        <motion.img
          key={current}
          layoutId={active === 0 ? `product-photo-${productId}` : undefined}
          src={current}
          alt={alt}
          className="h-full w-full object-contain mix-blend-multiply"
        />
      </div>

      {/* Module — angle thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t border-shop-line p-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View angle ${i + 1}`}
              aria-pressed={active === i}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-shop-canvas transition-colors sm:h-20 sm:w-20 ${
                active === i ? 'border-shop-ink' : 'border-shop-line hover:border-shop-ink/40'
              }`}
            >
              <img src={src} alt={`${alt} — angle ${i + 1}`} className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
