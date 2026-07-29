import { useRef, useState } from 'react';
import { Star, ImagePlus, X, Check } from 'lucide-react';
import { useProductReviews } from '../reviews-store';

const MAX_PHOTOS = 4;

function StarRow({ rating, size = 'w-4 h-4' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={size} fill={n <= rating ? '#FFC107' : 'none'} stroke={n <= rating ? '#FFC107' : '#C8C8C8'} />
      ))}
    </div>
  );
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          className="p-0.5"
        >
          <Star className="w-7 h-7 transition-colors" fill={n <= shown ? '#FFC107' : 'none'} stroke={n <= shown ? '#FFC107' : '#C8C8C8'} />
        </button>
      ))}
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { reviews, addReview } = useProductReviews(productId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, remaining);
    const dataUrls = await Promise.all(picked.map(readAsDataUrl));
    setPhotos((prev) => [...prev, ...dataUrls]);
  }

  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!text.trim()) {
      setError('Please write a short review.');
      return;
    }
    setError('');
    addReview({ name, rating, text, photos });
    setName('');
    setRating(0);
    setText('');
    setPhotos([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <div className="mt-20 border-t border-[#1f2a1d]/10 pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-semibold text-[#1f2a1d]">Ratings &amp; Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRow rating={Math.round(average)} size="w-5 h-5" />
            <span className="text-sm text-[#4b5b47]">
              {average.toFixed(1)} out of 5 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Write a review */}
      <form onSubmit={handleSubmit} className="rounded-2xl bg-[#f4f8f3] p-5 sm:p-6 mb-10">
        <h3 className="text-sm font-semibold text-[#1f2a1d] mb-4">Share your experience</h3>

        <div className="mb-4">
          <label className="block text-xs font-medium text-[#4b5b47] mb-2">Your rating</label>
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        <div className="mb-4">
          <label htmlFor="review-name" className="block text-xs font-medium text-[#4b5b47] mb-1.5">
            Your name (optional)
          </label>
          <input
            id="review-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full h-11 px-3 rounded-lg border border-[#1f2a1d]/15 bg-white text-sm text-[#1f2a1d] outline-none focus:border-[#1f2a1d]/40 transition-colors"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="review-text" className="block text-xs font-medium text-[#4b5b47] mb-1.5">
            Your review
          </label>
          <textarea
            id="review-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How was the product you received? Quality, packaging, delivery..."
            className="w-full px-3 py-2.5 rounded-lg border border-[#1f2a1d]/15 bg-white text-sm text-[#1f2a1d] outline-none focus:border-[#1f2a1d]/40 transition-colors resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-[#4b5b47] mb-1.5">Photos of the product you received</label>
          <div className="flex flex-wrap gap-2.5">
            {photos.map((p, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#1f2a1d]/15">
                <img src={p} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove photo"
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-[#1f2a1d]/20 flex flex-col items-center justify-center gap-0.5 text-[#4b5b47] hover:border-[#1f2a1d]/40 hover:text-[#1f2a1d] transition-colors"
              >
                <ImagePlus className="w-4 h-4" />
                <span className="text-[9px]">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          className="btn-liquid border-2 border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          {submitted ? (
            <span className="inline-flex items-center gap-1.5">
              Submitted <Check className="w-4 h-4" />
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-[#4b5b47]">No reviews yet — be the first to share your experience.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-[#1f2a1d]/10 pb-6 last:border-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[#1f2a1d] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                    {r.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1f2a1d]">{r.name}</p>
                    <StarRow rating={r.rating} />
                  </div>
                </div>
                <span className="text-xs text-[#4b5b47]/60">
                  {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {r.text && <p className="mt-3 text-sm text-[#4b5b47] leading-relaxed">{r.text}</p>}
              {r.photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {r.photos.map((p, i) => (
                    <a key={i} href={p} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-[#1f2a1d]/15">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
