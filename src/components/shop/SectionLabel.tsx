/** Small uppercase mono section heading with a trailing hairline rule —
 *  "— FILTERS", "— RESULTS" etc. Shared primitive for the shop page's
 *  spec-sheet design language. */
export default function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink/60">
        — {children}
      </span>
      <span className="h-px flex-1 bg-shop-line" aria-hidden="true" />
    </div>
  );
}
