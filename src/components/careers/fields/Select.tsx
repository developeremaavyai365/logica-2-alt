import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type SelectOption = { value: string; label: string };

/** A built dropdown rather than a native <select> — a native select's own
 *  open panel can't be styled at all in most browsers (no rounded corners,
 *  no custom hover state, no brand colour on the selected row), which is
 *  exactly the "generic" look this was asked to move away from. Closes on
 *  an outside click or Escape; Enter/Space opens it from the trigger. */
export default function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  options: SelectOption[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

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

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      {label && (
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">{label}</span>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-[52px] w-full items-center justify-between gap-2 rounded-xl border-2 bg-white px-4 text-sm text-[#000000] transition-colors ${
          open ? 'border-[#15803D]' : 'border-[#000000]/10 hover:border-[#000000]/20'
        }`}
      >
        <span className="truncate">{current?.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#6b6b6b] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#000000]/10 bg-white py-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)]"
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                    selected ? 'font-semibold text-[#15803D]' : 'text-[#000000] hover:bg-[#ECEDEC]/60'
                  }`}
                >
                  {opt.label}
                  {selected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
