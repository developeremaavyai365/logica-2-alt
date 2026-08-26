import Header from '../components/Header';
import Footer from '../components/Footer';
import ShopBrowser from '../components/shop/ShopBrowser';
import QuickLinksRow from '../components/QuickLinksRow';
import CategorySpotlight from '../components/CategorySpotlight';
import VideoShowcase from '../components/VideoShowcase';
import BestsellerDeals from '../components/BestsellerDeals';
import { products } from '../data';

const APPLE = products.filter((p) => p.brand === 'Apple').slice(0, 10);
const SAMSUNG = products.filter((p) => p.brand === 'Samsung').slice(0, 10);

export default function Shop() {
  return (
    <div className="w-full">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <VideoShowcase
        video="/videos/samsung-galaxy-z-fold8-hero.mp4"
        ctaLabel="Shop Now"
        ctaHref="/shop/mobile-phones"
        fullScreen
      />

      <div className="w-full divide-y divide-black/10 bg-white">
        <QuickLinksRow />
      </div>

      {/* ================= ALL PRODUCTS ================= */}
      <div className="w-full bg-[#ECEDEC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16">
          <h2 className="text-xl font-semibold text-[#000000] mb-6">All products</h2>
          <ShopBrowser
            products={products}
            accent="#000000"
            interstitials={[
              {
                afterCount: 8,
                node: (
                  <CategorySpotlight
                    title="Best Of Samsung"
                    description="Save up to ₹8,000 instantly on eligible Galaxy devices using ICICI, HDFC & SBI Bank Credit Cards. Exchange bonus available on select models."
                    emiNote="No Cost EMI Available"
                    viewAllHref="/shop?brand=Samsung"
                    products={SAMSUNG}
                  />
                ),
              },
              { afterCount: 14, node: <BestsellerDeals /> },
              {
                afterCount: 20,
                node: (
                  <CategorySpotlight
                    title="Best Of Apple"
                    description="Save up to ₹10,000 instantly on eligible products using ICICI, AXIS & SBI Bank Credit Cards. Exchange bonus upto ₹6,000 on iPhone."
                    emiNote="No Cost EMI Available"
                    viewAllHref="/shop?brand=Apple"
                    products={APPLE}
                  />
                ),
              },
            ]}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
