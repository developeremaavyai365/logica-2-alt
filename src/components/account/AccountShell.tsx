import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Coins,
  CreditCard,
  Gift,
  Heart,
  HelpCircle,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  Ticket,
  Truck,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import WavePanel from '../careers/WavePanel';
import { TitleGlow } from '../auth/AuthShell';
import { useAuthStore } from '../../auth-store';
import { useShopStore } from '../../store';

export type AccountSection = 'orders' | 'wishlist' | 'addresses' | 'profile' | 'security';

const NAVY = '#061A40';
const BLUE = '#3D4FE0';

/** The account pages' card: white, hairline border, soft navy shadow. */
export const ACCOUNT_CARD = 'rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)]';

interface NavItem {
  key?: AccountSection;
  label: string;
  href?: string;
  icon: LucideIcon;
  /** Planned, not built yet: shown so the menu reads complete, not clickable. */
  soon?: boolean;
}

const GROUPS: { title: string; icon: LucideIcon; items: NavItem[] }[] = [
  {
    title: 'Account settings',
    icon: UserRound,
    items: [
      { key: 'profile', label: 'Profile information', href: '/profile', icon: UserRound },
      { key: 'addresses', label: 'Manage addresses', href: '/addresses', icon: MapPin },
      { key: 'security', label: 'Login & security', href: '/security', icon: KeyRound },
    ],
  },
  {
    title: 'Payments',
    icon: Wallet,
    items: [
      { label: 'Wallet', icon: Wallet, soon: true },
      { label: 'Gift cards', icon: Gift, soon: true },
      { label: 'Saved cards', icon: CreditCard, soon: true },
    ],
  },
  {
    title: 'My stuff',
    icon: Heart,
    items: [
      { key: 'wishlist', label: 'My wishlist', href: '/wishlist', icon: Heart },
      { label: 'My coupons', icon: Ticket, soon: true },
      { label: 'Reward coins', icon: Coins, soon: true },
      { label: 'All notifications', icon: Bell, soon: true },
    ],
  },
];

/** On a phone the menu is one scrolling row: just the pages that exist. */
const PHONE_TABS: NavItem[] = [
  { key: 'orders', label: 'Orders', href: '/orders', icon: Package },
  ...GROUPS.flatMap((g) => g.items).filter((i) => !i.soon),
];

/** Every account page: the site header, a navy greeting panel, then the
 *  grouped account menu beside the page's own content. */
export default function AccountShell({
  active,
  title,
  eyebrow,
  action,
  children,
}: {
  active: AccountSection;
  title: string;
  /** A small line above the title. */
  eyebrow?: string;
  /** A button beside the title, such as "Add address". */
  action?: ReactNode;
  children: ReactNode;
}) {
  const { user, signOut } = useAuthStore();
  const { wishlist } = useShopStore();
  const navigate = useNavigate();
  if (!user) return null;

  const firstName = (user.name || '').trim().split(/\s+/)[0] || 'there';
  const initial = (user.name || user.email || '?').slice(0, 1).toUpperCase();
  // Leave the account page first: once signed out, its sign-in guard would
  // send the shopper to the login page instead.
  const handleSignOut = () => {
    navigate('/');
    void signOut();
  };

  const quick = [
    { label: 'Orders', href: '/orders', icon: Package },
    { label: wishlist.length ? `Wishlist · ${wishlist.length}` : 'Wishlist', href: '/wishlist', icon: Heart },
    { label: 'Addresses', href: '/addresses', icon: MapPin },
  ];

  return (
    <div className="w-full bg-[#F5F8FC]">
      <div className="bg-white">
        <Header />
      </div>

      {/* Greeting */}
      <div className="bg-white px-4 pb-8 sm:px-6 md:px-5">
        <WavePanel className="mx-auto max-w-[1300px]">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="animate-fade-up flex items-center gap-5">
              <span className="relative shrink-0 rounded-full bg-gradient-to-br from-[#8FAEFF] via-[#3D4FE0] to-[#C7D4FF] p-[2px]">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full font-dm-sans text-2xl font-bold text-white sm:h-20 sm:w-20 sm:text-3xl"
                  style={{ background: `linear-gradient(145deg, #1B2F6B 0%, ${NAVY} 100%)` }}
                  aria-hidden="true"
                >
                  {initial}
                </span>
              </span>
              <div className="min-w-0">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/60 sm:text-sm">My account</span>
                <h1
                  className="mt-1.5 truncate font-dm-sans font-bold text-white"
                  style={{ fontSize: 'clamp(26px, 3.4vw, 44px)', letterSpacing: '-0.025em', lineHeight: 1.08 }}
                >
                  Hello, <TitleGlow>{firstName}</TitleGlow>
                </h1>
                {user.email && (
                  <p className="mt-1.5 flex items-center gap-2 truncate text-sm text-white/65">
                    <span className="truncate">{user.email}</span>
                    {user.emailVerified && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#C7D4FF]">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Desktop only: on a phone the tab row below does this job. */}
            <nav aria-label="Quick links" className="hidden flex-wrap gap-2.5 lg:flex">
              {quick.map(({ label, href, icon: Icon }, i) => (
                <Link
                  key={href}
                  to={href}
                  className="animate-fade-up group flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/85 backdrop-blur-sm transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.12] hover:text-white"
                  style={{ animationDelay: `${120 + i * 90}ms`, animationFillMode: 'both' }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </WavePanel>
      </div>

      <section className="mx-auto max-w-[1300px] px-4 pb-16 pt-2 sm:px-6 md:px-5">
        {/* minmax(0, …) on both layouts: the phone's scrolling tab row must
            not widen the page to fit all its tabs. */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          {/* Phone: one scrolling row of tabs */}
          <nav aria-label="Account" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
            {PHONE_TABS.map(({ key, label, href, icon: Icon }) => {
              const on = key === active;
              return (
                <Link
                  key={label}
                  to={href!}
                  aria-current={on ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    on ? 'border-transparent text-white' : 'border-[#E7EAF3] bg-white text-[#061A40]/70 hover:text-[#061A40]'
                  }`}
                  style={on ? { backgroundColor: NAVY } : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex shrink-0 items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>

          {/* Desktop: the grouped menu */}
          <aside className="hidden flex-col gap-4 lg:sticky lg:top-6 lg:flex">
            <nav aria-label="Account" className={`${ACCOUNT_CARD} overflow-hidden`}>
              {/* My orders: the page people come for most, on its own */}
              <Link
                to="/orders"
                aria-current={active === 'orders' ? 'page' : undefined}
                className={`group flex items-center gap-3.5 border-b border-[#EEF0F6] px-5 py-4 transition-colors ${
                  active === 'orders' ? 'bg-[#F1F3FE]' : 'hover:bg-[#F8F9FD]'
                }`}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-[0_8px_18px_-8px_rgba(61,79,224,0.8)]"
                  style={{ background: `linear-gradient(145deg, ${BLUE} 0%, #2A37B8 100%)` }}
                >
                  <Package className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1 text-[15px] font-semibold text-[#061A40]">My orders</span>
                <ChevronRight className="h-4 w-4 text-[#061A40]/40 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>

              {GROUPS.map(({ title: group, icon: GroupIcon, items }) => (
                <div key={group} className="border-b border-[#EEF0F6] px-3 py-3.5">
                  <span className="flex items-center gap-2 px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#061A40]/45">
                    <GroupIcon className="h-3.5 w-3.5" />
                    {group}
                  </span>
                  {items.map(({ key, label, href, icon: Icon, soon }) => {
                    if (soon) {
                      return (
                        <span
                          key={label}
                          className="flex cursor-default items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-[#061A40]/40"
                          title="Coming soon"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{label}</span>
                          <span className="rounded-full bg-[#F1F3FE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#3D4FE0]/70">
                            Soon
                          </span>
                        </span>
                      );
                    }
                    const on = key === active;
                    return (
                      <Link
                        key={label}
                        to={href!}
                        aria-current={on ? 'page' : undefined}
                        className={`relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                          on ? 'bg-[#F1F3FE] font-semibold text-[#3D4FE0]' : 'text-[#061A40]/75 hover:bg-[#F8F9FD] hover:text-[#061A40]'
                        }`}
                      >
                        {on && <span className="absolute -left-3 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#3D4FE0]" aria-hidden="true" />}
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              ))}

              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-5 py-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>

            <div className={`${ACCOUNT_CARD} px-5 py-4`}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#061A40]/45">Frequently visited</span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Link
                  to="/orders"
                  className="flex items-center gap-1.5 rounded-full bg-[#F5F8FC] px-3 py-1.5 text-xs font-medium text-[#061A40]/75 transition-colors hover:bg-[#F1F3FE] hover:text-[#3D4FE0]"
                >
                  <Truck className="h-3.5 w-3.5" /> Track order
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-1.5 rounded-full bg-[#F5F8FC] px-3 py-1.5 text-xs font-medium text-[#061A40]/75 transition-colors hover:bg-[#F1F3FE] hover:text-[#3D4FE0]"
                >
                  <HelpCircle className="h-3.5 w-3.5" /> Help centre
                </Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                {eyebrow && (
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: BLUE }}>
                    {eyebrow}
                  </span>
                )}
                <h2
                  className={`font-dm-sans font-bold ${eyebrow ? 'mt-1.5' : ''}`}
                  style={{ color: NAVY, fontSize: 'clamp(24px, 2.4vw, 32px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
                >
                  {title}
                </h2>
              </div>
              {action}
            </div>
            {children}
          </main>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/** A section card on an account page: a title row with an optional action
 *  on the right (such as Edit), then the content. */
export function AccountCard({
  title,
  icon: Icon,
  action,
  children,
  className = '',
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${ACCOUNT_CARD} ${className}`}>
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <h3 className="flex items-center gap-2.5 font-dm-sans text-[17px] font-bold text-[#061A40]">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1F3FE] text-[#3D4FE0]">
              <Icon className="h-4 w-4" />
            </span>
          )}
          {title}
        </h3>
        {action}
      </div>
      <div className="px-6 pb-6 pt-4">{children}</div>
    </section>
  );
}

/** "Edit" / "Cancel" beside a card title. */
export function EditToggle({ editing, onToggle }: { editing: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        editing ? 'text-[#061A40]/60 hover:bg-[#F5F8FC]' : 'text-[#3D4FE0] hover:bg-[#F1F3FE]'
      }`}
    >
      {editing ? 'Cancel' : 'Edit'}
    </button>
  );
}

/** A labelled input in the account pages' style. Read-only fields sit on a
 *  soft fill; editable ones are white with a blue glow on focus. */
export function AccountInput({
  label,
  readOnly,
  prefix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; prefix?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[#6B7280]">{label}</span>
      <span
        className={`flex h-12 items-center overflow-hidden rounded-xl border transition-all duration-200 ${
          readOnly
            ? 'border-transparent bg-[#F5F8FC]'
            : 'border-[#E5E7EB] bg-white hover:border-[#C7D2FE] focus-within:border-[#3D4FE0] focus-within:shadow-[0_0_0_4px_rgba(61,79,224,0.12)]'
        }`}
      >
        {prefix && <span className="pl-4 pr-1 text-sm font-medium text-[#061A40]/50">{prefix}</span>}
        <input
          {...props}
          readOnly={readOnly}
          className={`h-full min-w-0 flex-1 bg-transparent text-sm text-[#061A40] outline-none placeholder:text-[#9CA3AF] ${
            prefix ? 'pr-4' : 'px-4'
          } ${readOnly ? 'cursor-default text-[#061A40]/80' : ''}`}
        />
      </span>
    </label>
  );
}

/** The navy "Save" button used across the account pages. */
export const ACCOUNT_SAVE =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#061A40] px-7 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(6,26,64,0.6)] transition-colors duration-300 hover:bg-[#3D4FE0] disabled:cursor-not-allowed disabled:opacity-50';
