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
  Landmark,
  Link2,
  ListChecks,
  Loader2,
  Lock,
  Package,
  Palette,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  Type,
  Video,
  X,
} from 'lucide-react';
import AdminShell from './AdminShell';
import ProductHistory from './ProductHistory';
import SkuLinker, { type LinkedCode } from './SkuLinker';
import { ApiError, apiFetch } from '../../lib/api-client';
import { buildTitle, checkListing, isValidGtin, MIN_HIGHLIGHTS, pickTitleFormat, suggestHighlights, type TitleFormatRule } from '../../lib/listing-shared';

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
  /** Asked for with the variant (RAM, storage). */
  variant?: boolean;
  group?: string;
  options?: string[];
}
interface Options {
  categories: { slug: string; name: string; specFields: SpecField[] }[];
  brands: string[];
  gstRates: number[];
  /** The admin's own title formats (the built-in ones are shared code). */
  titleFormats: TitleFormatRule[];
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
  titleAuto: boolean;
  modelName: string | null;
  modelNumber: string | null;
  partNumber: string | null;
  variant: string | null;
  ean: string | null;
  hsnCode: string | null;
  gstRatePercent: number | null;
  warranty: string | null;
  warrantyPeriod: string | null;
  warrantyServiceType: string | null;
  warrantyCovered: string | null;
  inTheBox: string | null;
  countryOfOrigin: string | null;
  manufacturerDetails: string | null;
  packerDetails: string | null;
  importerDetails: string | null;
  packageLengthCm: number | null;
  packageBreadthCm: number | null;
  packageHeightCm: number | null;
  packageWeightKg: number | null;
  videoUrl: string | null;
  colours: Colour[];
}
type SapCode = LinkedCode;
interface Loaded extends Listing {
  slug: string;
  sapCodes: SapCode[];
  updatedAt?: string;
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
  highlights: ['', '', '', ''],
  specs: [],
  description: '',
  // A new listing's title is built from its brand's format.
  titleAuto: true,
  modelName: null,
  modelNumber: null,
  partNumber: null,
  variant: null,
  ean: null,
  hsnCode: null,
  gstRatePercent: null,
  warranty: null,
  warrantyPeriod: null,
  warrantyServiceType: null,
  warrantyCovered: null,
  inTheBox: null,
  countryOfOrigin: null,
  manufacturerDetails: null,
  packerDetails: null,
  importerDetails: null,
  packageLengthCm: null,
  packageBreadthCm: null,
  packageHeightCm: null,
  packageWeightKg: null,
  videoUrl: null,
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

/** The publish checklist: the server's own rules (listing-rules.ts), plus a
 *  barcode typo caught as it is typed. */
function checklist(l: Listing, linkedToSap: boolean, publishedBefore: boolean) {
  const { blocking, warnings } = checkListing(l, linkedToSap, publishedBefore);
  const badEan = [l.colours.length === 0 ? l.ean : null, ...l.colours.map((c) => c.ean)].filter((e): e is string => !!e && !isValidGtin(e));
  if (badEan.length) blocking.unshift(`Fix the EAN ${badEan[0]}: the digits do not check out.`);
  return { blocking, warnings };
}

/** A number box for an optional measurement. */
function NumberInput({ value, onChange, placeholder, step = 'any' }: { value: number | null; onChange: (v: number | null) => void; placeholder?: string; step?: string }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      step={step}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className={INPUT}
    />
  );
}

/** The photo positions shoppers expect, as marketplaces ask for them. */
const PHOTO_VIEWS = ['Main (front)', 'Back', 'Side', 'Diagonal', 'Close-up'];

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
  labels,
  size = 'lg',
  onError,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  /** What each position shows (main, back, side…); the first is the main photo. */
  labels?: string[];
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
          {labels?.[i] && (
            <span
              className={`absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${i === 0 ? 'bg-[#061A40] text-white' : 'bg-white/90 text-[#374151] shadow-sm'}`}
            >
              {i === 0 && <Star className="h-2.5 w-2.5" />} {labels[i]}
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
  const [deleting, setDeleting] = useState<'ask' | 'busy' | null>(null);
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
    setForm({ ...EMPTY, ...listing, highlights: listing.highlights.length ? listing.highlights : ['', '', '', ''] });
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

  // The title from the brand's format, as the server will save it: the
  // brand as the site spells it, the first colour's name.
  const brand = options?.brands.find((b) => b.toLowerCase() === form.brandName.trim().toLowerCase()) ?? form.brandName.trim();
  const titleFormat = options && form.categorySlug ? pickTitleFormat(brand, form.categorySlug, options.titleFormats) : null;
  const titleFor = (colour: string | null) =>
    titleFormat
      ? buildTitle(titleFormat.pattern, { brand, modelName: form.modelName, modelNumber: form.modelNumber, variant: form.variant, specs: orderedSpecs }, colour)
      : '';
  const autoTitle = titleFor(form.colours[0]?.name.trim() || null);
  const effective: Listing = { ...form, name: form.titleAuto && autoTitle.length >= 3 ? autoTitle : form.name, specs: orderedSpecs };

  // Published before (on or taken off the shop): most of the checklist is
  // asked for, not demanded, as the server does.
  const checks = checklist(effective, linked, !isNew && status !== 'DRAFT');
  const ready = checks.blocking.length === 0;

  /** After a SAP code is linked or unlinked here: its codes, price and stock. */
  const refreshSap = useCallback(() => {
    if (!slug) return;
    apiFetch<Loaded>(`/admin/products/${slug}`)
      .then((data) => setLoaded((prev) => (prev ? { ...prev, sapCodes: data.sapCodes } : prev)))
      .catch(() => undefined);
  }, [slug]);

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
      name: effective.name,
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

  async function remove() {
    if (!loaded) return;
    setDeleting('busy');
    setProblems([]);
    try {
      await apiFetch(`/admin/products/${loaded.slug}`, { method: 'DELETE' });
      setDirty(false);
      navigate(`/admin/products?status=deleted&done=${encodeURIComponent(form.name || loaded.slug)}`);
    } catch (err) {
      setDeleting(null);
      setProblems([err instanceof ApiError ? err.message : 'Could not delete. Please try again.']);
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
  // What the shop shows, and the discount off the MRP.
  const shownPrice = previewPrice;
  const shownMrp = previewMrp;
  const discount = shownMrp && shownPrice > 0 && shownPrice < shownMrp ? Math.round(((shownMrp - shownPrice) / shownMrp) * 100) : 0;

  // RAM and storage are asked for with the variant; the other spec fields
  // under their headings.
  const variantFields = specFields.filter((f) => f.variant);
  const specGroups = [...specFields.filter((f) => !f.variant).reduce((groups, f) => groups.set(f.group ?? '', [...(groups.get(f.group ?? '') ?? []), f]), new Map<string, SpecField[]>())];

  const suggested = suggestHighlights(form.categorySlug, orderedSpecs);
  /** Adds the highlights the specs give that are not there yet, into the
   *  empty rows first. */
  const fillHighlights = () => {
    const have = new Set(form.highlights.map((h) => h.trim().toLowerCase()).filter(Boolean));
    const adding = suggested.filter((s) => !have.has(s.toLowerCase()));
    const next = [...form.highlights];
    for (const h of adding) {
      const blank = next.findIndex((x) => !x.trim());
      if (blank >= 0) next[blank] = h;
      else next.push(h);
    }
    update({ highlights: next });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6">
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#061A40]">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
            {isNew ? 'Add a product' : effective.name || 'Untitled product'}
          </h1>
          {!isNew && <p className="mt-1 font-mono text-xs text-[#6B7280]">/product/{loaded!.slug}</p>}
        </div>
        {!isNew && <StatusPill status={status} />}
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          {/* 1-3: brand, SKU, model and variant */}
          <Section id="basics" icon={Tag} title="Brand, SKU, model & variant" hint="What the product is. The title below is built from these.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" required hint="Decides the spec fields asked for below.">
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
                <input list="brand-options" value={form.brandName} onChange={(e) => update({ brandName: e.target.value })} maxLength={60} placeholder="e.g. Samsung" className={INPUT} />
                <datalist id="brand-options">
                  {options.brands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </Field>
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-[#374151]">SKU (SAP / ERP code)</span>
                <SkuLinker slug={loaded?.slug ?? null} colours={loaded?.colours ?? []} codes={sapCodes} onChanged={refreshSap} />
              </div>
              <Field label="Model name" required hint={'As the maker names it, e.g. "Galaxy S24 5G".'}>
                <TextInput value={form.modelName} onChange={(v) => update({ modelName: v })} maxLength={120} placeholder="e.g. Galaxy S24 5G" />
              </Field>
              <Field label="Model number (model ID)" hint={'The maker\'s code, e.g. "SM-S921BZKCINS".'}>
                <TextInput value={form.modelNumber} onChange={(v) => update({ modelNumber: v })} maxLength={60} placeholder="e.g. SM-S921BZKCINS" />
              </Field>
              <Field label="Manufacturer part number">
                <TextInput value={form.partNumber} onChange={(v) => update({ partNumber: v })} maxLength={60} placeholder="e.g. 7K0Y1PA" />
              </Field>
              {variantFields.length > 0 ? (
                variantFields.map((f) => (
                  <Field key={f.label} label={`Variant: ${f.label}`} required={f.required}>
                    <input value={specValue(f.label)} onChange={(e) => setSpec(f.label, e.target.value)} maxLength={100} placeholder={f.placeholder} className={INPUT} />
                  </Field>
                ))
              ) : (
                <Field label="Variant" hint="What sets this version apart, if anything.">
                  <TextInput value={form.variant} onChange={(v) => update({ variant: v })} maxLength={80} placeholder="e.g. 650 VA, or 1 Year 1 User" />
                </Field>
              )}
            </div>
          </Section>

          {/* 4: colour */}
          {/* Colours */}
          <Section id="colours" icon={Palette} title="Colour" hint="Each colour gets its own swatch, photos and EAN; shoppers pick one on the product page. Link a SAP code to a colour under SKU once saved.">
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


          {/* 4: the title */}
          <Section id="title" icon={Type} title="Product title" hint="What shoppers see on the card and the product page.">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F1F2F6] p-1 text-sm font-semibold sm:w-fit">
                {(
                  [
                    [true, 'Automatic'],
                    [false, 'Written by hand'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={form.titleAuto === value}
                    onClick={() => update(value ? { titleAuto: true } : { titleAuto: false, name: form.name || autoTitle })}
                    className={`rounded-lg px-4 py-1.5 transition-colors ${form.titleAuto === value ? 'bg-white text-[#061A40] shadow-sm' : 'text-[#6B7280] hover:text-[#061A40]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {form.titleAuto ? (
                <>
                  <p className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFE] px-4 py-3 font-semibold leading-snug text-[#061A40]">
                    {autoTitle.length >= 3 ? autoTitle : <span className="font-normal text-[#9CA3AF]">Fill in the brand, model and variant to build the title.</span>}
                  </p>
                  {form.colours.length > 1 && (
                    <ul className="space-y-0.5 text-xs text-[#6B7280]">
                      {form.colours.slice(1).map((c) => (
                        <li key={c.key}>With {c.name || 'another colour'} chosen: {titleFor(c.name.trim() || null)}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-[#6B7280]">
                    Format for {brand || 'this brand'} {category ? `in ${category.name}` : ''}: <code className="rounded bg-[#F1F2F6] px-1.5 py-0.5">{titleFormat?.pattern ?? 'choose a category'}</code>{' '}
                    <Link to="/admin/title-formats" className="font-semibold text-[#3D4FE0]">
                      Change formats
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <input value={form.name} onChange={(e) => update({ name: e.target.value })} maxLength={200} placeholder="The full product title" className={INPUT} />
                  {autoTitle.length >= 3 && autoTitle !== form.name && (
                    <p className="text-xs text-[#6B7280]">
                      Suggested: <span className="font-semibold text-[#061A40]">{autoTitle}</span>{' '}
                      <button type="button" onClick={() => update({ titleAuto: true })} className="font-semibold text-[#3D4FE0]">
                        Use suggested title
                      </button>
                    </p>
                  )}
                </>
              )}
              {isNew && <p className="text-xs text-[#6B7280]">The product's web address is made from the title when you first save.</p>}
            </div>
          </Section>

          {/* 5-7: MRP, selling price, discount */}
          <Section id="price" icon={ReceiptText} title="MRP, selling price & discount" hint="Prices include GST.">
            {linked && (
              <p className="mb-4 flex items-start gap-2 rounded-xl border border-[#C7D2FE] bg-[#EEF1FF] px-4 py-3 text-xs leading-relaxed text-[#374151]">
                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3D4FE0]" />
                The SAP sheet sets the price, MRP and stock of this product (SKU above). The shop shows {rupees(shownPrice)}
                {shownMrp ? `, MRP ${rupees(shownMrp)}` : ''}. The boxes below are used only if the SAP code is unlinked.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="MRP" required={!linked} hint="The printed maximum retail price.">
                <MoneyInput paise={form.mrpInPaise} onChange={(p) => update({ mrpInPaise: p })} disabled={linked} placeholder="e.g. 61990" />
              </Field>
              <Field label="Selling price" required={!linked} error={mrpError}>
                <MoneyInput paise={form.priceInPaise || null} onChange={(p) => update({ priceInPaise: p ?? 0 })} disabled={linked} placeholder="e.g. 52990" />
              </Field>
              <Field label="Discount" hint="Worked out from the two prices.">
                <span className={`${INPUT} flex items-center bg-[#F5F8FC] font-semibold ${discount ? 'text-emerald-700' : 'text-[#9CA3AF]'}`}>
                  {discount ? `${discount}% off` : '—'}
                </span>
              </Field>
              <Field label="Availability">
                <select value={form.inStock ? 'yes' : 'no'} onChange={(e) => update({ inStock: e.target.value === 'yes' })} disabled={linked} className={INPUT}>
                  <option value="yes">In stock</option>
                  <option value="no">Out of stock</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* 8-10: EAN, tax, HSN */}
          <Section id="barcode" icon={Barcode} title="EAN, tax & HSN" hint="The EAN is the number under the barcode on the box (8, 12, 13 or 14 digits).">
            <div className="grid gap-4 sm:grid-cols-3">
              {form.colours.length === 0 ? (
                <Field label="EAN / UPC" required error={singleEanError}>
                  <TextInput value={form.ean} onChange={(v) => update({ ean: v?.replace(/\D/g, '') || null })} inputMode="numeric" maxLength={14} placeholder="e.g. 8901234567890" />
                </Field>
              ) : (
                <div className="flex items-start gap-2 rounded-xl bg-[#F5F8FC] px-3.5 py-3 text-xs leading-relaxed text-[#6B7280]">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Each colour has its own EAN, under Colour above.
                </div>
              )}
              <Field label="Tax (GST rate)" required>
                <select value={form.gstRatePercent ?? ''} onChange={(e) => update({ gstRatePercent: e.target.value === '' ? null : Number(e.target.value) })} className={INPUT}>
                  <option value="">Choose</option>
                  {options.gstRates.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="HSN code" required hint="4 to 8 digits, for GST invoices.">
                <TextInput value={form.hsnCode} onChange={(v) => update({ hsnCode: v?.replace(/\D/g, '') || null })} inputMode="numeric" maxLength={8} placeholder="e.g. 85171300" />
              </Field>
            </div>
          </Section>

          {/* 11: photos */}
          {/* Photos */}
          <Section id="photos" icon={ImagePlus} title="Photos" hint="In this order: main (front), back, side, diagonal, close-up. JPG, PNG or WebP, at least 500 × 500 pixels, up to 5 MB each, on a plain white background. Drag photos here, or use Add photos.">
            <PhotoStrip photos={form.gallery} onChange={(gallery) => update({ gallery })} labels={PHOTO_VIEWS} onError={photoError} />
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


          {/* 12: highlights */}
          <Section
            id="highlights"
            icon={ListChecks}
            title="Key highlights"
            hint={`At least ${MIN_HIGHLIGHTS}: the variant (RAM and storage), battery, screen size and processor. Shown beside the photos.`}
          >
            <div className="flex flex-col gap-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-[#9CA3AF]">{i + 1}</span>
                  <input
                    value={h}
                    maxLength={1000}
                    onChange={(e) => update({ highlights: form.highlights.map((x, j) => (j === i ? e.target.value : x)) })}
                    placeholder={['e.g. 8 GB RAM | 256 GB ROM', 'e.g. 5000 mAh Battery', 'e.g. 6.7 inch Display', 'e.g. Snapdragon 8 Gen 3 Processor'][i] ?? 'Another highlight'}
                    className={INPUT}
                  />
                  <button type="button" aria-label="Remove highlight" onClick={() => update({ highlights: form.highlights.filter((_, j) => j !== i) })} className={`${SMALL_BTN} hover:text-red-600`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="mt-1 flex flex-wrap items-center gap-4">
                {form.highlights.length < 30 && (
                  <button type="button" onClick={() => update({ highlights: [...form.highlights, ''] })} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#3D4FE0]">
                    <Plus className="h-4 w-4" /> Add a highlight
                  </button>
                )}
                <button
                  type="button"
                  disabled={suggested.length === 0}
                  onClick={fillHighlights}
                  title={suggested.length ? undefined : 'Fill in the variant and specs first.'}
                  className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#3D4FE0] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
                >
                  <Sparkles className="h-4 w-4" /> Fill from specs
                </button>
              </div>
            </div>
          </Section>

          {/* 13: description */}
          <Section id="description" icon={FileText} title="Product description" hint="Shown under the specifications.">
            <textarea
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              maxLength={8000}
              rows={5}
              placeholder="What it is good for, in a few sentences."
              aria-label="Product description"
              className={`${INPUT} h-auto py-3 leading-relaxed`}
            />
          </Section>

          {/* 14: in the box */}
          <Section id="box" icon={Package} title="What's in the box">
            <TextInput value={form.inTheBox} onChange={(v) => update({ inTheBox: v })} maxLength={500} placeholder="e.g. Handset, USB Type-C cable, SIM ejector pin, user guide" aria-label="What's in the box" />
          </Section>

          {/* Then the rest of the listing sheet: specs */}
          <Section
            id="specs"
            icon={FileText}
            title="Specifications"
            hint={category ? (specFields.length ? `The details shoppers compare for ${category.name.toLowerCase()}. Starred ones are needed to publish a new product.` : 'Add the details shoppers compare, as label and value.') : 'Choose a category first.'}
          >
            {specGroups.map(([group, fields]) => (
              <div key={group || 'main'} className="mb-5 last:mb-0">
                {group && <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6B7280]">{group}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((f) => {
                    const listId = f.options ? `spec-${f.label.replace(/\W+/g, '-')}` : undefined;
                    return (
                      <Field key={f.label} label={f.label} required={f.required}>
                        <input list={listId} value={specValue(f.label)} onChange={(e) => setSpec(f.label, e.target.value)} maxLength={3000} placeholder={f.placeholder} className={INPUT} />
                        {f.options && (
                          <datalist id={listId}>
                            {f.options.map((o) => (
                              <option key={o} value={o} />
                            ))}
                          </datalist>
                        )}
                      </Field>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className={specFields.length ? 'mt-5 border-t border-[#EEF0F6] pt-4' : ''}>
              {specFields.length > 0 && <p className="mb-2 text-xs font-semibold text-[#374151]">More specifications</p>}
              <div className="flex flex-col gap-2">
                {extraSpecs.map((s, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-center gap-2">
                    <input value={s.label} maxLength={80} placeholder="Label, e.g. Body Material" onChange={(e) => setExtra(extraSpecs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={INPUT} />
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

          {/* Warranty */}
          <Section id="warranty" icon={ShieldCheck} title="Warranty">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Warranty summary" hint="One line: the years covered, and domestic or international.">
                  <TextInput value={form.warranty} onChange={(v) => update({ warranty: v })} maxLength={300} placeholder="e.g. 1 year manufacturer warranty for device and 6 months for in-box accessories (domestic)" />
                </Field>
              </div>
              <Field label="Warranty period">
                <TextInput value={form.warrantyPeriod} onChange={(v) => update({ warrantyPeriod: v })} maxLength={100} placeholder="e.g. 1 Year" />
              </Field>
              <Field label="Warranty service type" hint="How the shopper claims it.">
                <TextInput value={form.warrantyServiceType} onChange={(v) => update({ warrantyServiceType: v })} maxLength={300} placeholder="e.g. Visit the nearest authorised service centre" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Covered in warranty">
                  <TextInput value={form.warrantyCovered} onChange={(v) => update({ warrantyCovered: v })} maxLength={1000} placeholder="e.g. Manufacturing defects. Not physical or liquid damage." />
                </Field>
              </div>
            </div>
          </Section>

          {/* Origin and legal details */}
          <Section id="legal" icon={Landmark} title="Origin & legal details" hint="Shown to shoppers, as Indian e-commerce rules require.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Country of origin" required hint="Where it was made, or assembled for an import.">
                <input list="countries" value={form.countryOfOrigin ?? ''} onChange={(e) => update({ countryOfOrigin: e.target.value || null })} maxLength={60} placeholder="e.g. India" className={INPUT} />
                <datalist id="countries">
                  {['India', 'China', 'Vietnam', 'Taiwan', 'South Korea', 'Thailand', 'Malaysia', 'Japan', 'United States'].map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Manufacturer details" required hint="Name and address.">
                <TextInput value={form.manufacturerDetails} onChange={(v) => update({ manufacturerDetails: v })} maxLength={500} placeholder="e.g. Samsung India Electronics Pvt. Ltd., Noida, UP" />
              </Field>
              <Field label="Packer details" hint="Name and address, if not the manufacturer.">
                <TextInput value={form.packerDetails} onChange={(v) => update({ packerDetails: v })} maxLength={500} placeholder="Name and address" />
              </Field>
              <Field label="Importer details" hint="Name and address, for an imported product.">
                <TextInput value={form.importerDetails} onChange={(v) => update({ importerDetails: v })} maxLength={500} placeholder="Name and address" />
              </Field>
            </div>
          </Section>

          {/* Shipping */}
          <Section id="shipping" icon={Truck} title="Package size & weight" hint="Of the box as shipped, for courier charges.">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Length (cm)">
                <NumberInput value={form.packageLengthCm} onChange={(v) => update({ packageLengthCm: v })} placeholder="e.g. 18" />
              </Field>
              <Field label="Breadth (cm)">
                <NumberInput value={form.packageBreadthCm} onChange={(v) => update({ packageBreadthCm: v })} placeholder="e.g. 9" />
              </Field>
              <Field label="Height (cm)">
                <NumberInput value={form.packageHeightCm} onChange={(v) => update({ packageHeightCm: v })} placeholder="e.g. 6" />
              </Field>
              <Field label="Weight (kg)">
                <NumberInput value={form.packageWeightKg} onChange={(v) => update({ packageWeightKg: v })} placeholder="e.g. 0.45" />
              </Field>
            </div>
          </Section>

          {/* Video */}
          <Section id="video" icon={Video} title="Product video" hint="A link to the product's video, such as on YouTube.">
            <Field label="Video link" error={form.videoUrl && !/^https:\/\/\S{4,}$/.test(form.videoUrl) ? 'A video link starts with https://' : null}>
              <TextInput value={form.videoUrl} onChange={(v) => update({ videoUrl: v?.trim() || null })} maxLength={500} placeholder="e.g. https://www.youtube.com/watch?v=…" />
            </Field>
          </Section>

          {!isNew && loaded && <ProductHistory slug={loaded.slug} refreshKey={loaded.updatedAt ?? ''} />}
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

            {!isNew && loaded && (
              <div className="border-t border-[#EEF0F6] px-4 py-3">
                {deleting === 'ask' ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-800" role="alert">
                    <p className="font-semibold">Delete this product?</p>
                    <p className="mt-1">
                      It comes off the shop and out of the products list. Its history is kept, and it can be restored from the Deleted tab.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => void remove()} className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700">
                        Delete
                      </button>
                      <button type="button" onClick={() => setDeleting(null)} className="rounded-lg px-3 py-1.5 font-semibold text-red-800 hover:bg-red-100">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleting('ask')}
                    disabled={deleting === 'busy' || !!saving}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deleting === 'busy' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Delete product
                  </button>
                )}
              </div>
            )}
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
                <p className="mt-1 text-sm font-semibold leading-snug text-[#061A40] line-clamp-2">{effective.name || 'Product title'}</p>
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
