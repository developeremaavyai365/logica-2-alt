import { Link } from 'react-router-dom';
import { ArrowRight, Download, FileSpreadsheet, History, Trash2, Type, type LucideIcon } from 'lucide-react';
import AdminShell from './AdminShell';

/* The tools used now and then, kept off the main menu so the everyday jobs
   stay simple. */

interface Tool {
  icon: LucideIcon;
  title: string;
  text: string;
  to?: string;
  download?: { href: string; name: string };
}

const TOOLS: Tool[] = [
  {
    icon: FileSpreadsheet,
    title: 'Add or change many products from Excel',
    text: 'Download a sheet (blank, or with your products in it), fill it in, upload it, check, and save.',
    to: '/admin/products/bulk',
  },
  {
    icon: Download,
    title: 'Blank SAP price & stock sheet',
    text: 'The sheet with the columns the "Prices & stock" page reads: item code, name, stock, MRP and selling price.',
    download: { href: '/admin/logica-product-update-template.xlsx', name: 'Logica Product Update Template.xlsx' },
  },
  {
    icon: Type,
    title: 'How product titles are written',
    text: 'The title pattern for each brand, e.g. "Samsung Galaxy S24 5G (Onyx Black, 8 GB RAM, 256 GB Storage)".',
    to: '/admin/title-formats',
  },
  {
    icon: Trash2,
    title: 'Deleted products',
    text: 'Products that were deleted. Bring one back with Restore.',
    to: '/admin/products?status=deleted',
  },
  {
    icon: History,
    title: 'Who changed what',
    text: 'Every product keeps its own history: open a product and scroll to "History" at the bottom.',
    to: '/admin/products',
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const { icon: Icon } = tool;
  const inner = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FF] text-[#3D4FE0] transition-colors group-hover:bg-[#3D4FE0] group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-dm-sans text-[17px] font-bold text-[#061A40]">{tool.title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-[#6B7280]">{tool.text}</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-[#9CA3AF] transition-transform group-hover:translate-x-1 group-hover:text-[#3D4FE0]" />
    </>
  );
  const className =
    'group flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7D2FE]';
  return tool.download ? (
    <a href={tool.download.href} download={tool.download.name} className={className}>
      {inner}
    </a>
  ) : (
    <Link to={tool.to!} className={className}>
      {inner}
    </Link>
  );
}

export default function AdminTools() {
  return (
    <AdminShell>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
            More tools
          </h1>
          <p className="mt-1 text-[#6B7280]">Things you need now and then.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TOOLS.map((t) => (
            <ToolCard key={t.title} tool={t} />
          ))}
        </div>
      </main>
    </AdminShell>
  );
}
