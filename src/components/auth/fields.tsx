import { useState, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/* The About and Contact pages' palette: navy, with the brand blue on hover
   and focus. */
export const AUTH_SUBMIT =
  'group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#061A40] text-[15px] font-semibold text-white ' +
  'shadow-[0_12px_24px_-12px_rgba(6,26,64,0.6)] transition-colors duration-300 hover:bg-[#3D4FE0] disabled:cursor-not-allowed disabled:opacity-50';
export const AUTH_HEADING = 'font-dm-sans text-[28px] font-bold text-[#061A40]';

/** One field: an icon, the input, and (for passwords) the show/hide toggle.
 *  On focus the border turns blue with a soft blue halo. */
export function IconField({
  icon,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
}: {
  icon: ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="group/field flex h-[52px] items-stretch overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-[#C7D2FE] focus-within:border-[#3D4FE0] focus-within:shadow-[0_0_0_4px_rgba(61,79,224,0.12)]">
      <span className="flex w-12 shrink-0 items-center justify-center text-[#9CA3AF] transition-colors group-focus-within/field:text-[#3D4FE0]">
        {icon}
      </span>
      <input
        type={resolvedType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="min-w-0 flex-1 bg-transparent pr-3.5 text-sm text-[#061A40] outline-none placeholder:text-[#9CA3AF]"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="flex w-12 shrink-0 items-center justify-center text-[#9CA3AF] transition-colors hover:text-[#3D4FE0]"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
