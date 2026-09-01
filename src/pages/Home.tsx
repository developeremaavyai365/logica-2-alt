import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroVideo from '../components/HeroVideo';
import NewArrivalSpotlight from '../components/NewArrivalSpotlight';
import BrandStrip from '../components/BrandStrip';
import LoyaltyCard from '../components/LoyaltyCard';
import TrustBand from '../components/TrustBand';
import CompanyStorySection from '../components/CompanyStorySection';
import BrandMarkSection from '../components/BrandMarkSection';
import BuyingJourney from '../components/BuyingJourney';
import RegisteredOfficesVideo from '../components/RegisteredOfficesVideo';
import CompanyReels from '../components/CompanyReels';

export default function Home() {
  return (
    <div className="w-full divide-y divide-black/10">
      <Header />

      <div className="flex w-full items-stretch">
        <HeroVideo />
      </div>

      {/* Company identity — who Logica Infoway is, before the shop starts. */}
      <CompanyStorySection />
      {/* The name signs off the identity block, as on the Trent reference. */}
      <BrandMarkSection />
      <RegisteredOfficesVideo />

      <BrandStrip />
      <NewArrivalSpotlight />
      {/* Having shown the stock, show how it reaches you. */}
      <BuyingJourney />
      <CompanyReels />
      <TrustBand />
      <LoyaltyCard />
      <Footer />
    </div>
  );
}
