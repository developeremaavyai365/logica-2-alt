import { useMemo } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShopBrowser from '../components/shop/ShopBrowser';
import { categories, products } from '../data';
import { CATEGORY_FILTER_ACCENT } from '../shop-facets';

export default function CategoryPage() {
  const { category: slug } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const subKeyword = searchParams.get('sub')?.trim();

  const category = categories.find((c) => c.slug === slug);
  const allInCategory = useMemo(() => products.filter((p) => p.category === slug), [slug]);

  // Narrow by the mega-menu's `?sub=` keyword only when it actually matches
  // something — otherwise fall back to the full category rather than a
  // confusing empty page (mirrors the source site's behavior).
  const { categoryProducts, subLabel } = useMemo(() => {
    if (!subKeyword) return { categoryProducts: allInCategory, subLabel: undefined as string | undefined };
    const matched = allInCategory.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(subKeyword.toLowerCase()));
    return matched.length > 0
      ? { categoryProducts: matched, subLabel: subKeyword }
      : { categoryProducts: allInCategory, subLabel: undefined };
  }, [allInCategory, subKeyword]);

  if (!category) {
    return <Navigate to="/shop" replace />;
  }

  const Icon = category.icon;
  const accent = CATEGORY_FILTER_ACCENT[category.slug] ?? '#000000';

  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-6 pb-14">
          <Link to="/shop" className="text-xs font-medium text-black hover:opacity-80 transition-opacity">
            ← All categories
          </Link>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-[#000000]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
                {subLabel ? `${category.name} · ${subLabel}` : category.name}
              </h1>
              <p className="mt-1 text-black text-sm font-medium">{category.tagline}</p>
            </div>
          </div>
          <p className="mt-5 text-[#6b6b6b] text-sm sm:text-base leading-relaxed max-w-2xl">
            {category.description}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10">
        <ShopBrowser products={categoryProducts} accent={accent} />
      </div>

      <Footer />
    </div>
  );
}
