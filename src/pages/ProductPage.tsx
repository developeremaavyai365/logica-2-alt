import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useParams, useSearchParams, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BatteryFull, Camera, Check, ChevronDown, ChevronRight, Cpu, CreditCard, HardDrive, Heart, Laptop2, Layers,
  MapPin, MemoryStick, Monitor, PlayCircle, RefreshCw, Share2, ShieldPlus, ShoppingCart, Smartphone, Star,
  Store, Truck, WalletCards, Zap, type LucideIcon,
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

/* The product page, in the website's language: white cards divided into
   sections by hairlines, each headed in bold DM Sans. Photos,
   highlights and the full details on the left; buying, offers and delivery
   on the right. */

const MICRO_LABEL = 'text-xs font-medium text-shop-ink/50';
const CARD = 'overflow-hidden rounded-2xl border border-shop-line bg-white';

/** Best-effort icon for a spec or highlight, purely for visual scanning. */
function iconForSpec(text: string): LucideIcon {
  const l = text.toLowerCase();
  if (l.includes('battery') || l.includes('mah')) return BatteryFull;
  if (l.includes('camera') || /\d+\s*mp\b/.test(l)) return Camera;
  if (l.includes('display') || l.includes('screen') || l.includes('resolution') || l.includes('inch')) return Monitor;
  if (l.includes('ram') || l.includes('memory')) return MemoryStick;
  if (l.includes('storage') || l.includes('ssd') || l.includes('hdd') || l.includes('rom') || l.includes('capacity')) return HardDrive;
  if (l.includes('processor') || l.includes('chip') || l.includes('snapdragon') || l.includes('dimensity') || l.includes('core')) return Cpu;
  if (l.includes('windows') || l.includes('android') || l.includes('ios') || l.includes('operating')) return Laptop2;
  if (l.includes('graphics')) return Zap;
  if (l.includes('sim') || l.includes('5g') || l.includes('network')) return Smartphone;
  return Layers;
}

/** Overview text is often a semicolon-separated spec dump (ports, box
 *  contents, etc.) — split it into a scannable bullet list when it clearly
 *  is one, otherwise leave it as a single paragraph. */
function overviewItems(text: string): string[] | null {
  const parts = text.split(';').map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : null;
}

/** How far from the top a sticky column sits: 16px when it fits on the
 *  screen; when it is taller, far enough up that its foot can be reached,
 *  so it scrolls with the page first and then stays. */
function useStickyTop() {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(16);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setTop(Math.min(16, window.innerHeight - el.offsetHeight - 16));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);
  return { ref, top };
}

/** Spec rows that have their own button under "All details". */
const BOX_ROW = /^\s*(in the box|what'?s in the box|box contents|included components|sales package)\s*$/i;
const WARRANTY_ROW = /warranty/i;
const MAKER_ROW = /^\s*(country of origin|manufacturer( details)?|importer( details)?|packer( details)?|(item )?model number)\s*$/i;

/** The specification sections, as a marketplace groups them. A row goes
 *  in the first section whose words it has; the rest go under General. */
const SPEC_GROUPS: [string, RegExp][] = [
  ['Display', /display|screen|resolution|refresh|ppi|\bhdr\b/i],
  ['Camera', /camera|video|\blens\b|zoom/i],
  ['Battery & charging', /battery|power|charg|mah|adapter/i],
  ['Performance', /processor|chip|\bcpu\b|\bcores?\b|clock|\bram\b|memory|storage|\brom\b|capacity|ssd|hdd|hard (disk|drive)|operating|\bos\b|graphics|\bgpu\b|generation/i],
  ['Connectivity', /network|\bsim\b|wi-?fi|bluetooth|\busb\b|\bports?\b|\b[45]g\b|nfc|gps|hdmi|connect|wireless/i],
  ['Design & build', /dimension|weight|height|width|depth|thickness|colou?r|splash|water|dust|\bip\d|material|form factor/i],
];

function groupSpecs(rows: [string, string][]): { title: string; rows: [string, string][] }[] {
  const groups = new Map<string, [string, string][]>([['General', []], ...SPEC_GROUPS.map(([t]): [string, [string, string][]] => [t, []])]);
  for (const row of rows) {
    const group = SPEC_GROUPS.find(([, re]) => re.test(row[0]))?.[0] ?? 'General';
    groups.get(group)!.push(row);
  }
  return [...groups].filter(([, r]) => r.length).map(([title, r]) => ({ title, rows: r }));
}

/** Specifications shown before "Show all". */
const SPECS_SHOWN = 8;

/** A card with a bold DM Sans heading and an optional aside. */
function Card({ label, aside, children, className = '' }: { label: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`${CARD} ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-shop-line px-5 py-3.5">
        <h2 className="font-dm-sans text-lg font-bold text-shop-ink" style={{ letterSpacing: '-0.02em' }}>
          {label}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** A long value cut to three lines, with Read more to see it all. */
function LongText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  if (text.length <= 180) return <>{text}</>;
  return (
    <>
      <span className={open ? '' : 'line-clamp-3'}>{text}</span>
      <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1 text-sm font-semibold text-shop-accent hover:underline">
        {open ? 'Show less' : 'Read more'}
      </button>
    </>
  );
}

/** Label and value rows, leaving out the ones not filled in. */
function InfoRows({ rows }: { rows: [string, string | undefined][] }) {
  return (
    <dl className="divide-y divide-shop-line">
      {rows
        .filter((row): row is [string, string] => !!row[1])
        .map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6">
            <dt className="text-sm text-shop-ink/55">{label}</dt>
            <dd className="break-words text-sm leading-relaxed text-shop-ink">
              <LongText text={value} />
            </dd>
          </div>
        ))}
    </dl>
  );
}

/** Bank offers, EMI and exchange, as set up on the admin's Offers page, one
 *  module each. Shown only when there is an offer for this product. */
function OffersCard({ offers, pricePaise }: { offers: Offer[]; pricePaise: number }) {
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
    <Card label="Offers">
      {/* Module — the best price */}
      {best && (
        <div className="flex items-end justify-between gap-3 px-5 py-4">
          <div>
            <span className={MICRO_LABEL}>Best price</span>
            <p className="mt-1 font-dm-sans text-2xl font-bold tabular-nums text-shop-ink" style={{ letterSpacing: '-0.03em' }}>
              {rupeesText(pricePaise - best.saving)}
            </p>
          </div>
          <p className="text-right text-xs leading-snug text-shop-ink/55">
            with {best.offer.provider}
            {best.offer.paymentType && <span className="block">{best.offer.paymentType}</span>}
          </p>
        </div>
      )}

      {/* Module — bank offers */}
      {bank.length > 0 && (
        <div className="border-t border-shop-line px-5 py-4">
          <span className={MICRO_LABEL}>Bank offers</span>
          <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {bank.map(({ offer: o, saving }, i) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOpenBank((id) => (id === o.id ? null : o.id))}
                aria-expanded={openBank === o.id}
                className={`flex w-44 shrink-0 flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                  openBank === o.id ? 'border-shop-ink' : 'border-shop-line hover:border-shop-ink/40'
                }`}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <CreditCard className="h-4 w-4 text-shop-ink/50" />
                  {i === 0 && (
                    <span className="rounded-full bg-shop-accent px-2 py-0.5 text-[11px] font-semibold leading-none text-white">
                      Best value
                    </span>
                  )}
                </span>
                <span className="mt-2 font-dm-sans text-lg font-semibold tabular-nums text-shop-ink" style={{ letterSpacing: '-0.02em' }}>
                  {rupeesText(saving)} off
                </span>
                <span className="text-xs text-shop-ink/70">{o.provider}</span>
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

      {/* Module — exchange */}
      {exchange && (
        <div className="flex items-start gap-3 border-t border-shop-line px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-shop-canvas">
            <RefreshCw className="h-4 w-4 text-shop-ink" />
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

      {/* Module — EMI */}
      {low && (
        <div className="border-t border-shop-line">
          <button
            type="button"
            onClick={() => setEmiOpen((o) => !o)}
            aria-expanded={emiOpen}
            className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-shop-canvas"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-shop-canvas">
              <WalletCards className="h-4 w-4 text-shop-ink" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-shop-ink">EMI from {rupeesText(low.monthly)}/month</span>
              <span className="block text-xs text-shop-ink/55">
                {emi.some((o) => !o.interestPercent) ? 'No cost EMI available · ' : ''}
                {emiOpen ? 'Hide plans' : 'See plans'}
              </span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-shop-ink/50 transition-transform ${emiOpen ? 'rotate-180' : ''}`} />
          </button>
          {emiOpen && (
            <div className="overflow-x-auto border-t border-shop-line">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-shop-line">
                    {['Bank', 'Months', 'Each month', 'Interest', 'Total'].map((h) => (
                      <th key={h} className={`${MICRO_LABEL} px-5 py-2.5`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-shop-line">
                  {emi.flatMap((o) =>
                    o.emiMonths.map((months) => {
                      const each = emiMonthly(pricePaise, months, o.interestPercent ?? 0);
                      return (
                        <tr key={`${o.id}-${months}`} className="text-shop-ink">
                          <td className="px-5 py-2.5">
                            {o.provider}
                            {o.paymentType && <span className="block text-xs text-shop-ink/45">{o.paymentType}</span>}
                          </td>
                          <td className="px-5 py-2.5 tabular-nums">{months}</td>
                          <td className="px-5 py-2.5 font-semibold tabular-nums">{rupeesText(each)}</td>
                          <td className="px-5 py-2.5">
                            {o.interestPercent ? `${o.interestPercent}% a year` : <span className="font-semibold text-shop-accent">No cost</span>}
                          </td>
                          {/* No cost EMI adds up to the price; the rounding
                              of each month is the bank's to settle. */}
                          <td className="px-5 py-2.5 tabular-nums text-shop-ink/70">{rupeesText(o.interestPercent ? each * months : pricePaise)}</td>
                        </tr>
                      );
                    }),
                  )}
                </tbody>
              </table>
              {emi.some((o) => o.terms) && (
                <p className="border-t border-shop-line px-5 py-2.5 text-xs text-shop-ink/55">
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
    </Card>
  );
}

/** Protection plans for this product, from the admin's Offers page. */
function ProtectionCard({ plans, pricePaise }: { plans: Offer[]; pricePaise: number }) {
  if (!plans.length) return null;
  return (
    <Card label="Protection plans" aside={<span className="text-sm text-shop-ink/45">Optional</span>}>
      <div className="grid grid-cols-1 gap-px bg-shop-line sm:grid-cols-2">
        {plans.map((o) => (
          <div key={o.id} className="flex flex-col bg-white px-5 py-4">
            <span className="flex items-start gap-2.5">
              <ShieldPlus className="mt-0.5 h-4 w-4 shrink-0 text-shop-accent" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-snug text-shop-ink">{o.title}</span>
                {o.provider && <span className="block text-xs text-shop-ink/50">by {o.provider}</span>}
              </span>
            </span>
            <p className="mt-2.5 flex items-baseline gap-2">
              <span className="font-dm-sans text-lg font-semibold tabular-nums text-shop-ink">{rupeesText(planPrice(o, pricePaise))}</span>
              <span className="text-xs text-shop-ink/50">{o.coverMonths} months cover</span>
            </p>
            {o.terms && <p className="mt-1 text-xs leading-relaxed text-shop-ink/55">{o.terms}</p>}
          </div>
        ))}
        {plans.length % 2 === 1 && <div className="hidden bg-white sm:block" aria-hidden="true" />}
      </div>
      <p className="border-t border-shop-line px-5 py-3 text-xs text-shop-ink/55">
        To add a plan, tell us when you order or{' '}
        <Link to="/contact" className="font-semibold text-shop-accent hover:underline">
          ask us
        </Link>
        .
      </p>
    </Card>
  );
}

/** Where it goes and how fast: the visitor's pincode (remembered from the
 *  shop's express banner), whether it is in the 1-hour zone, and who sells it. */
function DeliveryCard() {
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
    <Card label="Delivery">
      {/* Module — the pincode */}
      <div className="px-5 py-4">
        {checked && !editing ? (
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5 text-sm text-shop-ink">
              <MapPin className="h-4 w-4 shrink-0 text-shop-ink/50" />
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
            <div className="flex items-stretch overflow-hidden rounded-xl border border-shop-line bg-shop-canvas transition-colors focus-within:border-shop-accent focus-within:bg-white">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter your pincode"
                inputMode="numeric"
                aria-label="Delivery pincode"
                className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm tabular-nums tracking-[0.12em] text-shop-ink outline-none placeholder:tracking-normal placeholder:text-shop-ink/35"
              />
              <button type="submit" className="group flex shrink-0 items-center gap-1.5 bg-shop-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-shop-accent">
                Check
                <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5" />
              </button>
            </div>
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          </form>
        )}
      </div>

      {/* Module — how fast */}
      <div className="flex items-start gap-3 border-t border-shop-line px-5 py-3.5 text-sm">
        {checked && !express ? (
          <>
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-shop-ink/70" />
            <span className="text-shop-ink">
              <span className="font-semibold">Standard delivery</span>
              <span className="text-shop-ink/55"> · 1-hour express is for {EXPRESS_DELIVERY.region}</span>
            </span>
          </>
        ) : (
          <>
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-shop-accent" fill="currentColor" />
            <span className="text-shop-ink">
              <span className="font-semibold">{checked ? 'At your door in 1 hour' : `1-hour delivery in ${EXPRESS_DELIVERY.region}`}</span>
              <span className="text-shop-ink/55">{checked ? ` · express in ${EXPRESS_DELIVERY.region}` : ' · enter your pincode to check'}</span>
            </span>
          </>
        )}
      </div>

      {/* Module — who sells it */}
      <div className="flex items-center gap-3 border-t border-shop-line px-5 py-3.5 text-sm text-shop-ink">
        <Store className="h-4 w-4 shrink-0 text-shop-ink/70" />
        <span>
          Sold and shipped by <span className="font-semibold">Logica Infoway</span>
        </span>
      </div>
    </Card>
  );
}

/** The rating as the shop writes it: stars, the average and the count. */
function RatingLine({ rating, count }: { rating: number; count: number }) {
  return (
    <a href="#reviews" className="group mt-2 inline-flex items-center gap-2 text-sm">
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="h-3.5 w-3.5" fill={n <= Math.round(rating) ? '#FFC107' : 'none'} stroke={n <= Math.round(rating) ? '#FFC107' : '#C8C8C8'} />
        ))}
      </span>
      <span className="font-semibold tabular-nums text-shop-ink">{rating.toFixed(1)}</span>
      <span className="text-shop-ink/50 group-hover:text-shop-ink">
        · {count.toLocaleString('en-IN')} review{count === 1 ? '' : 's'}
      </span>
    </a>
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
  const [tab, setTab] = useState('specs');
  const [allSpecs, setAllSpecs] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const sticky = useStickyTop();

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
  // Where the page has colour dots, the catalogue's own colour list
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
  // The offers for this product at this price (offers work in paise);
  // none on a product that cannot be ordered.
  const pricePaise = Math.round(price * 100);
  const offers = !orderable
    ? []
    : liveOffers.filter((o) => offerApplies(o, { priceInPaise: pricePaise, category: product.category, brand: product.brand ?? '' }));
  const plans = offers.filter((o) => o.kind === 'PROTECTION');

  // "All details": the box, warranty and maker rows of the spec list go on
  // their own buttons, the rest in sections.
  const boxRows = specRows.filter(([label]) => BOX_ROW.test(label));
  const warrantyRows = specRows.filter(([label]) => !BOX_ROW.test(label) && WARRANTY_ROW.test(label));
  const makerRows = specRows.filter(([label]) => !BOX_ROW.test(label) && !WARRANTY_ROW.test(label) && MAKER_ROW.test(label));
  const specGroups = groupSpecs(specRows.filter((row) => !boxRows.includes(row) && !warrantyRows.includes(row) && !makerRows.includes(row)));
  const specCount = specGroups.reduce((n, g) => n + g.rows.length, 0);
  // Collapsed, the specs show whole sections up to about SPECS_SHOWN rows.
  let shownRows = 0;
  const shownGroups = allSpecs
    ? specGroups
    : specGroups.filter((g, i) => {
        const keep = i === 0 || shownRows + g.rows.length <= SPECS_SHOWN;
        if (keep) shownRows += g.rows.length;
        return keep;
      });
  const inTheBox = info?.inTheBox || boxRows.map(([, v]) => v).join(', ');
  const warrantyInfo: [string, string | undefined][] = info?.warranty
    ? [
        ['Summary', info.warranty.summary],
        ['Period', info.warranty.period],
        ['Service', info.warranty.serviceType],
        ['Covered', info.warranty.covered],
      ]
    : warrantyRows;
  const makerInfo: [string, string | undefined][] = [
    ['Brand', product.brand],
    ['Model number', info?.modelNumber],
    ['Country of origin', info?.countryOfOrigin],
    ['Manufacturer', info?.manufacturer],
    ['Packer', info?.packer],
    ['Importer', info?.importer],
    ...makerRows.filter(([label]) => !(info?.modelNumber && /model/i.test(label)) && !(info?.countryOfOrigin && /origin/i.test(label))),
  ];

  // The buttons: only the ones this product has something for.
  const tabs = [
    { key: 'specs', label: 'Specifications', show: specCount > 0 },
    { key: 'description', label: 'Description', show: !!detail?.overview },
    { key: 'box', label: 'In the box', show: !!inTheBox },
    { key: 'warranty', label: 'Warranty', show: warrantyInfo.some(([, v]) => !!v) },
    { key: 'maker', label: 'Manufacturer info', show: makerInfo.filter(([, v]) => !!v).length > 1 },
  ].filter((t) => t.show);
  const activeTab = tabs.find((t) => t.key === tab)?.key ?? tabs[0]?.key;

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

  const cornerButton = 'flex h-9 w-9 items-center justify-center rounded-full border border-shop-line bg-white/90 shadow-sm backdrop-blur-sm transition-colors';

  function addOne() {
    addToCart(product!.id, 1, colour?.key);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }
  function buyNow() {
    if (!inCart(product!.id, colour?.key)) addToCart(product!.id, 1, colour?.key);
    navigate('/checkout');
  }
  const cartLabel = !orderable
    ? 'Currently unavailable'
    : !inStock
      ? 'Out of stock'
      : added
        ? 'Added'
        : inCart(product.id, colour?.key)
          ? 'Add another'
          : 'Add to cart';
  const cartButton =
    'flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-shop-ink bg-white text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-ink hover:text-white disabled:cursor-not-allowed disabled:border-shop-line disabled:bg-shop-canvas disabled:text-shop-ink/40';
  const buyButton =
    'flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-shop-ink text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent';
  const showBuyNow = !!checkout?.enabled && buyable;

  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:pb-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 overflow-hidden text-sm text-shop-ink/50"
        >
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
          <span className="truncate text-shop-ink">{title}</span>
        </nav>

        {/* Photos and the full story on the left; buying on the right. On a
            phone: photos, then buying, then the story. */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-[auto_1fr]">
          {/* Photos */}
          <div className={`${CARD} min-w-0 p-3 lg:col-start-1 lg:row-start-1`}>
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
                    className={`${cornerButton} ${wished ? 'border-shop-accent bg-shop-accent text-white' : 'text-shop-ink hover:border-shop-ink/40'}`}
                  >
                    <Heart className="h-4 w-4" fill={wished ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" onClick={() => void share()} aria-label="Share this product" className={`${cornerButton} text-shop-ink hover:border-shop-ink/40`}>
                    {shared ? <Check className="h-4 w-4 text-shop-accent" /> : <Share2 className="h-4 w-4" />}
                  </button>
                </>
              }
            />
            {shared && (
              <p className="mt-2 text-center text-xs text-shop-ink/55" role="status">
                Link copied
              </p>
            )}
          </div>

          {/* Buying */}
          <div
            ref={sticky.ref}
            style={{ '--sticky-top': `${sticky.top}px` } as React.CSSProperties}
            className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-[var(--sticky-top)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
          >
            <div className={CARD}>
              {/* Module — title */}
              <div className="px-5 py-5">
                <span className="text-sm font-semibold text-shop-accent">
                  {product.brand}
                  {category ? ` · ${category.name}` : ''}
                </span>
                <h1 className="mt-1 font-dm-sans text-2xl font-bold leading-tight text-shop-ink sm:text-[32px]" style={{ letterSpacing: '-0.03em' }}>
                  {title}
                </h1>
                {reviews.length > 0 && <RatingLine rating={rating} count={reviews.length} />}
                {/* Only said when it matters: a product that cannot be bought. */}
                {!orderable ? (
                  <p className="mt-2 text-sm font-medium text-shop-ink/60">Currently unavailable to order online</p>
                ) : (
                  !inStock && <p className="mt-2 text-sm font-medium text-red-600">Currently out of stock</p>
                )}
              </div>

              {/* Module — colour: a dot per colour, the chosen one ringed */}
              {colour && colours.length > 0 && (
                <div className="border-t border-shop-line px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={MICRO_LABEL}>Colour</span>
                    <span className="text-sm font-semibold text-shop-ink">{colour.name}</span>
                  </div>
                  <div role="radiogroup" aria-label="Colour" className="mt-3 flex flex-wrap items-center gap-3">
                    {colours.map((c) => {
                      const on = c.key === colour.key;
                      const out = !(c.inStock ?? product.inStock);
                      return (
                        <button
                          key={c.key}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-label={`${c.name}${out ? ' (out of stock)' : ''}`}
                          title={c.name}
                          onClick={() => chooseColour(c.key)}
                          className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 ${
                            on ? 'ring-2 ring-shop-ink ring-offset-2' : 'hover:scale-110'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-full w-full rounded-full border border-shop-ink/15 shadow-[inset_0_-5px_8px_rgba(0,0,0,0.12),inset_0_5px_8px_rgba(255,255,255,0.35)] ${
                              out ? 'opacity-45' : ''
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                          {out && <span aria-hidden="true" className="absolute h-px w-[115%] -rotate-45 bg-shop-ink/60" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Module — price */}
              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-shop-line px-5 py-4">
                <div>
                  <span className={MICRO_LABEL}>Price</span>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="font-dm-sans text-3xl font-bold tabular-nums text-shop-ink" style={{ letterSpacing: '-0.03em' }}>
                      {formatINR(price)}
                    </span>
                    {discount > 0 && <span className="font-inter text-sm tabular-nums text-shop-ink/40 line-through">{formatINR(mrp!)}</span>}
                  </div>
                  <span className="mt-1 block text-xs text-shop-ink/45">Inclusive of all taxes</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums text-shop-ink/55">You save {formatINR(mrp! - price)}</span>
                    <span className="rounded-full bg-shop-accent px-2.5 py-1 text-xs font-bold tabular-nums leading-none text-white">
                      −{discount}%
                    </span>
                  </div>
                )}
              </div>

              {/* Module — actions (on phones, the bar at the foot of the screen) */}
              <div className="hidden items-stretch gap-2 border-t border-shop-line p-3 lg:flex">
                <button type="button" disabled={!buyable} onClick={addOne} className={cartButton}>
                  {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  {cartLabel}
                </button>
                {showBuyNow && (
                  <button type="button" onClick={buyNow} className={buyButton}>
                    <Zap className="h-4 w-4" />
                    Buy now
                  </button>
                )}
              </div>

              {/* Module — bulk enquiry row */}
              <Link
                to="/contact"
                className="group flex items-center justify-between border-t border-shop-line px-5 py-3 text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-canvas"
              >
                Enquire for bulk pricing
                <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
              </Link>
            </div>

            <OffersCard offers={offers} pricePaise={pricePaise} />
            <DeliveryCard />
            <ProtectionCard plans={plans} pricePaise={pricePaise} />
          </div>

          {/* The story: highlights and every detail */}
          <div className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-2 lg:self-start">
            {highlights.length > 0 && (
              <Card label="Highlights">
                <ul className="grid grid-cols-1 gap-px bg-shop-line sm:grid-cols-2">
                  {highlights.map((h) => {
                    const Icon = iconForSpec(h);
                    return (
                      <li key={h} className="flex items-start gap-3 bg-white px-5 py-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-shop-canvas">
                          <Icon className="h-4 w-4 text-shop-ink" />
                        </span>
                        <span className="min-w-0 pt-2 text-sm font-medium leading-snug text-shop-ink">{h}</span>
                      </li>
                    );
                  })}
                  {highlights.length % 2 === 1 && <li className="hidden bg-white sm:block" aria-hidden="true" />}
                </ul>
              </Card>
            )}

            {tabs.length > 0 && (
              <Card label="All details">
                <div role="tablist" aria-label="Product details" className="flex gap-2 overflow-x-auto border-b border-shop-line px-5 py-3 [scrollbar-width:none]">
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === t.key}
                      onClick={() => setTab(t.key)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        activeTab === t.key
                          ? 'border-shop-ink bg-shop-ink text-white'
                          : 'border-shop-line bg-white text-shop-ink hover:border-shop-ink/40'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div role="tabpanel">
                  {activeTab === 'specs' && (
                    <>
                      {shownGroups.map((g, i) => (
                        <div key={g.title} className={i > 0 ? 'border-t border-shop-line' : ''}>
                          <h3 className="px-5 pb-1 pt-4 font-dm-sans text-base font-bold text-shop-ink">{g.title}</h3>
                          <InfoRows rows={g.rows} />
                        </div>
                      ))}
                      {shownGroups.length < specGroups.length || allSpecs ? (
                        <button
                          type="button"
                          onClick={() => setAllSpecs((a) => !a)}
                          className="flex w-full items-center justify-center gap-1.5 border-t border-shop-line py-3 text-sm font-semibold text-shop-ink transition-colors hover:bg-shop-canvas"
                        >
                          {allSpecs ? 'Show less' : `Show all ${specCount} specifications`}
                          <ChevronDown className={`h-4 w-4 transition-transform ${allSpecs ? 'rotate-180' : ''}`} />
                        </button>
                      ) : null}
                    </>
                  )}
                  {activeTab === 'description' && detail?.overview &&
                    (overviewList ? (
                      <ul className="divide-y divide-shop-line">
                        {overviewList.map((item) => (
                          <li key={item} className="flex items-start gap-3 px-5 py-3 text-sm leading-relaxed text-shop-ink/80">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-shop-accent" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-5 py-4 text-sm leading-relaxed text-shop-ink/80">{detail.overview}</p>
                    ))}
                  {activeTab === 'box' && <p className="px-5 py-4 text-sm leading-relaxed text-shop-ink/80">{inTheBox}</p>}
                  {activeTab === 'warranty' && <InfoRows rows={warrantyInfo} />}
                  {activeTab === 'maker' && <InfoRows rows={makerInfo} />}
                </div>
              </Card>
            )}

            {info?.videoUrl && /^https:\/\//.test(info.videoUrl) && (
              <a
                href={info.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${CARD} group flex items-center justify-between px-5 py-4 text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-canvas`}
              >
                <span className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-shop-accent" /> Watch the product video
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
              </a>
            )}
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

      {/* Phones: the buttons stay at the foot of the screen */}
      <div data-sticky-bar className="fixed inset-x-0 bottom-0 z-30 border-t border-shop-line bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl gap-2">
          <button type="button" disabled={!buyable} onClick={addOne} className={cartButton}>
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {cartLabel}
          </button>
          {showBuyNow && (
            <button type="button" onClick={buyNow} className={buyButton}>
              <Zap className="h-4 w-4" />
              Buy now
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
