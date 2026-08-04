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
    <div className="parallax w-full">
      <div className="parallax__group">
        <div className="parallax__layer">
          <LogicaHero />
        </div>
      </div>

      <div className="parallax__group">
        <div className="parallax__layer parallax__layer--near">
          <CategoryGrid />
        </div>
      </div>

      <div className="parallax__group">
        <div className="parallax__layer parallax__layer--far">
          <NewArrivalSpotlight />
        </div>
      </div>

      <div className="parallax__group">
        <div className="parallax__layer parallax__layer--near">
          <FeaturedProducts />
        </div>
      </div>

      <div className="parallax__group">
        <div className="parallax__layer parallax__layer--far">
          <TrustBand />
        </div>
      </div>

      <div className="parallax__group">
        <div className="parallax__layer parallax__layer--near">
          <ClosingBanner />
        </div>
      </div>

      <div className="parallax__group">
        <div className="parallax__layer parallax__layer--far">
          <ContactFormSection />
        </div>
      </div>

      <div className="parallax__group">
        <div className="parallax__layer">
          <Footer />
        </div>
      </div>
    </div>
  );
}
