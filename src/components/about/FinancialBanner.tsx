import { ArrowUpRight } from 'lucide-react';
import { CAREERS_BLUE, CAREERS_NAVY } from '../careers/WavePanel';
import { OVERVIEW_FINANCIALS } from '../../about-data';

/** "₹1,31,572.09 lakhs" → 131572.09 */
const lakhs = (text: string) => Number(text.replace(/[^0-9.]/g, ''));

const current = lakhs(OVERVIEW_FINANCIALS.value);
const prior = lakhs(OVERVIEW_FINANCIALS.priorYearValue);
/** Growth worked out from the two published figures, so it can never
 *  disagree with them. */
const growth = prior > 0 ? ((current - prior) / prior) * 100 : 0;

const LABEL = 'text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]';

/** The Overview's financial headline, in the same light card language as
 *  the stats above it: one wide white card in three parts — this year's
 *  figure, the growth, last year's — with a thin blue line across the top
 *  and slim bars comparing the two years. */
export default function FinancialBanner() {
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.15)]">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${CAREERS_NAVY}, ${CAREERS_BLUE} 55%, #8FAEFF)` }}
      />

      <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-6 py-3.5 sm:px-8">
        <span className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: CAREERS_BLUE }}>
          Financial performance
        </span>
        <span className="text-xs text-[#6B7280]">{OVERVIEW_FINANCIALS.metric}</span>
      </div>

      <div className="grid grid-cols-1 divide-y divide-[#E5E7EB] sm:grid-cols-[1.3fr_1fr_1fr] sm:divide-x sm:divide-y-0">
        {/* This year */}
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <p className={LABEL}>FY{OVERVIEW_FINANCIALS.year}</p>
          <p
            className="mt-2 font-dm-sans font-bold"
            style={{ color: CAREERS_NAVY, fontSize: 'clamp(30px, 3.2vw, 40px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            {OVERVIEW_FINANCIALS.value}
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#EEF1F6]">
            <div className="h-full rounded-full" style={{ width: '100%', background: `linear-gradient(90deg, ${CAREERS_BLUE}, #8FAEFF)` }} />
          </div>
        </div>

        {/* Growth */}
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <p className={LABEL}>Growth</p>
          <p
            className="mt-2 flex items-center gap-1.5 font-dm-sans font-bold"
            style={{ color: CAREERS_BLUE, fontSize: 'clamp(30px, 3.2vw, 40px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            +{growth.toFixed(1)}%
            <ArrowUpRight className="h-7 w-7" strokeWidth={2.5} />
          </p>
          <p className="mt-3 text-sm text-[#6B7280]">Year on year</p>
        </div>

        {/* Last year */}
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <p className={LABEL}>FY{OVERVIEW_FINANCIALS.priorYear}</p>
          <p
            className="mt-2 font-dm-sans font-semibold text-[#6B7280]"
            style={{ fontSize: 'clamp(24px, 2.4vw, 30px)', letterSpacing: '-0.025em', lineHeight: 1.1 }}
          >
            {OVERVIEW_FINANCIALS.priorYearValue}
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#EEF1F6]">
            <div className="h-full rounded-full bg-[#C5CBD6]" style={{ width: `${(prior / current) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
