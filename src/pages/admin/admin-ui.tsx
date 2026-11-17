import { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

/* Words and small pieces shared by the admin pages, so the same thing is
   called the same thing everywhere, in words a shop's staff use. */

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

/** What each listing status means to someone running the shop. */
export const STATUS_WORDS: Record<ListingStatus, string> = {
  ACTIVE: 'Live on website',
  DRAFT: 'Not live yet',
  INACTIVE: 'Hidden',
};

const STATUS_STYLE: Record<ListingStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  DRAFT: 'bg-amber-50 text-amber-700',
  INACTIVE: 'bg-[#F1F2F6] text-[#6B7280]',
};

export function StatusBadge({ status, size = 'sm' }: { status: ListingStatus; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ${STATUS_STYLE[status]} ${
        size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500' : status === 'DRAFT' ? 'bg-amber-500' : 'bg-[#9CA3AF]'}`} />
      {STATUS_WORDS[status]}
    </span>
  );
}

/** A small "?" that explains a field in plain words, with an example. It
 *  opens on hover or focus, and on a tap for phones. */
export function HelpTip({ text }: { text: string }) {
  const [open, setOpenState] = useState(false);
  // Which way the bubble opens: toward the middle of the screen, so it never
  // runs off an edge.
  const [side, setSide] = useState<'left' | 'right'>('left');
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => {
    const box = ref.current?.getBoundingClientRect();
    if (box) setSide(box.left < window.innerWidth / 2 ? 'left' : 'right');
    setOpenState(next);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label="What is this?"
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:text-[#3D4FE0] focus-visible:text-[#3D4FE0] focus-visible:outline-none"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute bottom-full z-40 mb-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl ${side === 'left' ? '-left-2' : '-right-2'} bg-[#061A40] px-3 py-2 text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-[0_12px_30px_-10px_rgba(6,26,64,0.5)]`}
        >
          {text}
        </span>
      )}
    </span>
  );
}

/** Plain explanations of the fields that use trade words, shown by HelpTip. */
export const HELP = {
  itemCode:
    'The code this product has in SAP (your billing / stock system), e.g. 500103. Once it is linked, the price and stock on the website come from the SAP sheet, and customers can order.',
  modelName: 'The name the maker uses, without the brand: e.g. "Galaxy S24 5G" for Samsung.',
  modelNumber: 'The maker\'s code printed on the box or the product, e.g. SM-S921BZKCINS.',
  variant: 'What makes this version different from others of the same model, e.g. 8 GB RAM and 256 GB storage.',
  title: 'The name customers see. It is written for you from the brand, model, variant and colour; you can also type your own.',
  mrp: 'The maximum retail price printed on the box.',
  sellingPrice: 'The price customers pay on the website. It cannot be more than the MRP.',
  barcode: 'The 8, 12 or 13-digit number under the barcode on the box, e.g. 8901234567890.',
  gst: 'The GST rate this product is billed at: usually 18% for phones, laptops and accessories.',
  hsn: 'The tax code used on GST invoices for this kind of product (4 to 8 digits), e.g. 85171300 for mobile phones, 84713010 for laptops.',
  highlights: 'Short points shown next to the photos, e.g. "8 GB RAM | 256 GB ROM". Use "Fill from specs" to write them for you.',
  origin: 'Where the product was made (or assembled). Indian rules require this to be shown to customers.',
  manufacturer: 'The name and address of the company that made it, as printed on the box.',
} as const;
