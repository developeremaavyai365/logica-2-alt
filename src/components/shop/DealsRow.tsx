import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { formatINR, type Product } from '../../data';
import { CARD_TONES, type CardTone } from './card-tones';
import { baseName } from '../../product-colours';

/* A row of tall colour cards, in the manner of a marketplace's deal strip:
   each card leads with a bold headline on a saturated ground and shows the
   product in a white panel underneath. Every number on them is worked out
   from the catalogue's own MRP and price — nothing is invented.

   The row is a five-column grid on desktop and a sideways-scrolling strip
   below that, so the cards keep their shape instead of squeezing. */

/** Deal end time: 23:59:59 IST today, derived (not fabricated) — there's no
 *  real deals table, so the "deal" is just today's best-discount in-stock
 *  product with a countdown to end of day IST. IST is a fixed UTC+5:30
 *  offset (no DST), so this is exact without needing a timezone library. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function endOfTodayIST(): Date {
  const nowIstMs = Date.now() + IST_OFFSET_MS;
  const istDayStartUtcMs = Math.floor(nowIstMs / 86400000) * 86400000;
  const istEndOfDayMs = istDayStartUtcMs + 86400000 - 1;
  return new Date(istEndOfDayMs - IST_OFFSET_MS);
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function discountOf(p: Product) {
  return p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
}

type Tone = CardTone;

const DEAL_TONE: Tone = CARD_TONES.blue;
const GRID_TONE: Tone = CARD_TONES.navy;
const PROMO_TONES: Tone[] = [CARD_TONES.orange, CARD_TONES.crimson, CARD_TONES.green];

const CARD_SHAPE =
  'group relative flex min-h-[430px] w-[250px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl p-4 text-white xl:w-auto';
/** The lift-on-hover, for the cards that are one link as a whole. */
const CARD =
  `${CARD_SHAPE} transition-all duration-300 ease-out hover:shadow-[0_28px_50px_-24px_rgba(0,0,0,0.55)] motion-safe:hover:-translate-y-1`;

const HEADLINE = 'font-dm-sans text-[27px] font-bold leading-[1.05]';
const MICRO = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em]';

/** The white panel the product photo sits in, with a pill along its foot. */
function ImagePanel({ product, pill, children }: { product: Product; pill: string; children: ReactNode }) {
  return (
    <div className="relative mt-4 min-h-[190px] flex-1 overflow-hidden rounded-xl bg-white">
      <img
        src={product.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-contain p-5 pb-12 transition-transform duration-300 motion-safe:group-hover:scale-[1.05]"
      />
      <span
        className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white"
        style={{ backgroundColor: pill }}
      >
        {children}
      </span>
    </div>
  );
}

/** The two facts under a headline, split by a hairline. */
function Facts({ left, right }: { left: string; right?: string }) {
  return (
    <div className="mt-3 flex items-center gap-2.5 text-xs font-medium leading-tight text-white/85">
      <span>{left}</span>
      {right && (
        <>
          <span className="h-6 w-px bg-white/35" aria-hidden="true" />
          <span>{right}</span>
        </>
      )}
    </div>
  );
}

function DealCard({ product }: { product: Product }) {
  const [end] = useState(endOfTodayIST);
  const [remaining, setRemaining] = useState(() => end.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(end.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [end]);

  const discount = discountOf(product);
  const expired = remaining <= 0;
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;

  return (
    <Link to={`/product/${product.id}`} className={CARD} style={{ background: DEAL_TONE.ground }}>
      <span className={`flex items-center gap-1.5 text-white/80 ${MICRO}`}>
        <Zap className="h-3.5 w-3.5" fill="currentColor" />
        Deal of the day
      </span>
      <h3 className={`mt-2 ${HEADLINE}`} style={{ letterSpacing: '-0.03em' }}>
        {discount > 0 ? `${discount}% off` : 'Today’s pick'}
        <br />
        {product.brand}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-snug text-white/85">{baseName(product)}</p>
      <Facts left={`Now ${formatINR(product.price)}`} right={product.mrp && discount > 0 ? `Was ${formatINR(product.mrp)}` : undefined} />

      <ImagePanel product={product} pill={DEAL_TONE.pill}>
        {expired ? (
          'Deal ended — next deal soon'
        ) : (
          <span className="font-mono tabular-nums tracking-wide">
            Ends in {pad(hh)}:{pad(mm)}:{pad(ss)}
          </span>
        )}
      </ImagePanel>
    </Link>
  );
}

function PromoCard({ product, tone }: { product: Product; tone: Tone }) {
  const discount = discountOf(product);
  const saving = product.mrp && discount > 0 ? product.mrp - product.price : 0;

  return (
    <Link to={`/product/${product.id}`} className={CARD} style={{ background: tone.ground }}>
      <h3 className={HEADLINE} style={{ letterSpacing: '-0.03em' }}>
        {discount > 0 ? `${discount}% off` : 'Featured'}
        <br />
        {product.brand}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-snug text-white/85">{baseName(product)}</p>
      <Facts left={`Now ${formatINR(product.price)}`} right={saving > 0 ? `Save ${formatINR(saving)}` : undefined} />

      <ImagePanel product={product} pill={tone.pill}>
        Shop now
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
      </ImagePanel>
    </Link>
  );
}

/** Four more deals as a 2×2 of small white tiles, each with its own
 *  discount badge and its own link. */
function GridCard({ products }: { products: Product[] }) {
  return (
    <div className={CARD_SHAPE} style={{ background: GRID_TONE.ground }}>
      <h3 className={HEADLINE} style={{ letterSpacing: '-0.03em' }}>
        More top
        <br />
        deals
      </h3>
      <p className="mt-2 text-sm leading-snug text-white/85">The next biggest price drops in the store.</p>

      <div className="mt-4 grid flex-1 grid-cols-2 gap-2">
        {products.slice(0, 4).map((p) => {
          const discount = discountOf(p);
          return (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              aria-label={`${baseName(p)}${discount > 0 ? `, ${discount}% off` : ''}`}
              className="group/tile relative min-h-[120px] overflow-hidden rounded-xl bg-white transition-transform duration-300 motion-safe:hover:-translate-y-0.5"
            >
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-3 pb-8 transition-transform duration-300 motion-safe:group-hover/tile:scale-[1.06]"
              />
              {discount > 0 && (
                <span className="absolute bottom-2 left-2 rounded-md bg-[#D62246] px-1.5 py-1 font-mono text-[10px] font-bold leading-none text-white">
                  {discount}% off
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DealsRow({
  deal,
  promos,
  grid,
}: {
  deal: Product | undefined;
  promos: Product[];
  grid: Product[];
}) {
  if (!deal && promos.length === 0 && grid.length === 0) return null;

  // The grid tracks follow how many cards there actually are, so a short
  // catalogue (a category page with few discounted products) still fills
  // the row instead of leaving empty columns.
  const count = (deal ? 1 : 0) + promos.length + (grid.length > 0 ? 1 : 0);

  return (
    <div
      className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-1 pt-1 sm:-mx-6 sm:px-6 xl:mx-0 xl:grid xl:grid-cols-[repeat(var(--cards),minmax(0,1fr))] xl:overflow-visible xl:px-0"
      style={{ '--cards': count } as CSSProperties}
    >
      {deal && <DealCard product={deal} />}
      {promos.map((p, i) => (
        <PromoCard key={p.id} product={p} tone={PROMO_TONES[i % PROMO_TONES.length]} />
      ))}
      {grid.length > 0 && <GridCard products={grid} />}
    </div>
  );
}
