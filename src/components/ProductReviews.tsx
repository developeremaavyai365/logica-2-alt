import { useRef, useState, type FormEvent } from 'react';
import { Check, ImagePlus, PenLine, Star, X } from 'lucide-react';
import { useProductReviews } from '../reviews-store';
import SectionHeading from './shop/SectionHeading';

const MAX_PHOTOS = 4;

const LABEL = 'block text-sm font-medium text-shop-ink';
const FIELD =
  'w-full rounded-xl border border-shop-line bg-white px-3.5 text-sm text-shop-ink outline-none transition-colors placeholder:text-shop-ink/35 focus:border-shop-accent';

/** What each star rating means, shown as the shopper picks one. */
const RATING_WORDS = ['', 'Very bad', 'Bad', 'Good', 'Very good', 'Excellent'];


/** The rating as a small coloured chip: "4.5 ★". */
function RatingChip({ rating, large = false }: { rating: number; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-shop-ink font-bold tabular-nums text-white ${
        large ? 'px-3.5 py-1.5 text-2xl' : 'px-2 py-0.5 text-xs'
      }`}
      aria-label={`${rating} out of 5`}
    >
      {Number.isInteger(rating) ? rating : rating.toFixed(1)}
      <Star className={large ? 'h-5 w-5' : 'h-3 w-3'} fill="#FFC107" stroke="#FFC107" />
    </span>
  );
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={value === n}
            className="rounded-md p-0.5 transition-transform hover:scale-110"
          >
            <Star className="h-7 w-7" fill={n <= shown ? '#FFC107' : 'none'} stroke={n <= shown ? '#FFC107' : '#C8C8C8'} />
          </button>
        ))}
      </div>
      {shown > 0 && <span className="text-sm font-medium text-shop-ink/70">{RATING_WORDS[shown]}</span>}
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

  const [writing, setWriting] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [thanks, setThanks] = useState(false);

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  // How many reviews gave each star rating, 5 down to 1.
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: reviews.filter((r) => r.rating === stars).length }));

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const picked = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
    const dataUrls = await Promise.all(picked.map(readAsDataUrl));
    setPhotos((prev) => [...prev, ...dataUrls]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please choose a star rating.');
      return;
    }
    if (!text.trim()) {
      setError('Please write a few words about the product.');
      return;
    }
    setError('');
    addReview({ name, rating, text, photos });
    setName('');
    setRating(0);
    setText('');
    setPhotos([]);
    setWriting(false);
    setThanks(true);
    setTimeout(() => setThanks(false), 3000);
  }

  return (
    <section className="mt-14">
      <SectionHeading className="mb-5">
        Ratings <span className="text-shop-accent">&amp;</span> reviews
      </SectionHeading>
      <div className="overflow-hidden rounded-2xl border border-shop-line bg-white">
      {/* Heading strip, with the summary in a line and the way to add one */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-shop-line px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-dm-sans text-lg font-bold text-shop-ink" style={{ letterSpacing: '-0.02em' }}>
            {reviews.length ? `${reviews.length.toLocaleString('en-IN')} review${reviews.length === 1 ? '' : 's'}` : 'No reviews yet'}
          </h3>
          <p className="mt-0.5 text-sm text-shop-ink/55">
            {reviews.length ? 'What shoppers say about it.' : 'Bought this? Be the first to rate it.'}
          </p>
        </div>
        {!writing && (
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="flex h-10 items-center gap-2 rounded-xl border border-shop-ink px-4 text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-ink hover:text-white"
          >
            <PenLine className="h-4 w-4" />
            Write a review
          </button>
        )}
      </div>

      {thanks && (
        <p className="flex items-center gap-2 border-b border-shop-line bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800 sm:px-6" role="status">
          <Check className="h-4 w-4" /> Thank you, your review is up.
        </p>
      )}

      {/* The form, opened by "Write a review" */}
      {writing && (
        <form onSubmit={handleSubmit} className="border-b border-shop-line bg-shop-canvas/60 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-shop-ink">Write a review</h3>
            <button
              type="button"
              onClick={() => {
                setWriting(false);
                setError('');
              }}
              aria-label="Close the review form"
              className="flex h-9 w-9 items-center justify-center rounded-full text-shop-ink/50 transition-colors hover:bg-white hover:text-shop-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div>
                <span className={LABEL}>How would you rate it?</span>
                <div className="mt-1.5">
                  <StarRatingInput value={rating} onChange={setRating} />
                </div>
              </div>
              <div>
                <label htmlFor="review-name" className={LABEL}>
                  Your name <span className="font-normal text-shop-ink/45">(optional)</span>
                </label>
                <input
                  id="review-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={`mt-1.5 h-11 ${FIELD}`}
                />
              </div>
              <div>
                <span className={LABEL}>
                  Photos of what you received <span className="font-normal text-shop-ink/45">(up to {MAX_PHOTOS})</span>
                </span>
                <div className="mt-1.5 flex flex-wrap gap-2.5">
                  {photos.map((p, i) => (
                    <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-shop-line bg-white">
                      <img src={p} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
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
                      className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-shop-ink/25 bg-white text-shop-ink/55 transition-colors hover:border-shop-accent hover:text-shop-accent"
                    >
                      <ImagePlus className="h-4 w-4" />
                      <span className="text-[11px] font-medium">Add</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    void handleFiles(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="review-text" className={LABEL}>
                Your review
              </label>
              <textarea
                id="review-text"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="How was the product? Quality, packaging, delivery…"
                className={`mt-1.5 flex-1 resize-none py-2.5 ${FIELD}`}
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-shop-ink px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent sm:w-auto"
            >
              Post review
            </button>
          </div>
        </form>
      )}

      {reviews.length > 0 && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          {/* Summary: the average and how the stars are spread */}
          <div className="flex items-center gap-6 border-b border-shop-line px-5 py-5 sm:px-6 lg:flex-col lg:items-start lg:border-b-0 lg:border-r">
            <div className="shrink-0">
              <RatingChip rating={Number(average.toFixed(1))} large />
              <p className="mt-1.5 text-xs text-shop-ink/55">
                out of 5 · {reviews.length} review{reviews.length === 1 ? '' : 's'}
              </p>
            </div>
            <ul className="flex w-full min-w-0 flex-col gap-1.5">
              {breakdown.map(({ stars, count }) => (
                <li key={stars} className="flex items-center gap-2.5 text-xs text-shop-ink/60">
                  <span className="flex w-7 shrink-0 items-center gap-0.5 tabular-nums">
                    {stars}
                    <Star className="h-3 w-3" fill="currentColor" />
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-shop-canvas">
                    <span className="block h-full rounded-full bg-shop-accent" style={{ width: `${(count / reviews.length) * 100}%` }} />
                  </span>
                  <span className="w-6 shrink-0 text-right tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The reviews, newest first */}
          <ul className="divide-y divide-shop-line">
            {reviews.map((r) => (
              <li key={r.id} className="px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <RatingChip rating={r.rating} />
                  <span className="text-sm font-semibold text-shop-ink">{RATING_WORDS[r.rating]}</span>
                </div>
                {r.text && <p className="mt-2 text-sm leading-relaxed text-shop-ink/80">{r.text}</p>}
                {r.photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
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
                <p className="mt-2.5 text-xs text-shop-ink/50">
                  <span className="font-medium text-shop-ink/70">{r.name}</span> ·{' '}
                  {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </section>
  );
}
