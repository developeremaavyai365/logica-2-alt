import { Link } from 'react-router-dom';
import { categories, products } from '../data';

const QUICK_LINKS = categories.slice(0, 6);

/** Some categories in the scraped catalog (notably "accessories") have a
 *  handful of mistagged products mixed in with the genuine ones — pin
 *  those to a known-correct product instead of trusting first-match order. */
const CATEGORY_IMAGE_OVERRIDE: Record<string, string> = {
  accessories: 'zebronics-k35-wired-usb-multi-device-keyboard-black',
};

/** A real catalog product image per category — picks the first in-stock
 *  product for that category slug instead of a generic lifestyle photo. */
function categoryImage(slug: string): string {
  const overrideId = CATEGORY_IMAGE_OVERRIDE[slug];
  const override = overrideId ? products.find((p) => p.id === overrideId) : undefined;
  const match = override ?? products.find((p) => p.category === slug && p.inStock) ?? products.find((p) => p.category === slug);
  return match?.image ?? '/lifestyle/laptops.jpg';
}

/* Six category tiles, straight across.

   There were a previous/next pair and a rule under the row: two buttons with
   no handler and nothing wired to them, so they rendered and hovered and did
   nothing. All six tiles fit on one line at every width, so there was never
   anything to page through. Both are gone, and the padding they were
   incidentally providing at the foot is now set on the section itself. */
export default function QuickLinksRow() {
  return (
    <section className="w-full bg-white px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-x-4 gap-y-8 sm:flex sm:items-start sm:justify-center sm:gap-8 lg:gap-14">
        {QUICK_LINKS.map((c) => (
          <Link key={c.slug} to={`/shop/${c.slug}`} className="group flex shrink-0 flex-col items-center gap-3 text-center">
            <img
              src={categoryImage(c.slug)}
              alt={c.name}
              className="h-[130px] w-[130px] object-contain transition-transform duration-300 group-hover:scale-105 sm:h-[160px] sm:w-[160px]"
            />
            <span className="font-inter text-sm font-bold text-black sm:text-base" style={{ letterSpacing: '-0.01em' }}>
              {c.name}
            </span>
          </Link>
        ))}
      </div>

    </section>
  );
}
