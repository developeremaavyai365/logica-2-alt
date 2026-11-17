import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Barcode,
  CheckCircle2,
  FileSpreadsheet,
  ImageOff,
  Images,
  IndianRupee,
  Link2,
  Link2Off,
  Loader2,
  PackageX,
  PencilLine,
  Plus,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import { apiFetch } from '../../lib/api-client';
import { useAuthStore } from '../../auth-store';
import AdminShell from './AdminShell';
import { STATUS_WORDS } from './admin-ui';

/* The admin home: the jobs people come here to do, as big buttons, and what
   needs doing, in plain words, each with a way to fix it. */

interface Counts {
  all: number;
  ACTIVE: number;
  DRAFT: number;
  INACTIVE: number;
  deleted: number;
  'not-linked': number;
  'missing-ean': number;
  'out-of-stock': number;
  'no-photo': number;
  'few-photos'?: number;
}

const CARD = 'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]';

function TaskCard({ to, icon: Icon, title, text, primary }: { to: string; icon: LucideIcon; title: string; text: string; primary?: boolean }) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-6 ${
        primary
          ? 'border-[#061A40] bg-[#061A40] text-white shadow-[0_18px_36px_-16px_rgba(6,26,64,0.7)] hover:bg-[#0B2556]'
          : 'border-[#E5E7EB] bg-white text-[#061A40] shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)] hover:border-[#C7D2FE]'
      }`}
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${
          primary ? 'bg-white/10 text-white' : 'bg-[#EEF1FF] text-[#3D4FE0] group-hover:bg-[#3D4FE0] group-hover:text-white'
        }`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-dm-sans text-lg font-bold leading-snug">{title}</span>
        <span className={`mt-0.5 block text-sm leading-relaxed ${primary ? 'text-white/70' : 'text-[#6B7280]'}`}>{text}</span>
      </span>
      <ArrowRight className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 ${primary ? 'text-white/70' : 'text-[#9CA3AF] group-hover:text-[#3D4FE0]'}`} />
    </Link>
  );
}

function TodoRow({ icon: Icon, tone, children, to, action }: { icon: LucideIcon; tone: 'red' | 'amber' | 'blue'; children: ReactNode; to: string; action: string }) {
  const tones = { red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-[#EEF1FF] text-[#3D4FE0]' };
  return (
    <li>
      <Link to={to} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFBFE] sm:px-6">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 text-[15px] leading-snug text-[#061A40]">{children}</span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#3D4FE0]">
          {action} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}

const plural = (n: number, one: string, many: string) => `${n.toLocaleString('en-IN')} ${n === 1 ? one : many}`;

function Home() {
  const { user } = useAuthStore();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [toMatch, setToMatch] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ counts: Counts }>('/admin/products?pageSize=1')
      .then((data) => setCounts(data.counts))
      .catch(() => setCounts(null));
    apiFetch<{ suggestions: unknown[] }>('/admin/sap-import/suggestions')
      .then((data) => setToMatch(data.suggestions.length))
      .catch(() => setToMatch(0));
  }, []);

  const todo = counts
    ? [
        toMatch
          ? {
              icon: Link2,
              tone: 'blue' as const,
              to: '/admin/sap-import#matches',
              action: 'Check',
              text: (
                <>
                  <strong>{plural(toMatch, 'new item code', 'new item codes')}</strong> from SAP look like products on the website. Confirm them so
                  customers can order.
                </>
              ),
            }
          : null,
        counts['not-linked']
          ? {
              icon: Link2Off,
              tone: 'red' as const,
              to: '/admin/products?issue=not-linked',
              action: 'Fix',
              text: (
                <>
                  <strong>{plural(counts['not-linked'], 'product', 'products')}</strong> can't be ordered yet: no item code (SAP) linked.
                </>
              ),
            }
          : null,
        counts['no-photo']
          ? {
              icon: ImageOff,
              tone: 'red' as const,
              to: '/admin/products?issue=no-photo',
              action: 'Add photos',
              text: (
                <>
                  <strong>{plural(counts['no-photo'], 'product has', 'products have')}</strong> no photo.
                </>
              ),
            }
          : null,
        counts['few-photos']
          ? {
              icon: Images,
              tone: 'amber' as const,
              to: '/admin/products?issue=few-photos',
              action: 'Add photos',
              text: (
                <>
                  <strong>{plural(counts['few-photos'], 'product has', 'products have')}</strong> only 1 or 2 photos. With 3 or more (front, back, side, box) shoppers see them all at once.
                </>
              ),
            }
          : null,
        counts.DRAFT
          ? {
              icon: Rocket,
              tone: 'amber' as const,
              to: '/admin/products?status=DRAFT',
              action: 'Review',
              text: (
                <>
                  <strong>{plural(counts.DRAFT, 'product is', 'products are')}</strong> not live yet.
                </>
              ),
            }
          : null,
        counts['out-of-stock']
          ? {
              icon: PackageX,
              tone: 'amber' as const,
              to: '/admin/products?issue=out-of-stock',
              action: 'See',
              text: (
                <>
                  <strong>{plural(counts['out-of-stock'], 'product is', 'products are')}</strong> out of stock.
                </>
              ),
            }
          : null,
        counts['missing-ean']
          ? {
              icon: Barcode,
              tone: 'amber' as const,
              to: '/admin/products?issue=missing-ean',
              action: 'Fix',
              text: (
                <>
                  <strong>{plural(counts['missing-ean'], 'product has', 'products have')}</strong> no barcode number.
                </>
              ),
            }
          : null,
      ].filter((x): x is NonNullable<typeof x> => x !== null)
    : [];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-[#6B7280]">What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TaskCard to="/admin/products/new" icon={Plus} title="Add a new product" text="Step by step: what it is, price, photos and details." primary />
        <TaskCard to="/admin/sap-import" icon={IndianRupee} title="Update prices & stock" text="Upload the SAP sheet. Prices on the website change at once." />
        <TaskCard to="/admin/products" icon={PencilLine} title="Find & edit a product" text="Change photos, price, details, or take a product off the website." />
        <TaskCard to="/admin/products/bulk" icon={FileSpreadsheet} title="Add many products from Excel" text="Fill in one sheet to add or change many products at once." />
      </div>

      <section className={`${CARD} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF0F6] px-5 py-4 sm:px-6">
          <h2 className="font-dm-sans text-lg font-bold text-[#061A40]">Needs your attention</h2>
          {counts && (
            <span className="text-sm text-[#6B7280]">
              {counts.ACTIVE.toLocaleString('en-IN')} {STATUS_WORDS.ACTIVE.toLowerCase()} · {counts.DRAFT.toLocaleString('en-IN')} {STATUS_WORDS.DRAFT.toLowerCase()} ·{' '}
              {counts.INACTIVE.toLocaleString('en-IN')} {STATUS_WORDS.INACTIVE.toLowerCase()}
            </span>
          )}
        </div>
        {!counts ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-[#9CA3AF]" />
          </div>
        ) : todo.length === 0 ? (
          <p className="flex items-center gap-3 px-6 py-6 text-[15px] text-[#061A40]">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" /> Everything looks good. Nothing needs fixing right now.
          </p>
        ) : (
          <ul className="divide-y divide-[#EEF0F6]">
            {todo.map((t, i) => (
              <TodoRow key={i} icon={t.icon} tone={t.tone} to={t.to} action={t.action}>
                {t.text}
              </TodoRow>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function AdminHome() {
  return (
    <AdminShell>
      <Home />
    </AdminShell>
  );
}
