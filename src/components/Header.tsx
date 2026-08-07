import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, LogOut, Menu, Package, ShoppingCart, User, X } from 'lucide-react';
import { useShopStore } from '../store';
import { useAuthStore } from '../auth-store';
import { SHOP_MEGA, ABOUT_MENU, INVESTOR_MEGA } from '../nav-data';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { cartCount, wishlist } = useShopStore();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    setAccountMenuOpen(false);
    navigate('/');
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="relative top-0 left-0 right-0 z-30 flex items-center justify-end gap-3 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6 md:px-10"
      >
        <Link to="/" className="mr-auto flex items-center shrink-0">
          <img src="/logica-logo-shine.png" alt="Logica Infoway" className="h-11 w-auto object-contain sm:h-12 md:h-14" />
        </Link>

        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-[#000000]/10 bg-[#f0f0f0] pl-2 pr-1 py-1 shadow-sm lg:flex">
          <Link to="/" className="text-sm font-medium px-4 py-2.5 rounded-full text-[#6b6b6b] hover:text-[#000000] hover:bg-[#f0f0f0] transition-colors">
            Home
          </Link>

          {/* Shop mega menu */}
          <div className="group relative">
            <Link
              to="/shop"
              className="flex items-center gap-1 text-sm font-medium px-4 py-2.5 rounded-full text-[#6b6b6b] hover:text-[#000000] hover:bg-[#f0f0f0] transition-colors"
            >
              Shop
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-40">
              <div className="w-[46rem] max-w-[90vw] rounded-2xl bg-white shadow-xl border border-[#000000]/10 p-6 grid grid-cols-3 gap-x-6 gap-y-5">
                {SHOP_MEGA.map((cat) => (
                  <div key={cat.href}>
                    <Link to={cat.href} className="text-sm font-semibold text-[#000000] hover:opacity-80 transition-opacity">
                      {cat.label}
                    </Link>
                    {cat.children && (
                      <ul className="mt-2 space-y-1.5">
                        {cat.children.map((child) => (
                          <li key={child.href}>
                            <Link to={child.href} className="text-xs text-[#6b6b6b] hover:text-[#000000] transition-colors">
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* About dropdown */}
          <div className="group relative">
            <Link
              to="/about"
              className="flex items-center gap-1 text-sm font-medium px-4 py-2.5 rounded-full text-[#6b6b6b] hover:text-[#000000] hover:bg-[#f0f0f0] transition-colors"
            >
              About
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            <div className="absolute left-0 top-full pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-40">
              <div className="w-64 rounded-2xl bg-white shadow-xl border border-[#000000]/10 p-3">
                {ABOUT_MENU.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-3 py-2.5 rounded-lg text-sm text-[#000000] hover:bg-[#f0f0f0] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Investor mega menu */}
          <div className="group relative">
            <Link
              to="/investor"
              className="flex items-center gap-1 text-sm font-medium px-4 py-2.5 rounded-full text-[#6b6b6b] hover:text-[#000000] hover:bg-[#f0f0f0] transition-colors"
            >
              Investor
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-40">
              <div className="w-[52rem] max-w-[90vw] rounded-2xl bg-white shadow-xl border border-[#000000]/10 p-6 grid grid-cols-5 gap-x-5 gap-y-4">
                {INVESTOR_MEGA.map((col) => (
                  <div key={col.label}>
                    {col.href ? (
                      <Link to={col.href} className="text-xs font-semibold uppercase tracking-wide text-[#000000] hover:opacity-80 transition-opacity">
                        {col.label}
                      </Link>
                    ) : (
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#000000]">{col.label}</p>
                    )}
                    {col.children && (
                      <ul className="mt-2 space-y-1.5">
                        {col.children.map((child) => {
                          const external = child.href.startsWith('http');
                          return (
                            <li key={child.label}>
                              {external ? (
                                <a href={child.href} target="_blank" rel="noreferrer" className="text-xs text-[#6b6b6b] hover:text-[#000000] transition-colors">
                                  {child.label}
                                </a>
                              ) : (
                                <Link to={child.href} className="text-xs text-[#6b6b6b] hover:text-[#000000] transition-colors">
                                  {child.label}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link to="/media" className="text-sm font-medium px-4 py-2.5 rounded-full text-[#6b6b6b] hover:text-[#000000] hover:bg-[#f0f0f0] transition-colors">
            Media
          </Link>
          <Link to="/careers" className="text-sm font-medium px-4 py-2.5 rounded-full text-[#6b6b6b] hover:text-[#000000] hover:bg-[#f0f0f0] transition-colors">
            Careers
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 bg-[#f0f0f0] rounded-full px-1.5 sm:px-2 py-1.5 shadow-sm border border-[#000000]/10 text-[#000000]">
          <Link
            to="/wishlist"
            className="flex relative items-center justify-center w-8 h-8 rounded-full hover:bg-[#f0f0f0] hover:text-[#000000] transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center" style={{ backgroundColor: '#1f6fa8' }}>
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="flex relative items-center justify-center w-8 h-8 rounded-full hover:bg-[#f0f0f0] hover:text-[#000000] transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center" style={{ backgroundColor: '#1f6fa8' }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Auth: login/sign up links, or account dropdown once signed in */}
        {user ? (
          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-sm font-semibold text-[#000000] shadow-sm border border-[#000000]/10 hover:bg-white transition-colors"
              aria-label="Account menu"
              aria-expanded={accountMenuOpen}
            >
              {(user.name || user.email || '?').slice(0, 1).toUpperCase()}
            </button>
            {accountMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setAccountMenuOpen(false)} />
                <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-[#000000]/10 bg-white p-2 shadow-xl">
                  <div className="px-3 py-2 border-b border-[#000000]/10 mb-1">
                    <p className="text-sm font-semibold text-[#000000] truncate">{user.name || 'My Account'}</p>
                    {user.email && <p className="text-xs text-[#6b6b6b] truncate">{user.email}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#000000] hover:bg-[#f0f0f0] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <Link
                    to="/cart"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#000000] hover:bg-[#f0f0f0] transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    Orders
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1 bg-[#f0f0f0] rounded-full px-1.5 py-1.5 shadow-sm border border-[#000000]/10">
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-2 rounded-full text-[#000000] hover:bg-white hover:text-[#000000] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-[#000000] text-white hover:bg-[#1a1a1a] transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-5 text-[#000000]">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full bg-[#f0f0f0] border border-[#000000]/10 text-[#000000] transition-all duration-300 hover:bg-white"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <Menu className={`w-5 h-5 absolute transition-all duration-300 ${menuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
            <X className={`w-5 h-5 absolute transition-all duration-300 ${menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-20 transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-[#000000]/40 backdrop-blur-sm" />
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-20 w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full pt-24 px-6 pb-8 overflow-y-auto">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-lg font-semibold text-[#000000] py-3 border-b border-[#000000]/10">
            Home
          </Link>

          {/* Shop accordion */}
          <button
            onClick={() => setMobileSection((s) => (s === 'shop' ? null : 'shop'))}
            className="flex items-center justify-between text-lg font-semibold text-[#000000] py-3 border-b border-[#000000]/10"
          >
            Shop
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileSection === 'shop' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${mobileSection === 'shop' ? 'max-h-[32rem]' : 'max-h-0'}`}>
            <div className="py-2 pl-3 space-y-2 max-h-[32rem] overflow-y-auto">
              {SHOP_MEGA.map((cat) => (
                <Link
                  key={cat.href}
                  to={cat.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm text-[#6b6b6b] py-1"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* About accordion */}
          <button
            onClick={() => setMobileSection((s) => (s === 'about' ? null : 'about'))}
            className="flex items-center justify-between text-lg font-semibold text-[#000000] py-3 border-b border-[#000000]/10"
          >
            About
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileSection === 'about' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${mobileSection === 'about' ? 'max-h-64' : 'max-h-0'}`}>
            <div className="py-2 pl-3 space-y-2">
              {ABOUT_MENU.map((item) => (
                <Link key={item.href} to={item.href} onClick={() => setMenuOpen(false)} className="block text-sm text-[#6b6b6b] py-1">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Investor accordion */}
          <button
            onClick={() => setMobileSection((s) => (s === 'investor' ? null : 'investor'))}
            className="flex items-center justify-between text-lg font-semibold text-[#000000] py-3 border-b border-[#000000]/10"
          >
            Investor
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileSection === 'investor' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${mobileSection === 'investor' ? 'max-h-[36rem]' : 'max-h-0'}`}>
            <div className="py-2 pl-3 space-y-3 max-h-[36rem] overflow-y-auto">
              {INVESTOR_MEGA.map((col) => (
                <div key={col.label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#000000]">{col.label}</p>
                  {col.children && (
                    <div className="mt-1 space-y-1">
                      {col.children.map((child) =>
                        child.href.startsWith('http') ? (
                          <a key={child.label} href={child.href} target="_blank" rel="noreferrer" className="block text-sm text-[#6b6b6b] py-0.5">
                            {child.label}
                          </a>
                        ) : (
                          <Link key={child.label} to={child.href} onClick={() => setMenuOpen(false)} className="block text-sm text-[#6b6b6b] py-0.5">
                            {child.label}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Link to="/media" onClick={() => setMenuOpen(false)} className="text-lg font-semibold text-[#000000] py-3 border-b border-[#000000]/10">
            Media
          </Link>
          <Link to="/careers" onClick={() => setMenuOpen(false)} className="text-lg font-semibold text-[#000000] py-3 border-b border-[#000000]/10">
            Careers
          </Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="text-lg font-semibold text-[#000000] py-3 border-b border-[#000000]/10">
            Contact
          </Link>

          <div className="mt-6 flex flex-col gap-4">
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-[#000000]">
              <Heart className="w-4 h-4" />
              Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
            </Link>
          </div>

          <div className="mt-6 border-t border-[#000000]/10 pt-6">
            {user ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-[#6b6b6b]">
                  Signed in as <span className="font-semibold text-[#000000]">{user.name || user.email}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-full border-2 border-[#000000] py-3 text-center text-sm font-semibold text-[#000000]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-full bg-[#000000] py-3 text-center text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
