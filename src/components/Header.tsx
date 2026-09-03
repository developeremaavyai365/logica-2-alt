import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, LogOut, Menu, Package, ShoppingCart, User, X } from 'lucide-react';
import { useShopStore } from '../store';
import { useAuthStore } from '../auth-store';
import { SHOP_MEGA, ABOUT_MENU } from '../nav-data';

/* One plain stripe rather than a floating pill: the items sit as bare text on
   the white bar, each with a rule that grows from the left on hover. Written
   once here because every item in the row wears it, including the two that
   open menus — a dropdown trigger should not look different from a link that
   simply goes somewhere. Mirrored on focus-visible so keyboard users see the
   same thing a pointer does. */
const NAV_LINK =
  'relative text-sm font-medium text-[#1a1a1a] outline-none transition-colors hover:text-black focus-visible:text-black ' +
  'after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 ' +
  'after:bg-[#15803D] after:transition-transform after:duration-300 after:ease-out ' +
  'hover:after:scale-x-100 focus-visible:after:scale-x-100';

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
        className="relative top-0 left-0 right-0 z-30 flex items-center justify-end gap-3 border-b border-black/10 bg-white px-4 py-4 sm:px-6 sm:py-5 md:px-10"
      >
        <Link to="/" className="mr-auto flex items-center shrink-0">
          <img src="/logica-logo-shine.png" alt="Logica Infoway" className="h-11 w-auto object-contain sm:h-12 md:h-14" />
        </Link>

        <div className="mr-4 hidden items-center gap-6 lg:flex xl:mr-8 xl:gap-9">
          <Link to="/" className={NAV_LINK}>
            Home
          </Link>

          {/* Shop mega menu */}
          <div className="group relative">
            <Link to="/shop" className={`${NAV_LINK} flex items-center gap-1`}>
              Shop
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            {/* Anchored to the trigger's right rather than centred on it: the
                row sits on the right of the bar now, and a 46rem panel centred
                on Shop would run off the screen. */}
            <div className="absolute right-0 top-full pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-40">
              {/* Balanced columns rather than a grid. In a grid every row is
                  as tall as its tallest cell, and Accessories carries twelve
                  sub-items — one category was dragging the whole panel past
                  the bottom of the screen. Flowing the categories into columns
                  instead, each kept whole with break-inside-avoid, sizes the
                  panel to its tallest single category. The max-height is only
                  insurance for the day the catalogue grows again. */}
              <div className="max-h-[calc(100vh-7rem)] w-[54rem] max-w-[92vw] overflow-y-auto rounded-2xl border border-black/10 bg-white p-7 shadow-xl">
                <div className="columns-4 gap-x-8">
                  {SHOP_MEGA.map((cat) => (
                    <div key={cat.href} className="mb-6 break-inside-avoid">
                      <Link
                        to={cat.href}
                        className="text-[13px] font-semibold text-[#000000] transition-opacity hover:opacity-70"
                      >
                        {cat.label}
                      </Link>
                      {cat.children && (
                        <ul className="mt-2 space-y-1">
                          {cat.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                to={child.href}
                                className="text-xs leading-relaxed text-[#6b6b6b] transition-colors hover:text-[#000000]"
                              >
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
          </div>

          {/* About dropdown */}
          <div className="group relative">
            <Link to="/about" className={`${NAV_LINK} flex items-center gap-1`}>
              About
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            <div className="absolute left-0 top-full pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-40">
              <div className="w-64 rounded-2xl bg-white shadow-xl border border-[#000000]/10 p-3">
                {ABOUT_MENU.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-3 py-2.5 rounded-lg text-sm text-[#000000] hover:bg-[#ECEDEC] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Investor Relations — a plain link, no dropdown. The categories
              live on the hub page itself, as on a standard IR site. */}
          <Link to="/investor" className={`${NAV_LINK} whitespace-nowrap`}>
            Investor Relations
          </Link>

          <Link to="/media" className={NAV_LINK}>
            Media
          </Link>
          <Link to="/careers" className={NAV_LINK}>
            Careers
          </Link>
          <Link to="/contact" className={`${NAV_LINK} whitespace-nowrap`}>
            Contact Us
          </Link>
        </div>

        {/* No pill around these either — the whole bar is meant to read as one
            flat stripe, so the icons hover on their own rather than sitting in
            a tray. */}
        <div className="flex items-center gap-1 text-[#1a1a1a] sm:gap-2">
          <Link
            to="/wishlist"
            className="flex relative items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/5 hover:text-black"
            aria-label="Wishlist"
          >
            <Heart className="w-[18px] h-[18px]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="flex relative items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/5 hover:text-black"
            aria-label="Cart"
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white text-sm font-semibold text-[#000000] transition-colors hover:bg-black/5"
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
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#000000] hover:bg-[#ECEDEC] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <Link
                    to="/cart"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#000000] hover:bg-[#ECEDEC] transition-colors"
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
          <div className="hidden lg:flex items-center gap-4">
            {/* Login reads as another item in the row; Sign Up keeps a solid
                fill, since it is the one thing here asking to be pressed. */}
            <Link to="/login" className={NAV_LINK}>
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-[#000000] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
            >
              Sign Up
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-5 text-[#000000]">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full text-[#1a1a1a] transition-colors duration-300 hover:bg-black/5 hover:text-black"
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
          {mobileSection === 'shop' && (
            <div className="py-2 pl-3 space-y-2">
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
          )}

          {/* About accordion */}
          <button
            onClick={() => setMobileSection((s) => (s === 'about' ? null : 'about'))}
            className="flex items-center justify-between text-lg font-semibold text-[#000000] py-3 border-b border-[#000000]/10"
          >
            About
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileSection === 'about' ? 'rotate-180' : ''}`} />
          </button>
          {mobileSection === 'about' && (
            <div className="py-2 pl-3 space-y-2">
              {ABOUT_MENU.map((item) => (
                <Link key={item.href} to={item.href} onClick={() => setMenuOpen(false)} className="block text-sm text-[#6b6b6b] py-1">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Investor Relations — a plain link on mobile too, matching the
              desktop bar. The categories are on the hub page. */}
          <Link
            to="/investor"
            onClick={() => setMenuOpen(false)}
            className="block text-lg font-semibold text-[#000000] py-3 border-b border-[#000000]/10"
          >
            Investor Relations
          </Link>

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
