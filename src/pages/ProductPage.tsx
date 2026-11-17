import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useParams, useSearchParams, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, Banknote, Check, ChevronDown, ChevronRight, Heart, Lock, MapPin, PlayCircle, Share2,
  CreditCard, RefreshCw, ShieldCheck, ShieldPlus, ShoppingCart, Star, Store, Truck, WalletCards, Zap,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductGallery from '../components/ProductGallery';
import ProductReviews from '../components/ProductReviews';
import SectionHeading from '../components/shop/SectionHeading';
import { categories, products, formatINR } from '../data';
import { PRODUCT_DETAILS } from '../product-details-data';
import { PRODUCT_GALLERY } from '../product-gallery-data';
import { colourImages, coloursOf, findColour, productTitle } from '../product-colours';
import { livePriceOf } from '../live-catalogue';
import { extractSpecs, SPEC_LABELS, SPEC_ORDER } from '../product-specs';
import { useProductReviews } from '../reviews-store';
import { EXPRESS_DELIVERY, LAST_PINCODE_KEY, isExpressPincode } from '../stores-config';
import { useShopStore } from '../store';
import { useCanOrder, useCheckoutConfig } from '../lib/checkout';
import {
  bankSaving, bestBankOffer, emiMonthly, lowestEmi, offerApplies, offerHeadline, planPrice, rupeesText, useLiveOffers, type Offer,
} from '../lib/offers';

/** Overview text is often a semicolon-separated spec dump (ports, box
 *  contents, etc.) — split it into a scannable bullet list when it clearly
 *  is one, otherwise leave it as a single paragraph. */
function overviewItems(text: string): string[] | null {
  const parts = text.split(';').map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : null;
}

/** Specifications shown before "Show all". */
const SPECS_SHOWN = 8;

const PANEL = 'rounded-2xl border border-shop-line bg-white';

/** A white panel with a plain heading, like the rest of the buying column. */
function Panel({ title, aside, children, className = '' }: { title?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`${PANEL} ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          <h2 className="text-base font-semibold text-shop-ink">{title}</h2>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

/** Label and value rows, leaving out the ones not filled in. */
function InfoRows({ rows }: { rows: [string, string | undefined][] }) {
  return (
    <dl className="divide-y divide-shop-line">
      {rows
        .filter((row): row is [string, string] => !!row[1])
        .map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4">
            <dt className="text-sm text-shop-ink/55">{label}</dt>
            <dd className="break-words text-sm leading-relaxed text-shop-ink">{value}</dd>
          </div>
        ))}
    </dl>
  );
}

/** Where it goes and how fast: the visitor's pincode (remembered from the
 *  shop's express banner), whether it is in the 1-hour zone, and who sells it. */
/** Bank offers, EMI and exchange, as set up on the admin's Offers page:
 *  the best price with a bank offer on top, then each kind. Shown only when
 *  there is an offer for this product. */
function OffersPanel({ offers, pricePaise }: { offers: Offer[]; pricePaise: number }) {
  const [openBank, setOpenBank] = useState<string | null>(null);
  const [emiOpen, setEmiOpen] = useState(false);

  const bank = offers
    .filter((o) => o.kind === 'BANK')
    .map((o) => ({ offer: o, saving: bankSaving(o, pricePaise) }))
    .filter((b) => b.saving > 0)
    .sort((a, b) => b.saving - a.saving);
  const emi = offers.filter((o) => o.kind === 'EMI');
  const exchange = offers.filter((o) => o.kind === 'EXCHANGE').sort((a, b) => (b.maxOffInPaise ?? 0) - (a.maxOffInPaise ?? 0))[0];
  if (!bank.length && !emi.length && !exchange) return null;

  const best = bestBankOffer(offers, pricePaise);
  const low = lowestEmi(emi, pricePaise);
  const opened = bank.find((b) => b.offer.id === openBank)?.offer;

  return (
    <section className={`${PANEL} overflow-hidden`}>
      {best && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-shop-line bg-[#EEF2FF] px-5 py-3">
          <p className="flex items-baseline gap-1.5 text-shop-ink">
            <span className="text-sm">Buy at</span>
            <span className="font-dm-sans text-xl font-bold tabular-nums" style={{ letterSpacing: '-0.02em' }}>
              {rupeesText(pricePaise - best.saving)}
            </span>
          </p>
          <p className="text-xs text-shop-ink/60">
            with {best.offer.provider}
            {best.offer.paymentType ? ` ${best.offer.paymentType.toLowerCase()}` : ''}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 p-4">
        {exchange && (
          <div className="flex items-start gap-3 rounded-xl bg-shop-canvas px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-shop-accent">
              <RefreshCw className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-shop-ink">{offerHeadline(exchange)}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-shop-ink/55">
                {exchange.terms || 'Hand in your old device. What you get depends on its model and condition.'}
              </p>
            </div>
            <Link to="/contact" className="shrink-0 text-sm font-semibold text-shop-accent hover:underline">
              Ask
            </Link>
          </div>
        )}

        {bank.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-shop-ink">Bank offers</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
              {bank.map(({ offer: o, saving }, i) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOpenBank((id) => (id === o.id ? null : o.id))}
                  aria-expanded={openBank === o.id}
                  className={`flex w-48 shrink-0 flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                    openBank === o.id ? 'border-shop-ink' : 'border-shop-line hover:border-shop-ink/40'
                  }`}
                >
                  {i === 0 && <span className="mb-1.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">Best value</span>}
                  <span className="text-base font-bold tabular-nums text-shop-ink">{rupeesText(saving)} off</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-shop-ink/70">
                    <CreditCard className="h-3.5 w-3.5 shrink-0" />
                    {o.provider}
                  </span>
                  {o.paymentType && <span className="text-xs text-shop-ink/45">{o.paymentType}</span>}
                </button>
              ))}
            </div>
            {opened && (
              <p className="mt-2 rounded-xl bg-shop-canvas px-3.5 py-2.5 text-xs leading-relaxed text-shop-ink/70">
                <span className="font-semibold text-shop-ink">{offerHeadline(opened)}</span> with {opened.provider}
                {opened.paymentType ? ` ${opened.paymentType.toLowerCase()}` : ''}.
                {opened.minPriceInPaise ? ` On products of ${rupeesText(opened.minPriceInPaise)} and above.` : ''}
                {opened.terms ? ` ${opened.terms}` : ''}
              </p>
            )}
          </div>
        )}

        {low && (
          <div className="overflow-hidden rounded-xl border border-shop-line">
            <button
              type="button"
              onClick={() => setEmiOpen((o) => !o)}
              aria-expanded={emiOpen}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-shop-canvas"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-shop-canvas text-shop-accent">
                  <WalletCards className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-shop-ink">EMI from {rupeesText(low.monthly)}/month</span>
                  <span className="block text-xs text-shop-ink/55">
                    {emi.some((o) => !o.interestPercent) ? 'No cost EMI available · ' : ''}
                    {emiOpen ? 'Hide plans' : 'See plans'}
                  </span>
                </span>
              </span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-shop-ink/50 transition-transform ${emiOpen ? 'rotate-180' : ''}`} />
            </button>
            {emiOpen && (
              <div className="overflow-x-auto border-t border-shop-line">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="text-xs text-shop-ink/50">
                      <th className="px-3.5 py-2 font-medium">Bank</th>
                      <th className="px-3.5 py-2 font-medium">Months</th>
                      <th className="px-3.5 py-2 font-medium">Each month</th>
                      <th className="px-3.5 py-2 font-medium">Interest</th>
                      <th className="px-3.5 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-shop-line">
                    {emi.flatMap((o) =>
                      o.emiMonths.map((months) => {
                        const each = emiMonthly(pricePaise, months, o.interestPercent ?? 0);
                        return (
                          <tr key={`${o.id}-${months}`} className="text-shop-ink">
                            <td className="px-3.5 py-2.5">
                              {o.provider}
                              {o.paymentType && <span className="block text-xs text-shop-ink/45">{o.paymentType}</span>}
                            </td>
                            <td className="px-3.5 py-2.5 tabular-nums">{months}</td>
                            <td className="px-3.5 py-2.5 font-semibold tabular-nums">{rupeesText(each)}</td>
                            <td className="px-3.5 py-2.5">
                              {o.interestPercent ? `${o.interestPercent}% a year` : <span className="font-semibold text-emerald-600">No cost</span>}
                            </td>
                            {/* No cost EMI adds up to the price; the rounding
                                of each month is the bank's to settle. */}
                            <td className="px-3.5 py-2.5 tabular-nums text-shop-ink/70">
                              {rupeesText(o.interestPercent ? each * months : pricePaise)}
                            </td>
                          </tr>
                        );
                      }),
                    )}
                  </tbody>
                </table>
                {emi.some((o) => o.terms) && (
                  <p className="border-t border-shop-line px-3.5 py-2.5 text-xs text-shop-ink/55">
                    {emi
                      .filter((o) => o.terms)
                      .map((o) => `${o.provider}: ${o.terms}`)
                      .join(' ')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** Protection plans for this product, from the admin's Offers page. */
function ProtectionPanel({ plans, pricePaise }: { plans: Offer[]; pricePaise: number }) {
  if (!plans.length) return null;
  return (
    <Panel title="Protection plans" aside={<span className="text-xs text-shop-ink/50">Optional</span>}>
      <div className="grid gap-2 p-3 sm:grid-cols-2">
        {plans.map((o) => (
          <div key={o.id} className="flex flex-col rounded-xl border border-shop-line p-3.5">
            <span className="flex items-start gap-2.5">
              <ShieldPlus className="mt-0.5 h-[18px] w-[18px] shrink-0 text-shop-accent" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-snug text-shop-ink">{o.title}</span>
                {o.provider && <span className="block text-xs text-shop-ink/50">by {o.provider}</span>}
              </span>
            </span>
            <p className="mt-2.5 text-sm text-shop-ink">
              <span className="font-bold tabular-nums">{rupeesText(planPrice(o, pricePaise))}</span>
              <span className="text-shop-ink/55">
                {' '}
                · {o.coverMonths} months cover
              </span>
            </p>
            {o.terms && <p className="mt-1 text-xs leading-relaxed text-shop-ink/55">{o.terms}</p>}
          </div>
        ))}
      </div>
      <p className="border-t border-shop-line px-5 py-3 text-xs text-shop-ink/55">
        To add a plan, tell us when you order or{' '}
        <Link to="/contact" className="font-semibold text-shop-accent hover:underline">
          ask us
        </Link>
        .
      </p>
    </Panel>
  );
}

function DeliveryPanel() {
  const [pincode, setPincode] = useState('');
  const [checked, setChecked] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_PINCODE_KEY);
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
        setChecked(saved);
      }
    } catch {
      // No storage: the visitor just types it.
    }
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setError('Enter a 6-digit pincode.');
      return;
    }
    setError('');
    setChecked(pincode);
    setEditing(false);
    try {
      localStorage.setItem(LAST_PINCODE_KEY, pincode);
    } catch {
      // ignore
    }
  }

  const express = checked ? isExpressPincode(checked) : false;

  return (
    <Panel title="Delivery details">
      <div className="flex flex-col gap-2 p-3">
        {checked && !editing ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-shop-canvas px-3.5 py-3">
            <span className="flex min-w-0 items-center gap-2.5 text-sm text-shop-ink">
              <MapPin className="h-4 w-4 shrink-0 text-shop-ink/60" />
              <span className="truncate">
                Delivering to <span className="font-semibold tabular-nums">{checked}</span>
              </span>
            </span>
            <button type="button" onClick={() => setEditing(true)} className="shrink-0 text-sm font-semibold text-shop-accent hover:underline">
              Change
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-1.5">
            <div className="flex items-stretch overflow-hidden rounded-xl border border-shop-line bg-white transition-colors focus-within:border-shop-accent">
              <MapPin className="ml-3.5 h-4 w-4 shrink-0 self-center text-shop-ink/50" />
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter delivery pincode"
                inputMode="numeric"
                aria-label="Delivery pincode"
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums text-shop-ink outline-none placeholder:text-shop-ink/40"
              />
              <button type="submit" className="shrink-0 px-4 text-sm font-semibold text-shop-accent hover:bg-shop-canvas">
                Check
              </button>
            </div>
            {error && <p className="px-1 text-xs font-medium text-red-600">{error}</p>}
          </form>
        )}

        <div className="flex items-start gap-2.5 rounded-xl bg-shop-canvas px-3.5 py-3 text-sm">
          {checked ? (
            express ? (
              <>
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-shop-accent" fill="currentColor" />
                <span className="text-shop-ink">
                  <span className="font-semibold">Delivery in 1 hour</span>
                  <span className="text-shop-ink/60"> · express in {EXPRESS_DELIVERY.region}</span>
                </span>
              </>
            ) : (
              <>
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-shop-ink/70" />
                <span className="text-shop-ink">
                  <span className="font-semibold">Standard delivery</span>
                  <span className="text-shop-ink/60"> · 1-hour express is for {EXPRESS_DELIVERY.region}</span>
                </span>
              </>
            )
          ) : (
            <>
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-shop-accent" fill="currentColor" />
              <span className="text-shop-ink/70">
                1-hour delivery in {EXPRESS_DELIVERY.region}. Enter your pincode to check.
              </span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-shop-canvas px-3.5 py-3 text-sm">
          <span className="flex items-center gap-2.5 text-shop-ink">
            <Store className="h-4 w-4 shrink-0 text-shop-ink/70" />
            <span>
              Sold by <span className="font-semibold">Logica Infoway</span>
            </span>
          </span>
        </div>
      </div>
    </Panel>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const { addToCart, inCart, toggleWishlist, inWishlist } = useShopStore();
  const canOrder = useCanOrder();
  const checkout = useCheckoutConfig();
  const navigate = useNavigate();
  const { reviews } = useProductReviews(id ?? '');
  const liveOffers = useLiveOffers();
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(true);
  const [tab, setTab] = useState('specs');
  const [allSpecs, setAllSpecs] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const related = useMemo(
    () => (product ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [product],
  );

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const category = categories.find((c) => c.slug === product.category);
  const detail = PRODUCT_DETAILS[product.id];
  const extracted = extractSpecs(product.name);
  // Where the page has colour choices, the catalogue's own colour list
  // ("Color : Black Blue Green Yellow Pink") only repeats them — and can
  // disagree with them — so it is left out of the highlights and specs.
  const hasColours = coloursOf(product.id).length > 0;
  const isColourList = (text: string) => /^\s*colou?r\b/i.test(text);
  const isColourSpec = (label: string) => /^\s*(model\s+)?colou?rs?\s*$/i.test(label);
  const highlights = (detail?.highlights ?? []).filter((h) => !(hasColours && isColourList(h)));
  const specRows: [string, string][] = (
    detail?.specs ??
    SPEC_ORDER.filter((key) => extracted[key]).map((key): [string, string] => [SPEC_LABELS[key], extracted[key] as string])
  ).filter(([label]) => !(hasColours && isColourSpec(label)));

  // Colours: the one named in the URL, else the first. The URL is the
  // source of truth so a shared link or a search for "blue iphone" opens
  // on that colour.
  const colours = coloursOf(product.id);
  const colour = findColour(product.id, searchParams.get('colour')) ?? colours[0];
  const inStock = colour?.inStock ?? product.inStock;
  // Ordering open, but no SAP code linked: shown, not sold.
  const orderable = canOrder(product.id, colour?.key);
  const buyable = inStock && orderable;
  // A colour with its own SAP code has its own price; otherwise the product's.
  const live = livePriceOf(product.id, colour?.key);
  const price = live?.price ?? product.price;
  const mrp = live?.mrp ?? product.mrp;
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  // "Apple iPhone 15 Plus – Green": the name follows the chosen colour.
  const title = productTitle(product, colour);
  const galleryImages = colour && colourImages(product.id, colour).length
    ? colourImages(product.id, colour)
    : PRODUCT_GALLERY[product.id]?.length
      ? PRODUCT_GALLERY[product.id]
      : [product.image];
  const chooseColour = (key: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('colour', key);
        return next;
      },
      { replace: true },
    );
  const wished = inWishlist(product.id);
  const info = detail?.info;
  const overviewList = detail?.overview ? overviewItems(detail.overview) : null;
  const rating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const cod = !!checkout?.enabled && !!checkout.cod.enabled;
  // The offers for this product at this price (offers work in paise);
  // none on a product that cannot be ordered.
  const pricePaise = Math.round(price * 100);
  const offers = !orderable ? [] : liveOffers.filter((o) => offerApplies(o, { priceInPaise: pricePaise, category: product.category, brand: product.brand ?? '' }));
  const plans = offers.filter((o) => o.kind === 'PROTECTION');

  // The "All details" tabs: only the ones this product has something for.
  const tabs = [
    { key: 'specs', label: 'Specifications', show: specRows.length > 0 },
    { key: 'description', label: 'Description', show: !!detail?.overview },
    { key: 'box', label: 'In the box', show: !!info?.inTheBox },
    { key: 'warranty', label: 'Warranty', show: !!info?.warranty },
    {
      key: 'maker',
      label: 'Manufacturer info',
      show: !!(info?.countryOfOrigin || info?.manufacturer || info?.packer || info?.importer || info?.modelNumber),
    },
  ].filter((t) => t.show);
  const activeTab = tabs.find((t) => t.key === tab)?.key ?? tabs[0]?.key;

  // Reasons to buy here, each only when it is true for this product.
  const assurances = [
    { icon: Zap, label: '1-hour delivery', note: EXPRESS_DELIVERY.region, show: true },
    { icon: Banknote, label: 'Cash on delivery', note: 'Pay at your door', show: cod },
    { icon: ShieldCheck, label: 'Brand warranty', note: info?.warranty?.period ?? 'From the maker', show: !!info?.warranty },
    { icon: Lock, label: 'Secure checkout', note: 'Pay online', show: !!checkout?.enabled },
    { icon: Store, label: 'Sold by Logica', note: 'Logica Infoway', show: true },
  ]
    .filter((a) => a.show)
    .slice(0, 4);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      // Cancelled or not allowed: nothing to do.
    }
  }

  const cornerButton = 'flex h-10 w-10 items-center justify-center rounded-full border border-shop-line bg-white shadow-sm transition-colors';

  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 overflow-hidden text-xs text-shop-ink/50">
          <Link to="/" className="shrink-0 transition-colors hover:text-shop-ink">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to="/shop" className="shrink-0 transition-colors hover:text-shop-ink">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {category && (
            <>
              <Link to={`/shop/${category.slug}`} className="shrink-0 transition-colors hover:text-shop-ink">
                {category.name}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          <span className="truncate text-shop-ink/80">{title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
          {/* Photos: a grid of large tiles, all at once. */}
          <div className="min-w-0 rounded-2xl bg-white p-3 lg:self-start">
            <ProductGallery
              key={colour?.key ?? 'all'}
              images={galleryImages}
              alt={title}
              productId={product.id}
              corner={
                <>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-pressed={wished}
                    className={`${cornerButton} ${wished ? 'text-red-500' : 'text-shop-ink/70 hover:text-shop-ink'}`}
                  >
                    <Heart className="h-[18px] w-[18px]" fill={wished ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void share()}
                    aria-label="Share this product"
                    className={`${cornerButton} text-shop-ink/70 hover:text-shop-ink`}
                  >
                    {shared ? <Check className="h-[18px] w-[18px] text-emerald-600" /> : <Share2 className="h-[18px] w-[18px]" />}
                  </button>
                </>
              }
            />
            {shared && <p className="mt-2 text-center text-xs text-shop-ink/60" role="status">Link copied</p>}
          </div>

          {/* Everything about buying it. */}
          <div className="flex min-w-0 flex-col gap-4">
            <div className={`${PANEL} flex flex-col gap-4 p-5`}>
              {/* Colour: a photo of each, the chosen one outlined. */}
              {colour && colours.length > 0 && (
                <div>
                  <p className="text-sm text-shop-ink/60">
                    Selected colour: <span className="font-semibold text-shop-ink">{colour.name}</span>
                    {!inStock && <span className="text-red-600"> · Out of stock</span>}
                  </p>
                  <div role="radiogroup" aria-label="Colour" className="mt-2.5 flex flex-wrap gap-2">
                    {colours.map((c) => {
                      const on = c.key === colour.key;
                      const out = !(c.inStock ?? product.inStock);
                      const thumb = colourImages(product.id, c)[0];
                      return (
                        <button
                          key={c.key}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-label={`${c.name}${out ? ' (out of stock)' : ''}`}
                          title={c.name}
                          onClick={() => chooseColour(c.key)}
                          className={`relative flex h-16 w-14 items-center justify-center overflow-hidden rounded-xl border-2 bg-shop-canvas transition-colors ${
                            on ? 'border-shop-ink' : 'border-transparent hover:border-shop-line'
                          }`}
                        >
                          {thumb ? (
                            <img src={thumb} alt="" className={`h-full w-full object-contain p-1.5 mix-blend-multiply ${out ? 'opacity-40' : ''}`} />
                          ) : (
                            <span
                              aria-hidden="true"
                              className={`h-7 w-7 rounded-full border border-shop-ink/15 ${out ? 'opacity-40' : ''}`}
                              style={{ backgroundColor: c.hex }}
                            />
                          )}
                          {out && <span aria-hidden="true" className="absolute h-px w-[130%] -rotate-[50deg] bg-shop-ink/50" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Name and rating */}
              <div>
                <h1 className="text-xl font-semibold leading-snug text-shop-ink sm:text-2xl" style={{ letterSpacing: '-0.015em' }}>
                  {title}
                </h1>
                {reviews.length > 0 && (
                  <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">
                      {rating.toFixed(1)}
                      <Star className="h-3 w-3" fill="currentColor" />
                    </span>
                    <span className="text-shop-ink/55 hover:text-shop-ink">
                      {reviews.length.toLocaleString('en-IN')} review{reviews.length === 1 ? '' : 's'}
                    </span>
                  </a>
                )}
              </div>

              {/* Price */}
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {discount > 0 && (
                    <span className="flex items-center text-lg font-bold text-emerald-600">
                      <ArrowDown className="h-4 w-4" strokeWidth={3} />
                      {discount}%
                    </span>
                  )}
                  {discount > 0 && <span className="text-base tabular-nums text-shop-ink/40 line-through">{formatINR(mrp!)}</span>}
                  <span className="font-dm-sans text-3xl font-bold tabular-nums text-shop-ink" style={{ letterSpacing: '-0.03em' }}>
                    {formatINR(price)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-shop-ink/50">
                  {discount > 0 ? `You save ${formatINR(mrp! - price)} · ` : ''}Inclusive of all taxes
                </p>
                {/* Only said when it matters: a product that cannot be bought. */}
                {!orderable ? (
                  <p className="mt-2 text-sm font-medium text-shop-ink/60">Currently unavailable to order online</p>
                ) : (
                  !inStock && <p className="mt-2 text-sm font-medium text-red-600">Currently out of stock</p>
                )}
              </div>
            </div>

            <OffersPanel offers={offers} pricePaise={pricePaise} />

            <DeliveryPanel />

            {/* Shop with peace of mind */}
            <Panel title="Shop with peace of mind">
              <div className="grid grid-cols-2 gap-2 p-3">
                {assurances.map(({ icon: Icon, label, note }) => (
                  <div key={label} className="flex items-center gap-2.5 rounded-xl bg-shop-canvas px-3 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-shop-accent">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold leading-tight text-shop-ink">{label}</span>
                      <span className="block text-[11px] leading-tight text-shop-ink/50">{note}</span>
                    </span>
                  </div>
                ))}
              </div>
              {info?.warranty?.summary && (
                <p className="flex items-start gap-2.5 border-t border-shop-line px-5 py-3 text-sm text-shop-ink/75">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-shop-ink/60" />
                  {info.warranty.summary}
                </p>
              )}
            </Panel>

            <ProtectionPanel plans={plans} pricePaise={pricePaise} />

            {/* Product highlights, folding away */}
            {highlights.length > 0 && (
              <section className={PANEL}>
                <button
                  type="button"
                  onClick={() => setHighlightsOpen((o) => !o)}
                  aria-expanded={highlightsOpen}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span>
                    <span className="block text-base font-semibold text-shop-ink">Product highlights</span>
                    {!highlightsOpen && <span className="block text-xs text-shop-ink/50">The main points at a glance</span>}
                  </span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-shop-ink/50 transition-transform ${highlightsOpen ? 'rotate-180' : ''}`} />
                </button>
                {highlightsOpen && (
                  <ul className="flex flex-col gap-2.5 px-5 pb-5">
                    {highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm leading-relaxed text-shop-ink/80">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-shop-ink/40" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* All details, one tab at a time */}
            {tabs.length > 0 && (
              <Panel title="All details">
                <div role="tablist" aria-label="Product details" className="flex gap-2 overflow-x-auto px-5 pt-3 [scrollbar-width:none]">
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === t.key}
                      onClick={() => setTab(t.key)}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        activeTab === t.key ? 'bg-shop-ink text-white' : 'border border-shop-line text-shop-ink/70 hover:border-shop-ink/40 hover:text-shop-ink'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div role="tabpanel" className="px-5 pb-4 pt-2">
                  {activeTab === 'specs' && (
                    <>
                      <InfoRows rows={allSpecs ? specRows : specRows.slice(0, SPECS_SHOWN)} />
                      {specRows.length > SPECS_SHOWN && (
                        <button
                          type="button"
                          onClick={() => setAllSpecs((a) => !a)}
                          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-shop-line py-2.5 text-sm font-semibold text-shop-ink transition-colors hover:border-shop-ink/40"
                        >
                          {allSpecs ? 'Show less' : `Show all ${specRows.length}`}
                          <ChevronDown className={`h-4 w-4 transition-transform ${allSpecs ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </>
                  )}
                  {activeTab === 'description' && detail?.overview &&
                    (overviewList ? (
                      <ul className="flex flex-col gap-2.5 py-2">
                        {overviewList.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-shop-ink/80">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-shop-ink/40" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="py-2 text-sm leading-relaxed text-shop-ink/80">{detail.overview}</p>
                    ))}
                  {activeTab === 'box' && <p className="py-2 text-sm leading-relaxed text-shop-ink/80">{info?.inTheBox}</p>}
                  {activeTab === 'warranty' && info?.warranty && (
                    <InfoRows
                      rows={[
                        ['Summary', info.warranty.summary],
                        ['Period', info.warranty.period],
                        ['Service', info.warranty.serviceType],
                        ['Covered', info.warranty.covered],
                      ]}
                    />
                  )}
                  {activeTab === 'maker' && info && (
                    <InfoRows
                      rows={[
                        ['Model number', info.modelNumber],
                        ['Country of origin', info.countryOfOrigin],
                        ['Manufacturer', info.manufacturer],
                        ['Packer', info.packer],
                        ['Importer', info.importer],
                      ]}
                    />
                  )}
                </div>
              </Panel>
            )}

            {info?.videoUrl && /^https:\/\//.test(info.videoUrl) && (
              <a
                href={info.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${PANEL} group flex items-center justify-between px-5 py-4 text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-canvas`}
              >
                <span className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-shop-accent" /> Watch the product video
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
              </a>
            )}

            <Link
              to="/contact"
              className={`${PANEL} group flex items-center justify-between px-5 py-4 text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-canvas`}
            >
              <span>
                Buying for a business?
                <span className="block text-xs font-normal text-shop-ink/55">Ask us for bulk pricing</span>
              </span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
            </Link>

            {/* The buttons stay at the foot of the screen while the column
                is in view. */}
            <div data-sticky-bar="always" className="sticky bottom-0 z-20 -mx-4 border-t border-shop-line bg-white/95 p-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)]">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!buyable}
                  onClick={() => {
                    addToCart(product.id, 1, colour?.key);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1500);
                  }}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-shop-ink bg-white text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-ink hover:text-white disabled:cursor-not-allowed disabled:border-shop-line disabled:bg-shop-canvas disabled:text-shop-ink/40"
                >
                  {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  {!orderable
                    ? 'Currently unavailable'
                    : !inStock
                      ? 'Out of stock'
                      : added
                        ? 'Added'
                        : inCart(product.id, colour?.key)
                          ? 'Add another'
                          : 'Add to cart'}
                </button>
                {/* Buy now: into the cart and straight to checkout. Only once
                    ordering is open. */}
                {checkout?.enabled && buyable && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!inCart(product.id, colour?.key)) addToCart(product.id, 1, colour?.key);
                      navigate('/checkout');
                    }}
                    className="flex h-12 flex-1 flex-col items-center justify-center rounded-xl bg-shop-ink text-white transition-colors duration-300 hover:bg-shop-accent"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Zap className="h-4 w-4" /> Buy now
                    </span>
                    <span className="text-[11px] tabular-nums text-white/70">at {formatINR(price)}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div id="reviews" className="scroll-mt-6">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-14">
            <SectionHeading className="mb-5">You may also like</SectionHeading>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
