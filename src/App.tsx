import { Suspense, lazy } from 'react';
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
// The investor pages pull in investor-data.ts (~70KB of document metadata for
// ~300 filings). Loading them lazily keeps that out of the main bundle, so a
// visitor to the homepage or shop no longer downloads the whole IR dataset.
const InvestorHub = lazy(() => import('./pages/investor/InvestorHub'));
const InvestorSection = lazy(() => import('./pages/investor/InvestorSection'));
const Reg46 = lazy(() => import('./pages/investor/Reg46'));
import AuthorizedPerson from './pages/investor/AuthorizedPerson';
import GrievanceRedressal from './pages/investor/GrievanceRedressal';
import InvestorEmptyPage from './pages/investor/InvestorEmptyPage';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
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
        <Route path="/login" element={<Auth mode="signin" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/investor"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#ECEDEC]" />}>
              <InvestorHub />
            </Suspense>
          }
        />
        <Route path="/authorized-person" element={<AuthorizedPerson />} />
        <Route path="/grievance-redressal" element={<GrievanceRedressal />} />
        <Route
          path="/advertisement"
          element={<InvestorEmptyPage title="Advertisement" message="No advertisements have been published yet." />}
        />
        <Route
          path="/basis-of-allotment"
          element={<InvestorEmptyPage title="Basis Of Allotment" message="No basis of allotment records have been published yet." />}
        />
        {/* Ahead of /investor/:slug — that route matches anything, and would
            otherwise catch this and bounce it back to the hub. */}
        <Route
          path="/investor/reg-46"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#ECEDEC]" />}>
              <Reg46 />
            </Suspense>
          }
        />
        <Route
          path="/investor/:slug"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#ECEDEC]" />}>
              <InvestorSection />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FeedbackWidget />
      <ChatWidget />
    </LayoutGroup>
  );
}

export default App;
