import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ProductGallery({ images, alt, productId }: { images: string[]; alt: string; productId: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image — horizontal display */}
      <div className="w-full rounded-2xl bg-[#f0f0f0] aspect-[4/3] flex items-center justify-center overflow-hidden">
        <motion.img
          key={current}
          layoutId={active === 0 ? `product-photo-${productId}` : undefined}
          src={current}
          alt={alt}
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>

      {/* Angle thumbnail cards — row below the main image */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View angle ${i + 1}`}
              className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#f0f0f0] border-2 transition-colors ${
                active === i ? 'border-[#000000]' : 'border-transparent hover:border-[#000000]/30'
              }`}
            >
              <img src={src} alt={`${alt} — angle ${i + 1}`} className="w-full h-full object-contain mix-blend-multiply p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
