import { useRef, useState, type ReactNode } from 'react';
import { Star, ImagePlus, X, Check } from 'lucide-react';
import { useProductReviews } from '../reviews-store';
import SectionHeading from './shop/SectionHeading';

const MAX_PHOTOS = 4;

const MICRO_LABEL = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';
const FIELD =
  'w-full rounded-xl border border-shop-line bg-shop-canvas px-3.5 text-sm text-shop-ink outline-none transition-colors placeholder:text-shop-ink/35 focus:border-shop-accent focus:bg-white';

function StarRow({ rating, size = 'w-4 h-4' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
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

/** A card in the shop's modular language: header strip over content. */
function Card({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-shop-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-shop-line px-5 py-2.5">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink">{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  );
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
  // How many reviews gave each star rating, 5 down to 1 — counted from the
  // reviews themselves.
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

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
    <div className="mt-14">
      <SectionHeading className="mb-5">
        Ratings <span className="text-shop-accent">&amp;</span> reviews
      </SectionHeading>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left column — summary + write a review */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          {/* Summary card */}
          <Card
            title="Summary"
            aside={
              <span className="font-mono text-[11px] tabular-nums text-shop-ink/45">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            }
          >
            {reviews.length === 0 ? (
              <p className="px-5 py-6 text-sm text-shop-ink/55">No ratings yet for this product.</p>
            ) : (
              <div className="flex items-stretch">
                {/* Module — average */}
                <div className="flex w-36 shrink-0 flex-col items-center justify-center border-r border-shop-line px-4 py-5">
                  <span className="font-dm-sans text-5xl font-bold tabular-nums leading-none text-shop-ink" style={{ letterSpacing: '-0.04em' }}>
                    {average.toFixed(1)}
                  </span>
                  <div className="mt-2">
                    <StarRow rating={Math.round(average)} />
                  </div>
                  <span className={`mt-1.5 ${MICRO_LABEL}`}>out of 5</span>
                </div>

                {/* Module — breakdown */}
                <ul className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-5 py-4">
                  {breakdown.map(({ stars, count }) => (
                    <li key={stars} className="flex items-center gap-2.5">
                      <span className="w-3 shrink-0 font-mono text-[11px] tabular-nums text-shop-ink/60">{stars}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-shop-canvas">
                        <span
                          className="block h-full rounded-full bg-shop-accent"
                          style={{ width: `${(count / reviews.length) * 100}%` }}
                        />
                      </span>
                      <span className="w-5 shrink-0 text-right font-mono text-[11px] tabular-nums text-shop-ink/45">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Write a review card */}
          <form onSubmit={handleSubmit}>
            <Card title="Write a review">
              {/* Module — rating */}
              <div className="px-5 py-4">
                <span className={`block ${MICRO_LABEL}`}>Your rating</span>
                <div className="mt-1.5">
                  <StarRatingInput value={rating} onChange={setRating} />
                </div>
              </div>

              {/* Module — name + review */}
              <div className="space-y-4 border-t border-shop-line px-5 py-4">
                <div>
                  <label htmlFor="review-name" className={`block ${MICRO_LABEL}`}>
                    Your name (optional)
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={`mt-1.5 h-11 ${FIELD}`}
                  />
                </div>
                <div>
                  <label htmlFor="review-text" className={`block ${MICRO_LABEL}`}>
                    Your review
                  </label>
                  <textarea
                    id="review-text"
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="How was the product you received? Quality, packaging, delivery..."
                    className={`mt-1.5 resize-none py-2.5 ${FIELD}`}
                  />
                </div>
              </div>

              {/* Module — photos */}
              <div className="border-t border-shop-line px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className={MICRO_LABEL}>Photos of the product you received</span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-shop-ink/45">
                    {photos.length} / {MAX_PHOTOS}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2.5">
                  {photos.map((p, i) => (
                    <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-shop-line">
                      <img src={p} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        aria-label="Remove photo"
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-shop-ink/25 bg-shop-canvas text-shop-ink/55 transition-colors hover:border-shop-accent hover:text-shop-accent"
                    >
                      <ImagePlus className="h-4 w-4" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em]">Add</span>
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

              {/* Module — submit row */}
              <div className="border-t border-shop-line p-3">
                {error && <p className="mb-2 px-2 text-xs font-medium text-red-600">{error}</p>}
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-shop-ink text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
                >
                  {submitted ? (
                    <>
                      Submitted <Check className="h-4 w-4" />
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </Card>
          </form>
        </div>

        {/* Right column — the reviews */}
        <div className="lg:col-span-7">
          {reviews.length === 0 ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-shop-ink/20 bg-white px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-shop-canvas">
                <Star className="h-5 w-5 text-shop-ink/40" />
              </span>
              <p className="mt-3 text-sm font-semibold text-shop-ink">No reviews yet</p>
              <p className="mt-1 text-sm text-shop-ink/55">Be the first to share your experience.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {reviews.map((r) => (
                <li key={r.id} className="overflow-hidden rounded-2xl border border-shop-line bg-white">
                  {/* Module — header strip: who and when */}
                  <div className="flex items-center justify-between gap-3 border-b border-shop-line px-5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-shop-ink text-xs font-semibold text-white">
                        {r.name.slice(0, 1).toUpperCase()}
                      </span>
                      <p className="truncate text-sm font-semibold text-shop-ink">{r.name}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-shop-ink/45">
                      {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Module — rating + text */}
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <StarRow rating={r.rating} />
                      <span className="font-mono text-[11px] tabular-nums text-shop-ink/45">{r.rating}.0</span>
                    </div>
                    {r.text && <p className="mt-2.5 text-sm leading-relaxed text-shop-ink/75">{r.text}</p>}
                  </div>

                  {/* Module — photos */}
                  {r.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 border-t border-shop-line px-5 py-3">
                      {r.photos.map((p, i) => (
                        <a
                          key={i}
                          href={p}
                          target="_blank"
                          rel="noreferrer"
                          className="block h-16 w-16 overflow-hidden rounded-xl border border-shop-line transition-colors hover:border-shop-ink/40"
                        >
                          <img src={p} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
