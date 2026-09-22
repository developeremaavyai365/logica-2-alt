import { forwardRef, type CSSProperties, type TextareaHTMLAttributes } from 'react';

const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; accent?: string; compact?: boolean }
>(function TextAreaField({ label, id, className, accent = '#000000', compact, style, ...props }, ref) {
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
      <textarea
        ref={ref}
        id={id}
        {...props}
        className={`w-full resize-none rounded-xl border-2 border-[#000000]/10 bg-white text-sm text-[#000000] outline-none transition-colors placeholder:text-[#6b6b6b]/50 focus:border-[var(--accent)] ${
          compact ? 'px-3.5 py-2.5' : 'px-4 py-3.5'
        }`}
      />
    </div>
  );
});

export default TextAreaField;
