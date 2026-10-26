import { useMemo } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, PackageSearch } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShopBrowser from '../components/shop/ShopBrowser';
import { categories, products } from '../data';
import { findSubCategory, subCategoriesOf } from '../nav-data';

const ACCENT = '#3D4FE0';
const MICRO_LABEL = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';

/** A category's own page (/shop/laptops), or — with `?sub=` — one of its
 *  sub-categories (/shop/laptops?sub=macbook), which shows only the products
 *  that belong to that sub-category.
 *
 *  A sub-category with nothing in the catalogue says so, rather than quietly
 *  showing the whole category under its name. */
export default function CategoryPage() {
  const { category: slug } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();

  const category = categories.find((c) => c.slug === slug);
  const subs = useMemo(() => (slug ? subCategoriesOf(slug) : []), [slug]);
  const activeSub = slug ? findSubCategory(slug, searchParams.get('sub')) : undefined;

  const allInCategory = useMemo(() => products.filter((p) => p.category === slug), [slug]);
  const subCounts = useMemo(
    () => new Map(subs.map((s) => [s.keyword, allInCategory.filter((p) => s.test(p.name)).length])),
    [subs, allInCategory],
  );
  const shown = useMemo(
    () => (activeSub ? allInCategory.filter((p) => activeSub.test(p.name)) : allInCategory),
    [allInCategory, activeSub],
  );

  if (!category) {
    return <Navigate to="/shop" replace />;
  }

  const Icon = category.icon;
  const title = activeSub ? activeSub.label : category.name;

  const pill = (active: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
      active
        ? 'border-shop-ink bg-shop-ink text-white'
        : 'border-shop-line bg-white text-shop-ink/75 hover:border-shop-ink/40 hover:text-shop-ink'
    }`;
  const pillCount = (active: boolean) => `font-mono text-[11px] tabular-nums ${active ? 'text-white/60' : 'text-shop-ink/40'}`;

  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-2 overflow-hidden rounded-xl border border-shop-line bg-white px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-shop-ink/45"
        >
          <Link to="/shop" className="shrink-0 transition-colors hover:text-shop-ink">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {activeSub ? (
            <>
              <Link to={`/shop/${category.slug}`} className="shrink-0 transition-colors hover:text-shop-ink">
                {category.name}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="truncate text-shop-ink">{activeSub.label}</span>
            </>
          ) : (
            <span className="truncate text-shop-ink">{category.name}</span>
          )}
        </nav>

        {/* Title card */}
        <div className="overflow-hidden rounded-2xl border border-shop-line bg-white">
          <div className="flex items-stretch">
            <div className="hidden w-20 shrink-0 items-center justify-center border-r border-shop-line bg-shop-canvas sm:flex">
              <Icon className="h-7 w-7 text-shop-ink" />
            </div>
            <div className="min-w-0 flex-1 px-5 py-4">
              <span className={`flex items-center gap-2 ${MICRO_LABEL}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-shop-accent" aria-hidden="true" />
                {activeSub ? category.name : 'Category'}
              </span>
              <h1 className="mt-1 truncate text-2xl font-semibold text-shop-ink sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>
                {title}
              </h1>
              {!activeSub && <p className="mt-1 text-sm text-shop-ink/55">{category.tagline}</p>}
            </div>
            <div className="flex shrink-0 flex-col justify-center border-l border-shop-line px-4 sm:px-5">
              <span className={MICRO_LABEL}>Products</span>
              <span className="mt-0.5 font-mono text-xl font-bold tabular-nums leading-none text-shop-ink">
                {String(shown.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* The category's sub-categories, to move between them in one tap */}
          {subs.length > 0 && (
            <div className="scrollbar-none flex gap-2 overflow-x-auto border-t border-shop-line px-4 py-3">
              <Link to={`/shop/${category.slug}`} className={pill(!activeSub)} aria-current={!activeSub ? 'page' : undefined}>
                All {category.name}
                <span className={pillCount(!activeSub)}>{allInCategory.length}</span>
              </Link>
              {subs.map((s) => {
                const active = activeSub?.keyword === s.keyword;
                return (
                  <Link key={s.keyword} to={s.href} className={pill(active)} aria-current={active ? 'page' : undefined}>
                    {s.label}
                    <span className={pillCount(active)}>{subCounts.get(s.keyword) ?? 0}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-5 sm:px-6">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-shop-ink/20 bg-white px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-shop-canvas">
              <PackageSearch className="h-6 w-6 text-shop-ink/40" />
            </span>
            <p className="mt-4 text-base font-semibold text-shop-ink">No {title} in the store right now</p>
            <p className="mt-1 max-w-sm text-sm text-shop-ink/55">
              Nothing in the catalogue falls under {title} at the moment.
            </p>
            <Link
              to={activeSub ? `/shop/${category.slug}` : '/shop'}
              className="group mt-6 flex h-12 items-center gap-2 rounded-xl bg-shop-ink px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
            >
              {activeSub ? `See all ${category.name}` : 'Back to the shop'}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          // Keyed by the selection, so moving to another category or
          // sub-category starts with a clean search box and filters.
          <ShopBrowser
            key={`${category.slug}:${activeSub?.keyword ?? ''}`}
            products={shown}
            accent={ACCENT}
            lockCategory
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
