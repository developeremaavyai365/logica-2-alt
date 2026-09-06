import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroVideo from '../components/HeroVideo';
import CompanyStorySection from '../components/CompanyStorySection';
import BrandMarkSection from '../components/BrandMarkSection';
import ChannelPartners from '../components/ChannelPartners';
import StatsSection from '../components/StatsSection';
import RetailBrands from '../components/RetailBrands';
import RegisteredOfficesVideo from '../components/RegisteredOfficesVideo';
import FinancialHighlights from '../components/FinancialHighlights';
import WorkWithUs from '../components/WorkWithUs';
import PhilosophySection from '../components/PhilosophySection';
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
      {/* Who the four verticals sell through, as a short strip rather than a
          section of its own. */}
      <ChannelPartners />
      {/* The counting stats, now anchored to the four verticals just shown. */}
      <StatsSection />
      {/* The brands behind the counters those figures count. */}
      <RetailBrands />
      <RegisteredOfficesVideo />
      {/* Straight off the offices film into the numbers behind them. */}
      <FinancialHighlights />
      {/* Then the people side: one full-screen film carrying the invitation,
          and what the company says it is for underneath it. */}
      <WorkWithUs />
      <PhilosophySection />

      {/* Corporate, educational and the foundation close the page. */}
      <OrderTypes />
      <Footer />
    </div>
  );
}
