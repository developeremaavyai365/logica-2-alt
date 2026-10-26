import Header from '../components/Header';
import Footer from '../components/Footer';
import ShopBrowser from '../components/shop/ShopBrowser';
import { products } from '../data';

export default function Shop() {
  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
        <ShopBrowser products={products} accent="#3D4FE0" />
      </div>

      <Footer />
    </div>
  );
}
