import { forwardRef, type CSSProperties, type InputHTMLAttributes } from 'react';

/** Shared input style used across every form on the site (contact, careers,
 *  auth, reviews, feedback) instead of each one hand-rolling its own input
 *  JSX: white fill, a visible border that lifts to an accent color on focus,
 *  and a floating uppercase label that's always present above the field
 *  rather than a placeholder that disappears once typing starts. One
 *  component means every form's fields move together if the look changes.
 *
 *  `accent` lets each section keep its own identity (green for careers,
 *  amber for reviews, black everywhere else) without forking the component —
 *  it's just the focus border/ring color. */
interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  accent?: string;
  compact?: boolean;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, id, className, accent = '#000000', compact, style, ...props },
  ref,
) {
  return (
    <div className={className} style={{ ...style, '--accent': accent } as CSSProperties}>
      <label
        htmlFor={id}
        className={`block font-semibold uppercase tracking-wide text-[#6b6b6b] ${
          compact ? 'mb-1 text-[11px]' : 'mb-2 text-xs'
        }`}
      >
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        {...props}
        className={`w-full rounded-xl border-2 border-[#000000]/10 bg-white text-sm text-[#000000] outline-none transition-colors placeholder:text-[#6b6b6b]/50 focus:border-[var(--accent)] ${
          compact ? 'h-10 px-3.5' : 'h-[52px] px-4 py-3.5'
        }`}
      />
    </div>
  );
});

export default TextField;
