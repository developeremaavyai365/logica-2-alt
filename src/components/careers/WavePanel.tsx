import type { ReactNode } from 'react';

export const CAREERS_NAVY = '#061A40';
export const CAREERS_BLUE = '#3D4FE0';

/** Deep-navy rounded panel with soft curved outlines — the backdrop for the
 *  role page's hero and closing call-to-action. */
export default function WavePanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden rounded-[28px] ${className}`} style={{ backgroundColor: CAREERS_NAVY }}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        viewBox="0 0 1200 450"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M0 40 C 180 0, 320 60, 360 180 S 260 420, 0 380" fill="#0B2352" stroke="#ffffff" strokeOpacity="0.12" />
        <path d="M300 450 C 330 330, 380 260, 420 290 S 480 420, 500 450" fill="#0B2352" stroke="#ffffff" strokeOpacity="0.12" />
        <path d="M1200 60 C 1020 20, 900 120, 940 230 S 1120 380, 1200 440" fill="#0B2352" stroke="#ffffff" strokeOpacity="0.12" />
      </svg>
      {children}
    </div>
  );
}
