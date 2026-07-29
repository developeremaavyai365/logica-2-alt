import { useCallback, useEffect, useState } from 'react';

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  photos: string[];
  date: string;
}

const KEY = 'logica2-reviews-v1';

type ReviewsByProduct = Record<string, Review[]>;

function readAll(): ReviewsByProduct {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: ReviewsByProduct) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore write failures (private browsing, quota, etc.)
  }
}

export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>(() => readAll()[productId] ?? []);

  useEffect(() => {
    setReviews(readAll()[productId] ?? []);
  }, [productId]);

  const addReview = useCallback(
    (input: { name: string; rating: number; text: string; photos: string[] }) => {
      const review: Review = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: input.name.trim() || 'Anonymous',
        rating: input.rating,
        text: input.text.trim(),
        photos: input.photos,
        date: new Date().toISOString(),
      };
      const all = readAll();
      const next = [review, ...(all[productId] ?? [])];
      all[productId] = next;
      writeAll(all);
      setReviews(next);
    },
    [productId],
  );

  return { reviews, addReview };
}
