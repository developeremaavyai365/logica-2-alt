import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroCarousel from '../components/HeroCarousel';
import NewArrivalSpotlight from '../components/NewArrivalSpotlight';
import BrandStrip from '../components/BrandStrip';
import LoyaltyCard from '../components/LoyaltyCard';
import TrustBand from '../components/TrustBand';
import CompanyStorySection from '../components/CompanyStorySection';
import RegisteredOfficesVideo from '../components/RegisteredOfficesVideo';
import CompanyReels from '../components/CompanyReels';

export default function Home() {
  return (
    <div className="w-full divide-y divide-black/10">
      <Header />

      <div className="flex w-full items-stretch">
        <HeroCarousel />
      </div>

      <NewArrivalSpotlight />

      {/* Company identity — who Logica Infoway is, before the shop starts. */}
      <CompanyStorySection />
      <RegisteredOfficesVideo />

      <BrandStrip />
      <CompanyReels />
      <TrustBand />
      <LoyaltyCard />
      <Footer />
    </div>
  );
}
