import PromoCarouselBanner, { type PromoSlide } from './PromoCarouselBanner';

const WIDE_SLIDES: PromoSlide[] = [
  {
    image: '/lifestyle/mobile-phones.jpg',
    headline: 'realme 16x 5G',
    subtext: 'Launch offer — big battery, brighter display, faster charging.',
    priceLine: 'Starting ₹12,999*',
    ctaLabel: 'Buy Now',
    ctaHref: '/shop/mobile-phones',
    tncNote: '*T&C Apply',
  },
];

const N6X_SLIDES: PromoSlide[] = [
  {
    image: '/lifestyle/mobile-phones.jpg',
    headline: 'OnePlus N6x',
    subtext: 'Smooth performance, all-day battery.',
    priceLine: 'Starting ₹15,999*',
    ctaLabel: 'Shop Now',
    ctaHref: '/shop/mobile-phones',
    tncNote: '*T&C Apply',
  },
];

const N6_SLIDES: PromoSlide[] = [
  {
    image: '/lifestyle/mobile-phones.jpg',
    headline: 'OnePlus N6',
    subtext: 'Flagship features, everyday price.',
    priceLine: 'Starting ₹18,999*',
    ctaLabel: 'Shop Now',
    ctaHref: '/shop/mobile-phones',
    tncNote: '*T&C Apply',
  },
];

export default function PromoBannerSection() {
  return (
    <section className="bg-white px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
      <PromoCarouselBanner slides={WIDE_SLIDES} />

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <PromoCarouselBanner slides={N6X_SLIDES} aspect="640/340" />
        <PromoCarouselBanner slides={N6_SLIDES} aspect="640/340" />
      </div>
    </section>
  );
}
