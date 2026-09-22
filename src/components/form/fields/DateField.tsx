import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/** A custom calendar popover instead of the browser's native <input
 *  type="date"> — the native control renders a different, unstyleable
 *  picker per browser/OS (a real inconsistency, not just an aesthetic
 *  complaint), which is exactly the "typical" look this was asked to move
 *  away from. Value/onChange both use plain ISO date strings (YYYY-MM-DD)
 *  so it's a drop-in replacement wherever a date input was used. */
export default function DateField({
  label,
  id,
  value,
  onChange,
  accent = '#000000',
  max,
  className,
}: {
  label: string;
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  accent?: string;
  /** ISO date string; days after this are disabled. */
  max?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(value) : new Date()));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const maxDate = max ? new Date(max) : null;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`} style={{ '--accent': accent } as CSSProperties}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-[52px] w-full items-center gap-2.5 rounded-xl border-2 bg-white px-4 text-left text-sm outline-none transition-colors ${
          open ? 'border-[var(--accent)]' : 'border-[#000000]/10 hover:border-[#000000]/20'
        } ${value ? 'text-black' : 'text-[#9a9a9a]'}`}
      >
        <Calendar className="h-4 w-4 shrink-0 text-[#9a9a9a]" />
        {value ? formatDisplay(value) : 'Select a date'}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-72 rounded-2xl border border-[#000000]/10 bg-white p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b6b6b] transition-colors hover:bg-[#ECEDEC] hover:text-black"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-black">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b6b6b] transition-colors hover:bg-[#ECEDEC] hover:text-black"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w, i) => (
              <span key={i} className="text-[11px] font-medium text-[#9a9a9a]">
                {w}
              </span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={i} />;
              const cellDate = new Date(year, month, day);
              const iso = toISODate(cellDate);
              const selected = iso === value;
              const disabled = maxDate ? cellDate > maxDate : false;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors ${
                    selected
                      ? 'bg-[var(--accent)] font-semibold text-white'
                      : disabled
                        ? 'cursor-not-allowed text-[#d4d4d4]'
                        : 'text-black hover:bg-[#ECEDEC]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
