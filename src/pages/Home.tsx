import Footer from '../components/Footer';
import LogicaHero from '../components/LogicaHero';
import CategoryGrid from '../components/CategoryGrid';
import NewArrivalSpotlight from '../components/NewArrivalSpotlight';
import FeaturedProducts from '../components/FeaturedProducts';
import TrustBand from '../components/TrustBand';
import ClosingBanner from '../components/ClosingBanner';
import ContactFormSection from '../components/ContactFormSection';

export default function Home() {
  return (
    <div className="w-full">
      <LogicaHero />
      <CategoryGrid />
      <NewArrivalSpotlight />
      <FeaturedProducts />
      <TrustBand />
      <ClosingBanner />
      <ContactFormSection />
      <Footer />
    </div>
  );
}
