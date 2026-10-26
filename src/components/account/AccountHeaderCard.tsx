import { Link } from 'react-router-dom';
import { CheckCircle2, Package, User } from 'lucide-react';
import { useAuthStore } from '../../auth-store';

const TABS = [
  { key: 'profile', label: 'Profile', href: '/profile', icon: User },
  { key: 'orders', label: 'Orders', href: '/orders', icon: Package },
] as const;

/** The top of every account page, as one card in modules: an avatar tile,
 *  who is signed in, and a row of tabs to move between Profile and Orders. */
export default function AccountHeaderCard({ active }: { active: 'profile' | 'orders' }) {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-shop-line bg-white">
      <div className="flex items-stretch">
        {/* Module — avatar tile */}
        <div
          className="flex w-20 shrink-0 items-center justify-center text-2xl font-semibold text-white sm:w-24"
          style={{ background: 'linear-gradient(135deg, #3D4FE0 0%, #0E0E0E 100%)' }}
          aria-hidden="true"
        >
          {(user.name || user.email || '?').slice(0, 1).toUpperCase()}
        </div>

        {/* Module — identity */}
        <div className="min-w-0 flex-1 px-5 py-4">
          <span className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45">
            <span className="h-1.5 w-1.5 rounded-full bg-shop-accent" aria-hidden="true" />
            My account
          </span>
          <h1 className="mt-1 truncate text-2xl font-semibold text-shop-ink sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>
            {user.name || 'My Account'}
          </h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-shop-ink/55">
            <span className="truncate">{user.email}</span>
            {user.emailVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EBFD] px-2 py-0.5 text-[11px] font-semibold text-shop-accent">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Module — tabs */}
      <nav aria-label="Account" className="flex items-stretch border-t border-shop-line">
        {TABS.map(({ key, label, href, icon: Icon }, i) => {
          const isActive = key === active;
          return (
            <Link
              key={key}
              to={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors duration-300 ${
                i > 0 ? 'border-l border-shop-line' : ''
              } ${isActive ? 'bg-shop-ink text-white' : 'text-shop-ink/60 hover:bg-shop-canvas hover:text-shop-ink'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
