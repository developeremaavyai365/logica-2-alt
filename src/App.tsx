import { Routes, Route } from 'react-router-dom';
import { LayoutGroup } from 'framer-motion';
import Home from './pages/Home';
import Shop from './pages/Shop';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import About from './pages/About';
import BoardOfDirectors from './pages/about/BoardOfDirectors';
import Committees from './pages/about/Committees';
import OrgChart from './pages/about/OrgChart';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Media from './pages/Media';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import InvestorHub from './pages/investor/InvestorHub';
import InvestorSection from './pages/investor/InvestorSection';
import NotFound from './pages/NotFound';
import FeedbackWidget from './components/FeedbackWidget';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <LayoutGroup>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/board-of-directors-and-kmp" element={<BoardOfDirectors />} />
        <Route path="/about/composition-of-committees" element={<Committees />} />
        <Route path="/about/organization-chart" element={<OrgChart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/media" element={<Media />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/investor" element={<InvestorHub />} />
        <Route path="/investor/:slug" element={<InvestorSection />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FeedbackWidget />
      <ChatWidget />
    </LayoutGroup>
  );
}

export default App;
