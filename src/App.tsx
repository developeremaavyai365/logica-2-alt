import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutGroup } from 'framer-motion';
import Home from './pages/Home';
import Shop from './pages/Shop';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import OpenRoles from './pages/careers/OpenRoles';
import Apply from './pages/careers/Apply';
import RoleDetail from './pages/careers/RoleDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
// The investor pages pull in investor-data.ts (~70KB of document metadata for
// ~300 filings). Loading them lazily keeps that out of the main bundle, so a
// visitor to the homepage or shop no longer downloads the whole IR dataset.
// Every investor address renders the one investor page, which swaps its
// content in place under a shared hero.
const InvestorPage = lazy(() => import('./pages/investor/InvestorPage'));
// Admin-only, so it stays out of the bundle every visitor downloads.
const SapImport = lazy(() => import('./pages/admin/SapImport'));
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import FeedbackWidget from './components/FeedbackWidget';
import ChatWidget from './components/ChatWidget';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <LayoutGroup>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/board-of-directors-and-kmp" element={<About />} />
        <Route path="/about/composition-of-committees" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/careers/open-roles" element={<OpenRoles />} />
        <Route path="/careers/open-roles/:id" element={<RoleDetail />} />
        <Route path="/careers/apply" element={<Apply />} />
        <Route path="/about/media" element={<About />} />
        {/* Media is a tab of About now; keep old links working. */}
        <Route path="/media" element={<Navigate to="/about/media" replace />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route
          path="/admin/sap-import"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#ECEDEC]" />}>
              <SapImport />
            </Suspense>
          }
        />
        <Route path="/login" element={<Auth mode="signin" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {['/investor', '/investor/:slug', '/advertisement', '/basis-of-allotment', '/authorized-person', '/grievance-redressal'].map(
          (path) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<div className="min-h-screen bg-[#F5F8FC]" />}>
                  <InvestorPage />
                </Suspense>
              }
            />
          ),
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FeedbackWidget />
      <ChatWidget />
    </LayoutGroup>
  );
}

export default App;
