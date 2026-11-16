import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Barcode,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  ImagePlus,
  Info,
  Link2,
  ListChecks,
  Loader2,
  Lock,
  Palette,
  Plus,
  ReceiptText,
  Star,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import AdminShell from './AdminShell';
import { ApiError, apiFetch } from '../../lib/api-client';

/* The product listing form, for a new product (/admin/products/new) or an
   existing one (/admin/products/<address>). Laid out like a marketplace's
   seller form: the listing in sections on the left; on the right, what is
   still needed before it can go on the shop, a preview, and the buttons.

   The checklist here runs as the admin types; the server checks the same
   things again when saving (listing-rules.ts) and has the final word. */

type Status = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

interface SpecField {
  label: string;
  required: boolean;
  placeholder: string;
}
interface Options {
  categories: { slug: string; name: string; specFields: SpecField[] }[];
  brands: string[];
  gstRates: number[];
}
interface Colour {
  key: string;
  name: string;
  hex: string;
  family: string[];
  images: string[];
  inStock: boolean | null;
  ean: string | null;
}
interface Listing {
  name: string;
  categorySlug: string;
  brandName: string;
  status: Status;
  priceInPaise: number;
  mrpInPaise: number | null;
  inStock: boolean;
  gallery: string[];
  sharedImages: string[];
  highlights: string[];
  specs: { label: string; value: string }[];
  description: string;
  modelNumber: string | null;
  partNumber: string | null;
  ean: string | null;
  hsnCode: string | null;
  gstRatePercent: number | null;
  warranty: string | null;
  inTheBox: string | null;
  colours: Colour[];
}
interface SapCode {
  sapCode: string;
  modelName: string;
  websiteColour: string | null;
  mopInPaise: number;
  mrpInPaise: number;
  stock: number;
  ean: string | null;
}
interface Loaded extends Listing {
  slug: string;
  sapCodes: SapCode[];
}

const EMPTY: Listing = {
  name: '',
  categorySlug: '',
  brandName: '',
  status: 'DRAFT',
  priceInPaise: 0,
  mrpInPaise: null,
  inStock: true,
  gallery: [],
  sharedImages: [],
  highlights: ['', '', ''],
  specs: [],
  description: '',
  modelNumber: null,
  partNumber: null,
  ean: null,
  hsnCode: null,
  gstRatePercent: null,
  warranty: null,
  inTheBox: null,
  colours: [],
};

const NAVY = '#061A40';
const CARD = 'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]';
const INPUT =
  'h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#061A40] outline-none transition-colors placeholder:text-[#9CA3AF] hover:border-[#C7D2FE] focus:border-[#3D4FE0] focus:shadow-[0_0_0_4px_rgba(61,79,224,0.12)] disabled:cursor-not-allowed disabled:bg-[#F5F8FC] disabled:text-[#6B7280]';
const PRIMARY =
  'flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#061A40] text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(6,26,64,0.6)] transition-colors duration-300 hover:bg-[#3D4FE0] disabled:cursor-not-allowed disabled:bg-[#061A40]/40 disabled:shadow-none';
const SECONDARY =
  'flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#061A40] transition-colors hover:border-[#C7D2FE] hover:text-[#3D4FE0] disabled:cursor-not-allowed disabled:opacity-50';
const SMALL_BTN = 'flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F1F2F6] hover:text-[#061A40] disabled:opacity-30';

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;
const toRupeesText = (paise: number | null) => (paise == null || paise === 0 ? '' : String(paise / 100));
/** "52,990.50" → 5299050 paise; blank → null; anything else → NaN. */
function parseRupees(text: string): number | null {
  const t = text.replace(/[₹,\s]/g, '');
  if (!t) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return NaN;
  return Math.round(Number(t) * 100);
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');

/** EAN-8, UPC-A, EAN-13 or GTIN-14 with a correct check digit. */
function isValidGtin(code: string): boolean {
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  const digits = code.split('').map(Number);
  const check = digits.pop()!;
  const sum = digits.reverse().reduce((t, d, i) => t + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

/** The publish checklist, as the server works it out (listing-rules.ts).
 *  For a product already on the shop, the category's required specs are
 *  recommended rather than demanded. */
function checklist(l: Listing, specFields: SpecField[], linkedToSap: boolean, alreadyOnShop: boolean) {
  const blocking: string[] = [];
  const warnings: string[] = [];
  if (l.name.trim().length < 3) blocking.push('Add a product title.');
  if (!l.categorySlug) blocking.push('Choose a category.');
  if (!l.brandName.trim()) blocking.push('Choose a brand.');
  if (l.gallery.length === 0) blocking.push('Add at least one photo.');
  if (!linkedToSap && l.priceInPaise <= 0) blocking.push('Set a selling price, or link a SAP code on the SAP import page.');
  if (l.mrpInPaise != null && l.priceInPaise > l.mrpInPaise) blocking.push('The selling price cannot be above the MRP.');
  const filled = new Set(l.specs.filter((s) => s.value.trim()).map((s) => s.label.trim().toLowerCase()));
  for (const f of specFields) if (f.required && !filled.has(f.label.toLowerCase())) (alreadyOnShop ? warnings : blocking).push(`Fill in the spec "${f.label}".`);

  const badEan = [l.colours.length === 0 ? l.ean : null, ...l.colours.map((c) => c.ean)].filter((e): e is string => !!e && !isValidGtin(e));
  if (badEan.length) blocking.push(`Fix the EAN ${badEan[0]}: the digits do not check out.`);

  if (!linkedToSap) warnings.push('Link a SAP code on the SAP import page: until then shoppers can see it but not order it.');
  if (l.colours.length === 0) {
    if (!l.ean) warnings.push('Add the EAN / barcode.');
  } else {
    const noEan = l.colours.filter((c) => !c.ean).map((c) => c.name || 'a colour');
    if (noEan.length) warnings.push(`Add the EAN for ${noEan.join(', ')}.`);
    const noPhotos = l.colours.filter((c) => c.images.length === 0).map((c) => c.name || 'a colour');
    if (noPhotos.length) warnings.push(`Add photos of ${noPhotos.join(', ')}.`);
  }
  if (l.highlights.filter((h) => h.trim()).length < 3) warnings.push('Add at least 3 key highlights.');
  if (!l.description.trim()) warnings.push('Add a description.');
  if (!l.hsnCode) warnings.push('Add the HSN code.');
  if (l.gstRatePercent == null) warnings.push('Choose the GST rate.');
  return { blocking, warnings };
}

// ── Small building blocks ───────────────────────────────────────────────

function Section({ id, icon: Icon, title, hint, children }: { id: string; icon: typeof Tag; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} className={`${CARD} scroll-mt-6`}>
      <div className="flex items-start gap-3 border-b border-[#EEF0F6] px-5 py-4 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FF] text-[#3D4FE0]">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="font-dm-sans text-[17px] font-bold text-[#061A40]">{title}</h2>
          {hint && <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">{hint}</p>}
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[#374151]">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-[#6B7280]">{hint}</span>
      )}
    </label>
  );
}

/** A text box that edits a nullable string: blank means null. */
function TextInput({ value, onChange, ...rest }: { value: string | null; onChange: (v: string | null) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return <input {...rest} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)} className={INPUT} />;
}

/** A rupee amount, kept as typed while editing. */
function MoneyInput({ paise, onChange, disabled, placeholder }: { paise: number | null; onChange: (p: number | null) => void; disabled?: boolean; placeholder?: string }) {
  const [text, setText] = useState(toRupeesText(paise));
  const last = useRef(paise);
  useEffect(() => {
    if (paise !== last.current) {
      setText(toRupeesText(paise));
      last.current = paise;
    }
  }, [paise]);
  const parsed = parseRupees(text);
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">₹</span>
      <input
        inputMode="decimal"
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          const p = parseRupees(e.target.value);
          if (p === null || !Number.isNaN(p)) {
            last.current = p;
            onChange(p);
          }
        }}
        className={`${INPUT} pl-7 ${Number.isNaN(parsed) ? 'border-red-400' : ''}`}
      />
    </span>
  );
}

/** Uploads photos one after another; returns their addresses. */
async function uploadPhotos(files: File[], onError: (message: string) => void): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const body = new FormData();
    body.append('file', file);
    try {
      const { url } = await apiFetch<{ url: string }>('/admin/products/photos', { method: 'POST', body });
      urls.push(url);
    } catch (err) {
      onError(`${file.name}: ${err instanceof ApiError ? err.message : 'could not be uploaded.'}`);
    }
  }
  return urls;
}

/** A row of photos with move, remove and add; the first is the main one
 *  when `mainLabel` is set. */
function PhotoStrip({
  photos,
  onChange,
  mainLabel,
  size = 'lg',
  onError,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  mainLabel?: string;
  size?: 'lg' | 'sm';
  onError: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(0);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const tile = size === 'lg' ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-20 w-20';

  async function add(files: FileList | File[]) {
    const list = [...files].filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
    if (list.length < [...files].length) onError('Only JPG, PNG and WebP photos can be added.');
    if (!list.length) return;
    setUploading(list.length);
    const urls = await uploadPhotos(list, onError);
    setUploading(0);
    if (urls.length) onChange([...photos, ...urls]);
  }

  const move = (i: number, by: number) => {
    const next = [...photos];
    const [p] = next.splice(i, 1);
    next.splice(i + by, 0, p);
    onChange(next);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void add(e.dataTransfer.files);
      }}
      className={`flex flex-wrap gap-3 rounded-2xl transition-colors ${over ? 'bg-[#EEF1FF] outline-dashed outline-2 outline-[#3D4FE0]' : ''}`}
    >
      {photos.map((src, i) => (
        <div key={`${src}-${i}`} className={`group relative ${tile} shrink-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#F5F8FC] to-[#EAEFFA]`}>
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain p-2 mix-blend-multiply" />
          {mainLabel && i === 0 && (
            <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-[#061A40] px-2 py-0.5 text-[10px] font-semibold text-white">
              <Star className="h-2.5 w-2.5" /> {mainLabel}
            </span>
          )}
          <span className="absolute inset-x-1 bottom-1 flex justify-between rounded-lg bg-white/90 opacity-100 shadow-sm sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)} className={SMALL_BTN}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Remove photo" onClick={() => onChange(photos.filter((_, j) => j !== i))} className={`${SMALL_BTN} hover:text-red-600`}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" aria-label="Move later" disabled={i === photos.length - 1} onClick={() => move(i, 1)} className={SMALL_BTN}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </span>
        </div>
      ))}
      {Array.from({ length: uploading }, (_, i) => (
        <div key={`up-${i}`} className={`flex ${tile} items-center justify-center rounded-2xl border border-dashed border-[#C7D2FE] bg-[#F5F8FC]`}>
          <Loader2 className="h-5 w-5 animate-spin text-[#3D4FE0]" />
        </div>
      ))}
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={`flex ${tile} shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#C7D2FE] bg-[#FAFBFE] text-xs font-semibold text-[#3D4FE0] transition-colors hover:border-[#3D4FE0] hover:bg-[#EEF1FF]`}
      >
        <ImagePlus className="h-5 w-5" />
        Add photos
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) void add(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ── The form ────────────────────────────────────────────────────────────

function ProductFormPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isNew = !slug;

  const [options, setOptions] = useState<Options | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [form, setForm] = useState<Listing>(EMPTY);
  const [loadError, setLoadError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState<Status | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ message: string; status: Status } | null>(null);
  const [saved, setSaved] = useState('');
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);
  // Specs the category does not ask for, edited as free rows.
  const [extraSpecs, setExtraSpecs] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    apiFetch<Options>('/admin/products/options').then(setOptions).catch(() => setLoadError('Could not load the form. Please reload.'));
  }, []);

  const applyLoaded = useCallback((data: Loaded) => {
    setLoaded(data);
    const { slug: _s, sapCodes: _c, ...listing } = data as Loaded & { checklist?: unknown; updatedAt?: unknown };
    delete (listing as { checklist?: unknown }).checklist;
    delete (listing as { updatedAt?: unknown }).updatedAt;
    setForm({ ...EMPTY, ...listing, highlights: listing.highlights.length ? listing.highlights : ['', '', ''] });
    setDirty(false);
  }, []);

  useEffect(() => {
    if (isNew) {
      setLoaded(null);
      setForm(EMPTY);
      return;
    }
    apiFetch<Loaded>(`/admin/products/${slug}`)
      .then(applyLoaded)
      .catch((err) => setLoadError(err instanceof ApiError && err.status === 404 ? 'There is no product at this address.' : 'Could not load this product.'));
  }, [slug, isNew, applyLoaded]);

  const category = options?.categories.find((c) => c.slug === form.categorySlug);
  const specFields = category?.specFields ?? [];

  // Split the stored specs into the category's fields and the rest whenever
  // the product or its category changes.
  useEffect(() => {
    const templated = new Set(specFields.map((f) => f.label.toLowerCase()));
    setExtraSpecs(form.specs.filter((s) => !templated.has(s.label.toLowerCase())));
  }, [loaded, form.categorySlug, options]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback((patch: Partial<Listing>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
    setSaved('');
  }, []);

  const specValue = (label: string) => form.specs.find((s) => s.label.toLowerCase() === label.toLowerCase())?.value ?? '';
  const setSpec = (label: string, value: string) => {
    const others = form.specs.filter((s) => s.label.toLowerCase() !== label.toLowerCase());
    update({ specs: [...others, { label, value }] });
  };
  const setExtra = (rows: { label: string; value: string }[]) => {
    setExtraSpecs(rows);
    const templated = new Set(specFields.map((f) => f.label.toLowerCase()));
    update({ specs: [...form.specs.filter((s) => templated.has(s.label.toLowerCase())), ...rows] });
  };

  /** The specs in the order the product page shows them: the category's
   *  fields first, then the rest. */
  const orderedSpecs = useMemo(() => {
    const out = specFields.map((f) => ({ label: f.label, value: specValue(f.label) })).filter((s) => s.value.trim());
    return [...out, ...extraSpecs.filter((s) => s.label.trim() && s.value.trim())];
  }, [form.specs, extraSpecs, specFields]); // eslint-disable-line react-hooks/exhaustive-deps

  const sapCodes = loaded?.sapCodes ?? [];
  const linked = sapCodes.length > 0;
  const status = loaded?.status ?? 'DRAFT';
  const checks = checklist({ ...form, specs: orderedSpecs }, specFields, linked, status === 'ACTIVE');
  const ready = checks.blocking.length === 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function save(to: Status, confirmPriceChange = false) {
    setSaving(to);
    setProblems([]);
    setConfirm(null);
    setSaved('');
    const body = {
      ...form,
      status: to,
      highlights: form.highlights.filter((h) => h.trim()),
      specs: orderedSpecs,
      colours: form.colours.map((c) => ({ ...c, family: c.family.length ? c.family : c.name.toLowerCase().split(/\s+/).filter(Boolean) })),
      ...(confirmPriceChange && { confirmPriceChange: true }),
    };
    try {
      const result = await apiFetch<Loaded>(isNew ? '/admin/products' : `/admin/products/${slug}`, { method: isNew ? 'POST' : 'PUT', body });
      applyLoaded(result);
      setSaved(
        to === 'ACTIVE' && status !== 'ACTIVE'
          ? 'Published. The product shows on the shop within a minute.'
          : to === 'INACTIVE' && status === 'ACTIVE'
            ? 'Taken off the shop.'
            : 'Saved.',
      );
      if (isNew) navigate(`/admin/products/${result.slug}`, { replace: true });
    } catch (err) {
      const data = err instanceof ApiError ? (err.body as { message?: unknown; problems?: string[]; needsConfirmation?: boolean } | undefined) : undefined;
      if (data?.needsConfirmation) setConfirm({ message: String(data.message), status: to });
      else if (data?.problems?.length) setProblems(data.problems);
      else if (Array.isArray(data?.message)) setProblems(data.message.map(String));
      else setProblems([err instanceof ApiError ? err.message : 'Could not save. Please try again.']);
    } finally {
      setSaving(null);
    }
  }

  const photoError = (message: string) => setPhotoErrors((list) => [...list, message]);

  if (loadError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className={`${CARD} px-6 py-12 text-center`}>
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-3 font-dm-sans text-lg font-bold text-[#061A40]">{loadError}</p>
          <Link to="/admin/products" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3D4FE0]">
            <ArrowLeft className="h-4 w-4" /> Back to products
          </Link>
        </div>
      </main>
    );
  }
  if (!options || (!isNew && !loaded)) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#9CA3AF]" />
      </div>
    );
  }

  const singleEanError = form.ean && !isValidGtin(form.ean) ? 'These digits are not a valid EAN: check for a typo.' : null;
  const mrpError = form.mrpInPaise != null && form.priceInPaise > form.mrpInPaise ? 'The selling price is above the MRP.' : null;
  const previewPrice = linked ? Math.min(...sapCodes.map((s) => s.mopInPaise)) : form.priceInPaise;
  const previewMrp = linked ? sapCodes.find((s) => s.mopInPaise === previewPrice)?.mrpInPaise ?? null : form.mrpInPaise;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6">
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#061A40]">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
            {isNew ? 'Add a product' : form.name || 'Untitled product'}
          </h1>
          {!isNew && <p className="mt-1 font-mono text-xs text-[#6B7280]">/product/{loaded!.slug}</p>}
        </div>
        {!isNew && <StatusPill status={status} />}
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          {/* Basics */}
          <Section id="basics" icon={Tag} title="Basics" hint="What the product is. The title is what shoppers see on the card and the product page.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Product title" required hint={isNew ? "The product's web address is made from this when you first save." : undefined}>
                  <input value={form.name} onChange={(e) => update({ name: e.target.value })} maxLength={200} placeholder="e.g. HP 15s Laptop (13th Gen Core i5, 16 GB, 512 GB SSD, Windows 11)" className={INPUT} />
                </Field>
              </div>
              <Field label="Category" required>
                <select value={form.categorySlug} onChange={(e) => update({ categorySlug: e.target.value })} className={INPUT}>
                  <option value="">Choose a category</option>
                  {options.categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Brand" required hint="Pick one, or type a new brand.">
                <input list="brand-options" value={form.brandName} onChange={(e) => update({ brandName: e.target.value })} maxLength={60} placeholder="e.g. HP" className={INPUT} />
                <datalist id="brand-options">
                  {options.brands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </Field>
              <Field label="Model number">
                <TextInput value={form.modelNumber} onChange={(v) => update({ modelNumber: v })} maxLength={60} placeholder="e.g. 15s-fq5111TU" />
              </Field>
              <Field label="Manufacturer part number">
                <TextInput value={form.partNumber} onChange={(v) => update({ partNumber: v })} maxLength={60} placeholder="e.g. 7K0Y1PA" />
              </Field>
            </div>
          </Section>

          {/* Price & stock */}
          <Section id="price" icon={ReceiptText} title="Price & stock" hint="Prices include GST.">
            {linked && (
              <div className="mb-5 rounded-xl border border-[#C7D2FE] bg-[#EEF1FF] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#061A40]">
                  <Link2 className="h-4 w-4 text-[#3D4FE0]" />
                  Price and stock come from the SAP sheet
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#374151]">
                  The shop shows these. To change them, update the SAP sheet and import it; to unlink, use the SAP import page.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-xs">
                    <thead className="text-[#6B7280]">
                      <tr>
                        <th className="py-1 pr-3 font-semibold">SAP code</th>
                        <th className="py-1 pr-3 font-semibold">Colour</th>
                        <th className="py-1 pr-3 font-semibold">Selling price</th>
                        <th className="py-1 pr-3 font-semibold">MRP</th>
                        <th className="py-1 font-semibold">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#061A40]">
                      {sapCodes.map((s) => (
                        <tr key={s.sapCode}>
                          <td className="py-1 pr-3 font-mono">{s.sapCode}</td>
                          <td className="py-1 pr-3">{s.websiteColour ?? 'Whole product'}</td>
                          <td className="py-1 pr-3 font-semibold tabular-nums">{rupees(s.mopInPaise)}</td>
                          <td className="py-1 pr-3 tabular-nums">{rupees(s.mrpInPaise)}</td>
                          <td className="py-1 tabular-nums">{s.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={linked ? 'Catalogue selling price' : 'Selling price'} required={!linked} error={mrpError} hint={linked ? 'Used only if the SAP code is unlinked.' : undefined}>
                <MoneyInput paise={form.priceInPaise || null} onChange={(p) => update({ priceInPaise: p ?? 0 })} disabled={linked} placeholder="e.g. 52990" />
              </Field>
              <Field label="MRP" hint="The printed maximum retail price.">
                <MoneyInput paise={form.mrpInPaise} onChange={(p) => update({ mrpInPaise: p })} disabled={linked} placeholder="e.g. 61990" />
              </Field>
              <Field label="Availability">
                <select value={form.inStock ? 'yes' : 'no'} onChange={(e) => update({ inStock: e.target.value === 'yes' })} disabled={linked} className={INPUT}>
                  <option value="yes">In stock</option>
                  <option value="no">Out of stock</option>
                </select>
              </Field>
            </div>
            {!linked && form.mrpInPaise != null && form.priceInPaise > 0 && form.priceInPaise < form.mrpInPaise && (
              <p className="mt-3 text-xs font-semibold text-emerald-700">
                Shoppers see {Math.round(((form.mrpInPaise - form.priceInPaise) / form.mrpInPaise) * 100)}% off the MRP.
              </p>
            )}
          </Section>

          {/* Barcode & tax */}
          <Section id="barcode" icon={Barcode} title="Barcode & tax" hint="The EAN is the number under the barcode on the box (8, 12, 13 or 14 digits).">
            <div className="grid gap-4 sm:grid-cols-3">
              {form.colours.length === 0 ? (
                <Field label="EAN / UPC" error={singleEanError}>
                  <TextInput value={form.ean} onChange={(v) => update({ ean: v?.replace(/\D/g, '') || null })} inputMode="numeric" maxLength={14} placeholder="e.g. 8901234567890" />
                </Field>
              ) : (
                <div className="flex items-start gap-2 rounded-xl bg-[#F5F8FC] px-3.5 py-3 text-xs leading-relaxed text-[#6B7280] sm:col-span-1">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Each colour has its own EAN, under Colours.
                </div>
              )}
              <Field label="HSN code" hint="4 to 8 digits, for GST invoices.">
                <TextInput value={form.hsnCode} onChange={(v) => update({ hsnCode: v?.replace(/\D/g, '') || null })} inputMode="numeric" maxLength={8} placeholder="e.g. 84713010" />
              </Field>
              <Field label="GST rate">
                <select value={form.gstRatePercent ?? ''} onChange={(e) => update({ gstRatePercent: e.target.value === '' ? null : Number(e.target.value) })} className={INPUT}>
                  <option value="">Choose</option>
                  {options.gstRates.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          {/* Photos */}
          <Section id="photos" icon={ImagePlus} title="Photos" hint="JPG, PNG or WebP, at least 500 × 500 pixels, up to 5 MB each. A plain white background works best. Drag photos here, or use Add photos.">
            <PhotoStrip photos={form.gallery} onChange={(gallery) => update({ gallery })} mainLabel="Main" onError={photoError} />
            {photoErrors.length > 0 && (
              <ul className="mt-3 space-y-1 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {photoErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                <li>
                  <button type="button" onClick={() => setPhotoErrors([])} className="font-semibold underline">
                    Dismiss
                  </button>
                </li>
              </ul>
            )}
          </Section>

          {/* Highlights */}
          <Section id="highlights" icon={ListChecks} title="Key highlights" hint="The short points shown beside the photos. Three to six works best.">
            <div className="flex flex-col gap-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-[#9CA3AF]">{i + 1}</span>
                  <input
                    value={h}
                    maxLength={1000}
                    onChange={(e) => update({ highlights: form.highlights.map((x, j) => (j === i ? e.target.value : x)) })}
                    placeholder={['e.g. 13th Gen Intel Core i5 processor', 'e.g. 16 GB RAM, 512 GB SSD', 'e.g. 39.6 cm (15.6) Full HD display'][i] ?? 'Another highlight'}
                    className={INPUT}
                  />
                  <button type="button" aria-label="Remove highlight" onClick={() => update({ highlights: form.highlights.filter((_, j) => j !== i) })} className={`${SMALL_BTN} hover:text-red-600`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {form.highlights.length < 30 && (
                <button type="button" onClick={() => update({ highlights: [...form.highlights, ''] })} className="mt-1 flex w-fit items-center gap-1.5 text-sm font-semibold text-[#3D4FE0]">
                  <Plus className="h-4 w-4" /> Add a highlight
                </button>
              )}
            </div>
          </Section>

          {/* Specifications */}
          <Section
            id="specs"
            icon={FileText}
            title="Specifications"
            hint={category ? (specFields.length ? `The details shoppers compare for ${category.name.toLowerCase()}. Starred ones are needed to publish.` : 'Add the details shoppers compare, as label and value.') : 'Choose a category first.'}
          >
            {specFields.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {specFields.map((f) => (
                  <Field key={f.label} label={f.label} required={f.required}>
                    <input value={specValue(f.label)} onChange={(e) => setSpec(f.label, e.target.value)} maxLength={3000} placeholder={f.placeholder} className={INPUT} />
                  </Field>
                ))}
              </div>
            )}
            <div className={specFields.length ? 'mt-5 border-t border-[#EEF0F6] pt-4' : ''}>
              {specFields.length > 0 && <p className="mb-2 text-xs font-semibold text-[#374151]">More specifications</p>}
              <div className="flex flex-col gap-2">
                {extraSpecs.map((s, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-center gap-2">
                    <input value={s.label} maxLength={80} placeholder="Label, e.g. Warranty" onChange={(e) => setExtra(extraSpecs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={INPUT} />
                    <input value={s.value} maxLength={3000} placeholder="Value" onChange={(e) => setExtra(extraSpecs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className={INPUT} />
                    <button type="button" aria-label="Remove specification" onClick={() => setExtra(extraSpecs.filter((_, j) => j !== i))} className={`${SMALL_BTN} hover:text-red-600`}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setExtra([...extraSpecs, { label: '', value: '' }])} className="mt-1 flex w-fit items-center gap-1.5 text-sm font-semibold text-[#3D4FE0]">
                  <Plus className="h-4 w-4" /> Add a specification
                </button>
              </div>
            </div>
          </Section>

          {/* Description */}
          <Section id="description" icon={FileText} title="Description, warranty & box">
            <div className="grid gap-4">
              <Field label="Description" hint="Shown under the specifications.">
                <textarea
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  maxLength={8000}
                  rows={5}
                  placeholder="What it is good for, in a few sentences."
                  className={`${INPUT} h-auto py-3 leading-relaxed`}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Warranty">
                  <TextInput value={form.warranty} onChange={(v) => update({ warranty: v })} maxLength={300} placeholder="e.g. 1 year onsite manufacturer warranty" />
                </Field>
                <Field label="In the box">
                  <TextInput value={form.inTheBox} onChange={(v) => update({ inTheBox: v })} maxLength={500} placeholder="e.g. Laptop, 65 W adapter, user guide" />
                </Field>
              </div>
            </div>
          </Section>

          {/* Colours */}
          <Section id="colours" icon={Palette} title="Colours" hint="Only if the product comes in colours. Each colour gets its own swatch, photos and EAN; shoppers pick one on the product page.">
            <div className="flex flex-col gap-4">
              {form.colours.map((c, i) => {
                const lockedBySap = sapCodes.some((s) => s.websiteColour === c.key) && loaded?.colours.some((x) => x.key === c.key);
                const eanError = c.ean && !isValidGtin(c.ean) ? 'Not a valid EAN.' : null;
                const setColour = (patch: Partial<Colour>) => update({ colours: form.colours.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
                return (
                  <div key={i} className="rounded-2xl border border-[#E5E7EB] p-4">
                    <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                      <Field label="Swatch">
                        <input type="color" value={c.hex} onChange={(e) => setColour({ hex: e.target.value.toUpperCase() })} className="h-11 w-14 cursor-pointer rounded-xl border border-[#E5E7EB] bg-white p-1" />
                      </Field>
                      <Field label="Colour name" required>
                        <input
                          value={c.name}
                          maxLength={40}
                          onChange={(e) => {
                            const isNewColour = !loaded?.colours.some((x) => x.key === c.key);
                            const key = isNewColour ? slugify(e.target.value) || `colour-${i + 1}` : c.key;
                            setColour({ name: e.target.value, key, family: [] });
                          }}
                          placeholder="e.g. Midnight Blue"
                          className={INPUT}
                        />
                      </Field>
                      <Field label="EAN" error={eanError}>
                        <TextInput value={c.ean} onChange={(v) => setColour({ ean: v?.replace(/\D/g, '') || null })} inputMode="numeric" maxLength={14} placeholder="e.g. 8901234567890" />
                      </Field>
                      <Field label="Availability">
                        <select
                          value={c.inStock === null ? 'same' : c.inStock ? 'yes' : 'no'}
                          onChange={(e) => setColour({ inStock: e.target.value === 'same' ? null : e.target.value === 'yes' })}
                          className={INPUT}
                        >
                          <option value="same">Same as product</option>
                          <option value="yes">In stock</option>
                          <option value="no">Out of stock</option>
                        </select>
                      </Field>
                      <button
                        type="button"
                        disabled={!!lockedBySap}
                        title={lockedBySap ? 'A SAP code is linked to this colour: unlink it on the SAP import page first.' : 'Remove this colour'}
                        onClick={() => update({ colours: form.colours.filter((_, j) => j !== i) })}
                        className="flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#6B7280]"
                      >
                        {lockedBySap ? <Lock className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        <span className="sm:sr-only">Remove</span>
                      </button>
                    </div>
                    <p className="mt-3 mb-2 text-xs font-semibold text-[#374151]">Photos of {c.name || 'this colour'}</p>
                    <PhotoStrip photos={c.images} onChange={(images) => setColour({ images })} size="sm" onError={photoError} />
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => update({ colours: [...form.colours, { key: `colour-${form.colours.length + 1}`, name: '', hex: '#1F2C46', family: [], images: [], inStock: null, ean: null }] })}
                className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#3D4FE0]"
              >
                <Plus className="h-4 w-4" /> Add a colour
              </button>
            </div>
          </Section>
        </div>

        {/* Right: checklist, preview, actions */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className={`${CARD} overflow-hidden`}>
            <div className="border-b border-[#EEF0F6] px-5 py-4">
              <h2 className="font-dm-sans text-[17px] font-bold text-[#061A40]">{ready ? 'Ready to publish' : 'Before publishing'}</h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                {ready ? (checks.warnings.length ? 'A few things would make the listing better.' : 'Everything is filled in.') : 'These are needed for the shop.'}
              </p>
            </div>
            <ul className="max-h-[40vh] space-y-2 overflow-y-auto px-5 py-4 text-sm">
              {checks.blocking.map((b) => (
                <li key={b} className="flex items-start gap-2 text-red-600">
                  <X className="mt-0.5 h-4 w-4 shrink-0" />
                  {b}
                </li>
              ))}
              {checks.warnings.map((w) => (
                <li key={w} className="flex items-start gap-2 text-amber-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {w}
                </li>
              ))}
              {ready && checks.warnings.length === 0 && (
                <li className="flex items-start gap-2 text-emerald-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  Title, photos, price, specs, barcode and tax details are all in.
                </li>
              )}
            </ul>

            <div className="flex flex-col gap-2 border-t border-[#EEF0F6] bg-[#FAFBFE] p-4">
              {problems.length > 0 && (
                <ul className="mb-1 space-y-1 rounded-xl bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700" role="alert">
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              {confirm && (
                <div className="mb-1 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-900" role="alert">
                  <p className="font-semibold">{confirm.message}</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => void save(confirm.status, true)} className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700">
                      Yes, save it
                    </button>
                    <button type="button" onClick={() => setConfirm(null)} className="rounded-lg px-3 py-1.5 font-semibold text-amber-900 hover:bg-amber-100">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {saved && (
                <p className="mb-1 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700" role="status">
                  <Check className="h-4 w-4" /> {saved}
                </p>
              )}

              {status === 'ACTIVE' ? (
                <>
                  <button type="button" disabled={!!saving || !ready || !dirty} onClick={() => void save('ACTIVE')} className={PRIMARY}>
                    {saving === 'ACTIVE' ? 'Saving…' : 'Save changes'}
                  </button>
                  <button type="button" disabled={!!saving} onClick={() => void save('INACTIVE')} className={SECONDARY}>
                    {saving === 'INACTIVE' ? 'Saving…' : 'Take off the shop'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" disabled={!!saving || !ready} onClick={() => void save('ACTIVE')} className={PRIMARY}>
                    {saving === 'ACTIVE' ? 'Publishing…' : status === 'INACTIVE' ? 'Put back on the shop' : 'Publish'}
                    {saving !== 'ACTIVE' && <ArrowRight className="h-4 w-4" />}
                  </button>
                  <button type="button" disabled={!!saving || (!dirty && !isNew)} onClick={() => void save(status)} className={SECONDARY}>
                    {saving === status ? 'Saving…' : status === 'INACTIVE' ? 'Save' : 'Save draft'}
                  </button>
                </>
              )}
              {dirty && <p className="text-center text-[11px] text-[#6B7280]">You have unsaved changes.</p>}
            </div>
          </div>

          {/* Preview */}
          <div className={`${CARD} p-4`}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Shop card preview</p>
            <div className="overflow-hidden rounded-2xl border border-[#EEF0F6]">
              <div className="relative aspect-square bg-gradient-to-br from-[#F5F8FC] to-[#EAEFFA]">
                {form.gallery[0] ? (
                  <img src={form.gallery[0]} alt="" className="absolute inset-0 h-full w-full object-contain p-6 mix-blend-multiply" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-[#9CA3AF]">No photo yet</span>
                )}
              </div>
              <div className="p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3D4FE0]">{form.brandName || 'Brand'}</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-[#061A40] line-clamp-2">{form.name || 'Product title'}</p>
                <p className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="font-dm-sans text-lg font-bold tabular-nums" style={{ color: NAVY }}>
                    {previewPrice > 0 ? rupees(previewPrice) : '₹—'}
                  </span>
                  {previewMrp != null && previewMrp > previewPrice && previewPrice > 0 && (
                    <>
                      <span className="text-xs tabular-nums text-[#9CA3AF] line-through">{rupees(previewMrp)}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        {Math.round(((previewMrp - previewPrice) / previewMrp) * 100)}% off
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            {status === 'ACTIVE' && loaded && (
              <a
                href={`/product/${loaded.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-[#3D4FE0] transition-colors hover:bg-[#EEF1FF]"
              >
                View on the shop <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: Status }) {
  const style = { ACTIVE: 'bg-emerald-50 text-emerald-700', DRAFT: 'bg-amber-50 text-amber-700', INACTIVE: 'bg-[#F1F2F6] text-[#6B7280]' }[status];
  const label = { ACTIVE: 'On the shop', DRAFT: 'Draft', INACTIVE: 'Off the shop' }[status];
  return <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${style}`}>{label}</span>;
}

export default function ProductForm() {
  return (
    <AdminShell>
      <ProductFormPage />
    </AdminShell>
  );
}
