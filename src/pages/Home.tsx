import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroCarousel from '../components/HeroCarousel';
import QuickLinksRow from '../components/QuickLinksRow';
import NewArrivalSpotlight from '../components/NewArrivalSpotlight';
import CategorySpotlight from '../components/CategorySpotlight';
import VideoShowcase from '../components/VideoShowcase';
import BestsellerDeals from '../components/BestsellerDeals';
import BrandStrip from '../components/BrandStrip';
import LoyaltyCard from '../components/LoyaltyCard';
import TrustBand from '../components/TrustBand';
import CompanyStorySection from '../components/CompanyStorySection';
import RegisteredOfficesVideo from '../components/RegisteredOfficesVideo';
import CompanyReels from '../components/CompanyReels';
import Testimonials from '../components/Testimonials';
import { products } from '../data';

const APPLE = products.filter((p) => p.brand === 'Apple').slice(0, 10);
const SAMSUNG = products.filter((p) => p.brand === 'Samsung').slice(0, 10);

export default function Home() {
  return (
    <div className="w-full divide-y divide-black/10">
      <Header />

      <div className="flex w-full items-stretch">
        <HeroCarousel />
      </div>

      {/* Company identity — who Logica Infoway is, before the shop starts. */}
      <CompanyStorySection />
      <CompanyReels />
      <RegisteredOfficesVideo />

      {/* Shopping experience below the company introduction. */}
      <CategorySpotlight
        title="Best Of Samsung"
        description="Save up to ₹8,000 instantly on eligible Galaxy devices using ICICI, HDFC & SBI Bank Credit Cards. Exchange bonus available on select models."
        emiNote="No Cost EMI Available"
        viewAllHref="/shop?brand=Samsung"
        products={SAMSUNG}
      />

      <VideoShowcase
        video="/videos/samsung-galaxy-z-fold8-hero.mp4"
        ctaLabel="Shop Now"
        ctaHref="/shop/mobile-phones"
      />

      {/* New Launch segment — kept exactly as-is, untouched. */}
      <NewArrivalSpotlight />

      <BestsellerDeals />

      <QuickLinksRow />

      <CategorySpotlight
        title="Best Of Apple"
        description="Save up to ₹10,000 instantly on eligible products using ICICI, AXIS & SBI Bank Credit Cards. Exchange bonus upto ₹6,000 on iPhone."
        emiNote="No Cost EMI Available"
        viewAllHref="/shop?brand=Apple"
        products={APPLE}
      />

      <VideoShowcase
        video="/videos/laptops-showcase.mp4"
        eyebrow="Logica Infoway"
        headline="Power that keeps up with your business"
        subtext="Genuine laptops, enterprise pricing, backed by three decades of delivery."
        ctaLabel="Shop Now"
        ctaHref="/shop/laptops"
      />

      <BrandStrip />
      <Testimonials />
      <TrustBand />
      <LoyaltyCard />
      <Footer />
    </div>
  );
}
