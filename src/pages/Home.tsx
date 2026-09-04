import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroVideo from '../components/HeroVideo';
import BrandStrip from '../components/BrandStrip';
import CompanyStorySection from '../components/CompanyStorySection';
import BrandMarkSection from '../components/BrandMarkSection';
import StatsSection from '../components/StatsSection';
import RegisteredOfficesVideo from '../components/RegisteredOfficesVideo';
import FinancialHighlights from '../components/FinancialHighlights';
import CareersSection from '../components/CareersSection';
import WorkWithUs from '../components/WorkWithUs';
import OrderTypes from '../components/OrderTypes';

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
      {/* The counting stats, now anchored to the four verticals just shown. */}
      <StatsSection />
      <RegisteredOfficesVideo />
      {/* Straight off the offices film into the numbers behind them. */}
      <FinancialHighlights />
      {/* Then the people side: the invitation, and the film over it. */}
      <CareersSection />
      <WorkWithUs />

      <BrandStrip />
      {/* Corporate, educational and the foundation close the page. */}
      <OrderTypes />
      <Footer />
    </div>
  );
}
