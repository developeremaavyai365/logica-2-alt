import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, FileSpreadsheet, Link2, Store } from 'lucide-react';
import { apiFetch } from '../../lib/api-client';
import { useAuthStore } from '../../auth-store';
import AdminShell from './AdminShell';

interface Catalogue {
  inFeed: number;
  inStock: number;
  linked: number;
}

function Stat({ label, value, hint }: { label: string; value: number | null; hint: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3D4FE0]">{label}</span>
      <p className="mt-2 font-dm-sans text-4xl font-bold tabular-nums text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
        {value === null ? '–' : value.toLocaleString('en-IN')}
      </p>
      <p className="mt-1 text-sm text-[#6B7280]">{hint}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuthStore();
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);

  useEffect(() => {
    apiFetch<{ catalogue: Catalogue }>('/admin/sap-import/items?pageSize=1')
      .then((data) => setCatalogue(data.catalogue))
      .catch(() => setCatalogue(null));
  }, []);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-[#6B7280]">Manage the products, prices and stock shown on logicainfoway.com.</p>
        </div>
        {/* The blank product sheet to send to whoever fills in the list. */}
        <a
          href="/admin/logica-product-update-template.xlsx"
          download="Logica Product Update Template.xlsx"
          className="flex items-center gap-2 rounded-xl bg-[#061A40] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#3D4FE0]"
        >
          <Download className="h-4 w-4" />
          Download template
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="In the SAP feed" value={catalogue?.inFeed ?? null} hint="SAP codes from the latest sheets" />
        <Stat label="In stock" value={catalogue?.inStock ?? null} hint="Codes with stock above zero" />
        <Stat label="On the website" value={catalogue?.linked ?? null} hint="Codes linked to a shop product" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/admin/sap-import"
          className="group flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)] transition-all hover:-translate-y-0.5 hover:border-[#C7D2FE]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#061A40] text-white transition-colors group-hover:bg-[#3D4FE0]">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-dm-sans text-lg font-bold text-[#061A40]">SAP product import</span>
            <span className="mt-1 block text-sm leading-relaxed text-[#6B7280]">
              Upload the product sheet to update stock, MRP and selling price, then link each SAP code to its shop product.
            </span>
          </span>
          <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[#9CA3AF] transition-transform group-hover:translate-x-1 group-hover:text-[#3D4FE0]" />
        </Link>

        <div className="flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FF] text-[#3D4FE0]">
            {catalogue && catalogue.linked > 0 ? <Store className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-dm-sans text-lg font-bold text-[#061A40]">How prices reach the shop</span>
            <span className="mt-1 block text-sm leading-relaxed text-[#6B7280]">
              Only SAP codes linked to a shop product change what customers see. Products with no linked code keep their current
              price. Changes show on the website within about a minute.
            </span>
          </span>
        </div>
      </div>
    </main>
  );
}

export default function AdminHome() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}
