import { forwardRef, type InputHTMLAttributes } from 'react';

/** The careers section's own input style — distinct from the plain grey-fill
 *  inputs the rest of the site uses (ContactFormSection, FilterSidebar):
 *  white fill, a visible border that lifts to the section's green accent on
 *  focus rather than black, and a floating label that's always present
 *  above the field rather than a placeholder that disappears once typing
 *  starts. One component rather than the input JSX repeated per field, so
 *  every field in the section picks up the same look from one place.
 *
 *  `compact` trims height and label spacing for the Apply page's
 *  photo-paired layout, which is height-capped to the viewport on desktop —
 *  the default size stays what Open Roles' fields use. */
interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  compact?: boolean;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, id, className, compact, ...props },
  ref,
) {
  return (
    <div className={className}>
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
        className={`w-full rounded-xl border-2 border-[#000000]/10 bg-white text-sm text-[#000000] outline-none transition-colors placeholder:text-[#6b6b6b]/50 focus:border-[#15803D] ${
          compact ? 'h-10 px-3.5' : 'h-[52px] px-4 py-3.5'
        }`}
      />
    </div>
  );
});

export default TextField;
