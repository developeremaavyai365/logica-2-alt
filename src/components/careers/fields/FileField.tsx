import { useRef, useState, type ChangeEvent } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

/** A real file input under the hood (visually hidden, still a genuine
 *  <input type="file"> so it rides in the form's FormData exactly as
 *  before) — the native file control can't be styled directly in any
 *  browser, so the dashed drop-zone look and the filename chip once
 *  something is picked are both built around it rather than on it. */
export default function FileField({
  label,
  name,
  id,
  accept,
  required,
  hint,
  compact,
}: {
  label: string;
  name: string;
  id: string;
  accept?: string;
  required?: boolean;
  hint?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.files?.[0]?.name ?? null);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = '';
    setFileName(null);
  }

  return (
    <div>
      <label
        htmlFor={id}
        className={`block font-semibold uppercase tracking-wide text-[#6b6b6b] ${
          compact ? 'mb-1 text-[11px]' : 'mb-2 text-xs'
        }`}
      >
        {label}
      </label>

      <input
        ref={inputRef}
        type="file"
        name={name}
        id={id}
        accept={accept}
        required={required}
        onChange={handleChange}
        className="sr-only"
      />

      {fileName ? (
        <div
          className={`flex items-center gap-3 rounded-xl border-2 border-[#15803D]/30 bg-[#15803D]/5 ${
            compact ? 'px-3.5 py-2' : 'px-4 py-3.5'
          }`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white">
            <FileText className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#000000]">{fileName}</span>
          <button
            type="button"
            onClick={clear}
            aria-label="Remove file"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6b6b6b] transition-colors hover:bg-[#000000]/5 hover:text-[#000000]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#000000]/15 bg-[#ECEDEC]/40 text-center transition-colors hover:border-[#15803D]/50 hover:bg-[#15803D]/5 ${
            compact ? 'px-3.5 py-2.5' : 'flex-col py-6 px-4'
          }`}
        >
          <UploadCloud className="h-4 w-4 shrink-0 text-[#6b6b6b]" />
          <span className="text-sm font-medium text-[#000000]">
            {compact ? 'Upload resume' : 'Click to upload your resume'}
          </span>
          {hint && !compact && <span className="text-xs text-[#6b6b6b]">{hint}</span>}
        </label>
      )}
    </div>
  );
}
