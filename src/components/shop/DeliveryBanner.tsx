import { useEffect, useState } from 'react';
import { ArrowRight, Check, Zap } from 'lucide-react';
import { EXPRESS_DELIVERY, isExpressPincode } from '../../stores-config';
import ExpressScene from './ExpressScene';

const LAST_PINCODE_KEY = 'logica2-last-pincode';
const MICRO_LABEL = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em]';

/** The yellow from the Logica mark — on this banner it is the clock, the lit
 *  windows, the rider's parcel and the promise in the headline. */
const GLOW = '#FFD43B';

type Result = { pincode: string; status: 'express' | 'standard' | 'invalid' };

/** The express-delivery advertisement: orders placed on the site from Delhi
 *  NCR arrive in under an hour. The headline and the pincode ticket sit over
 *  a looping film (ExpressScene) of a rider crossing the city at night while
 *  a sixty-minute clock runs down. */
export default function DeliveryBanner() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_PINCODE_KEY);
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
        setResult({ pincode: saved, status: isExpressPincode(saved) ? 'express' : 'standard' });
      }
    } catch {
      // localStorage unavailable — non-fatal, just skip remembering.
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setResult({ pincode, status: 'invalid' });
      return;
    }
    setResult({ pincode, status: isExpressPincode(pincode) ? 'express' : 'standard' });
    try {
      localStorage.setItem(LAST_PINCODE_KEY, pincode);
    } catch {
      // ignore
    }
  }

  return (
    <section
      aria-label={`Express delivery in ${EXPRESS_DELIVERY.region}`}
      className="relative isolate overflow-hidden rounded-3xl text-white"
      style={{ background: 'linear-gradient(180deg, #050722 0%, #0E1760 44%, #2738BE 76%, #4D5FF2 100%)' }}
    >
      <ExpressScene />

      {/* Foreground — the headline and the ticket. The bottom padding keeps
          them clear of the street the film plays on. */}
      <div className="relative z-10 flex flex-col gap-8 px-6 pb-[236px] pt-8 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10 lg:px-10 lg:pb-[226px] lg:pt-10">
        <div className="min-w-0 max-w-xl">
          <p className="text-lg font-medium text-white/60 sm:text-xl">
            Why wait till <span className="line-through decoration-2" style={{ textDecorationColor: GLOW }}>tomorrow</span>?
          </p>
          <h2
            className="mt-1 font-dm-sans text-[40px] font-bold leading-[0.98] sm:text-6xl"
            style={{ letterSpacing: '-0.045em' }}
          >
            At your doorstep
            <br />
            <span style={{ color: GLOW, textShadow: '0 0 34px rgba(255, 212, 59, 0.45)' }}>in 1 hour.</span>
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Order on the site from anywhere in {EXPRESS_DELIVERY.region} and Logica brings it to your doorstep in 1 hour.
          </p>
        </div>

        {/* The ticket. The shadow is a drop-shadow on this wrapper because
            the ticket itself is masked to cut the two notches out of its
            sides, and a mask would cut an ordinary box-shadow off with it. */}
        <div className="w-full shrink-0 transition-transform duration-500 ease-out [filter:drop-shadow(0_24px_30px_rgba(0,0,0,0.45))] focus-within:rotate-0 lg:w-[21rem] lg:rotate-[2deg] lg:hover:rotate-0">
          <form onSubmit={handleSubmit} className="express-ticket bg-white text-shop-ink">
            <div className="px-5 pb-5 pt-4">
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 text-shop-accent ${MICRO_LABEL}`}>
                  <Zap className="h-3 w-3" fill="currentColor" />
                  Express pass
                </span>
                <span className={`text-shop-ink/40 ${MICRO_LABEL}`}>{EXPRESS_DELIVERY.region}</span>
              </div>
              <label htmlFor="shop-pincode" className="mt-3 block text-xl font-semibold leading-tight" style={{ letterSpacing: '-0.02em' }}>
                Is your pincode in the 1-hour zone?
              </label>

              <div className="mt-4 flex items-stretch overflow-hidden rounded-xl border border-shop-line bg-shop-canvas transition-colors focus-within:border-shop-accent focus-within:bg-white">
                <input
                  id="shop-pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Pincode"
                  inputMode="numeric"
                  aria-label="Enter your pincode"
                  className="h-12 w-full min-w-0 flex-1 bg-transparent px-4 font-mono text-base tabular-nums tracking-[0.2em] text-shop-ink outline-none placeholder:tracking-normal placeholder:text-shop-ink/35"
                />
                <button
                  type="submit"
                  className="group flex shrink-0 items-center gap-1.5 bg-shop-ink px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
                >
                  Check
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* The tear line, level with the notches */}
            <div className="mx-5 border-t-2 border-dashed border-shop-line" aria-hidden="true" />

            <p aria-live="polite" className="flex h-[68px] items-center px-5 text-sm leading-snug">
              {result?.status === 'express' && (
                <span className="flex items-start gap-2 font-semibold text-shop-ink">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-shop-accent text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {result.pincode} is in {EXPRESS_DELIVERY.region} — at your doorstep in 1 hour.
                </span>
              )}
              {result?.status === 'standard' && (
                <span className="text-shop-ink/60">
                  {result.pincode} is outside {EXPRESS_DELIVERY.region} — standard delivery applies.
                </span>
              )}
              {result?.status === 'invalid' && <span className="font-medium text-red-600">Enter a 6-digit pincode.</span>}
              {!result && <span className="text-shop-ink/45">Enter your pincode to see if express delivery reaches you.</span>}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
