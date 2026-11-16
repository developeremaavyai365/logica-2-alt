import { type ReactNode } from 'react';
import { Check, Phone, ReceiptText, ShieldCheck, type LucideIcon } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import WavePanel from '../careers/WavePanel';
import { ACCOUNT_CARD } from '../account/AccountShell';
import { rupees } from '../../lib/checkout';

/* The look shared by the cart, checkout and payment pages: the site header,
   a navy wave banner with the Cart → Address → Payment steps, then white
   cards on the soft blue page, as on the account pages. */

export const NAVY = '#061A40';
export const BLUE = '#3D4FE0';
export const SUPPORT_PHONE = '+91 7003999192';

/** The main call to action: navy, turning blue on hover. */
export const NAVY_BUTTON =
  'group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#061A40] text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(6,26,64,0.6)] transition-colors duration-300 hover:bg-[#3D4FE0] disabled:cursor-not-allowed disabled:bg-[#061A40]/40 disabled:shadow-none';

/** A quieter button beside it. */
export const OUTLINE_BUTTON =
  'flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-6 text-[15px] font-semibold text-[#061A40] transition-colors hover:border-[#C7D2FE] hover:text-[#3D4FE0]';

const STEPS = ['Cart', 'Address', 'Payment'];

/** Cart → Address → Payment, on the navy banner. Steps already passed show
 *  a tick. */
export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3" aria-label="Checkout steps">
      {STEPS.map((s, i) => {
        const on = i === current;
        const done = i < current;
        return (
          <li key={s} className="flex items-center gap-1.5 sm:gap-3" aria-current={on ? 'step' : undefined}>
            <span
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-semibold sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
                on ? 'border-transparent bg-white text-[#061A40]' : done ? 'border-white/25 bg-white/[0.12] text-white' : 'border-white/15 bg-white/[0.06] text-white/70'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  on ? 'bg-[#3D4FE0] text-white' : done ? 'bg-[#8FAEFF] text-[#061A40]' : 'bg-white/10 text-white/80'
                }`}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              {s}
            </span>
            {i < STEPS.length - 1 && <span className={`h-px w-2 sm:w-8 ${done ? 'bg-white/50' : 'bg-white/25'}`} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

/** A checkout page: header, navy banner (eyebrow, title, a line under it,
 *  the steps), then the page's own content. */
export default function CheckoutShell({
  eyebrow,
  title,
  subtitle,
  step,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Which of Cart / Address / Payment this page is. */
  step: number;
  children: ReactNode;
}) {
  return (
    <div className="w-full bg-[#F5F8FC]">
      <div className="bg-white">
        <Header />
      </div>

      <div className="bg-white px-4 pb-8 sm:px-6 md:px-5">
        <WavePanel className="mx-auto max-w-[1300px]">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="animate-fade-up min-w-0">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/60 sm:text-sm">{eyebrow}</span>
              <h1
                className="mt-2 font-dm-sans font-bold text-white"
                style={{ fontSize: 'clamp(30px, 4vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1.06 }}
              >
                {title}
              </h1>
              {subtitle && <div className="mt-2.5 text-sm text-white/65 sm:text-base">{subtitle}</div>}
            </div>
            <CheckoutSteps current={step} />
          </div>
        </WavePanel>
      </div>

      <section className="mx-auto max-w-[1300px] px-4 pb-28 pt-2 sm:px-6 md:px-5 lg:pb-16">{children}</section>

      <Footer />
    </div>
  );
}

/** A white card with a title beside a soft blue icon tile, as on the
 *  account pages. */
export function SectionCard({
  icon: Icon,
  title,
  action,
  children,
  className = '',
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${ACCOUNT_CARD} overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h2 className="flex items-center gap-2.5 font-dm-sans text-[17px] font-bold text-[#061A40]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1F3FE] text-[#3D4FE0]">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        {action}
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

/** Price, discount, delivery and the total, in the cart's style. Anything
 *  passed as children (a button, a note) sits under the total. */
export function PriceDetails({
  itemCount,
  mrpTotalPaise,
  subtotalPaise,
  shippingPaise,
  totalPaise,
  totalLabel = 'Total amount',
  children,
}: {
  itemCount: number;
  mrpTotalPaise: number;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  totalLabel?: string;
  children?: ReactNode;
}) {
  const savings = mrpTotalPaise - subtotalPaise;
  return (
    <div className={`${ACCOUNT_CARD} overflow-hidden`}>
      <div className="flex items-center gap-2.5 px-6 pt-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1F3FE] text-[#3D4FE0]">
          <ReceiptText className="h-4 w-4" />
        </span>
        <h2 className="font-dm-sans text-[17px] font-bold text-[#061A40]">Price details</h2>
      </div>

      <dl className="space-y-3 px-6 pb-5 pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[#6B7280]">
            Price ({itemCount} item{itemCount === 1 ? '' : 's'})
          </dt>
          <dd className="tabular-nums text-[#061A40]">{rupees(mrpTotalPaise)}</dd>
        </div>
        {savings > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7280]">Discount</dt>
            <dd className="font-semibold tabular-nums text-emerald-600">−{rupees(savings)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-[#6B7280]">Delivery</dt>
          <dd className={shippingPaise === 0 ? 'font-semibold text-emerald-600' : 'tabular-nums text-[#061A40]'}>
            {shippingPaise === 0 ? 'Free' : rupees(shippingPaise)}
          </dd>
        </div>
      </dl>

      <div className="mx-6 flex items-end justify-between gap-4 border-t border-dashed border-[#DDE2EE] py-4">
        <span className="text-sm font-semibold text-[#061A40]">{totalLabel}</span>
        <span className="font-dm-sans text-[28px] font-bold leading-none tabular-nums text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
          {rupees(totalPaise)}
        </span>
      </div>

      {savings > 0 && (
        <p className="mx-6 mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700">
          You save {rupees(savings)} on this order
        </p>
      )}

      {children && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

/** Secure checkout · GST included · phone help, as under the cart. */
export function TrustList({ first }: { first?: { title: string; text: string } }) {
  const rows = [
    { icon: ShieldCheck, ...(first ?? { title: 'Secure checkout', text: 'Your details are sent over an encrypted connection.' }) },
    { icon: ReceiptText, title: 'Prices include GST', text: 'No hidden taxes added later.' },
    { icon: Phone, title: 'Help with your order', text: `Call ${SUPPORT_PHONE}, Mon to Sat.` },
  ];
  return (
    <ul className={`${ACCOUNT_CARD} divide-y divide-[#EEF0F6] px-6`}>
      {rows.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-center gap-3.5 py-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F8FC] text-[#3D4FE0]">
            <Icon className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-[#061A40]">{title}</span>
            <span className="block text-xs text-[#6B7280]">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** A product photo on the soft gradient tile the cart uses. */
export function ProductThumb({ src, size = 'md' }: { src: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden bg-gradient-to-br from-[#F5F8FC] to-[#EAEFFA] ${
        size === 'sm' ? 'h-14 w-14 rounded-xl' : 'h-24 w-24 rounded-2xl sm:h-28 sm:w-28'
      }`}
    >
      {src && <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain p-2 mix-blend-multiply" />}
    </span>
  );
}
