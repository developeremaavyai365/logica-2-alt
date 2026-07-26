import { Link } from 'react-router-dom';
import { categories, socials } from '../data';

export default function Footer() {
  return (
    <footer className="w-full bg-[#151d13] py-14 px-4 sm:px-6 md:px-10 text-white/70 text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-semibold mb-3">Useful Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link to="/investor" className="hover:text-white transition-colors">Investor</Link></li>
            <li><Link to="/media" className="hover:text-white transition-colors">Media</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Product Categories</h4>
          <ul className="space-y-2">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link to={`/shop/${c.slug}`} className="hover:text-white transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Help Desk</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cancellation &amp; Refund</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">For Online Order</h4>
          <p>+91 7003999192</p>
          <p className="mt-1">Mon to Sat: 10:00 AM – 7:00 PM</p>
          <h4 className="text-white font-semibold mt-5 mb-2">Follow Us</h4>
          <div className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-2.5 py-1 rounded-full border border-white/15 hover:text-white hover:border-white/40 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/50">
        <p className="text-white/80 font-medium">Logica Infoway Limited</p>
        <p>(Formerly: Eastern Logica Infoway Limited)</p>
        <p className="mt-1">Registered Office: 2 Saklat Place, 1st Floor, Kolkata, West Bengal, India – 700072</p>
        <p>Telephone: 033 4058 0000 · Email: info@logicainfoway.com</p>
        <p>CIN: L30007WB1995PLC073218 · GSTIN: 19AABCE0772B1Z1</p>
      </div>
    </footer>
  );
}
