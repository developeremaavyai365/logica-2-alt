import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

const PHRASES = ['Search latest products...', "Try 'laptops' or 'HP'...", 'Find your next upgrade...'];

export default function TypewriterSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [display, setDisplay] = useState('');
  const phraseIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);

  const showTypewriter = !focused && value.length === 0;

  useEffect(() => {
    if (!showTypewriter) return;

    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = PHRASES[phraseIndex.current];

      if (!deleting.current) {
        charIndex.current += 1;
        setDisplay(phrase.slice(0, charIndex.current));
        if (charIndex.current === phrase.length) {
          deleting.current = true;
          timeout = setTimeout(tick, 1400);
          return;
        }
        timeout = setTimeout(tick, 55);
      } else {
        charIndex.current -= 1;
        setDisplay(phrase.slice(0, charIndex.current));
        if (charIndex.current === 0) {
          deleting.current = false;
          phraseIndex.current = (phraseIndex.current + 1) % PHRASES.length;
          timeout = setTimeout(tick, 300);
          return;
        }
        timeout = setTimeout(tick, 28);
      }
    };

    timeout = setTimeout(tick, 400);
    return () => clearTimeout(timeout);
  }, [showTypewriter]);

  useEffect(() => {
    if (!showTypewriter) {
      charIndex.current = 0;
      deleting.current = false;
      setDisplay('');
    }
  }, [showTypewriter]);

  return (
    <div className="relative w-full max-w-sm group">
      {/* Glowing gradient ring on focus */}
      <div
        className={`pointer-events-none absolute -inset-[1.5px] rounded-full bg-[linear-gradient(90deg,#000000,#ECEDEC,#000000)] bg-[length:200%_100%] opacity-0 blur-[2px] transition-opacity duration-300 ${
          focused ? 'opacity-70 animate-[searchGlow_3s_linear_infinite]' : 'group-hover:opacity-30'
        }`}
      />
      <div className="relative flex items-center rounded-full border border-[#000000]/15 bg-[#ECEDEC] transition-colors focus-within:border-transparent">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#6b6b6b]/50" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={showTypewriter ? '' : 'Search this category...'}
          className="w-full rounded-full bg-transparent py-2.5 pl-10 pr-10 text-sm text-[#000000] outline-none"
        />
        {showTypewriter && (
          <span className="pointer-events-none absolute left-10 text-sm text-[#6b6b6b]/50 whitespace-nowrap overflow-hidden">
            {display}
            <span className="inline-block w-[1px] h-[1em] bg-[#6b6b6b]/60 ml-0.5 align-middle animate-pulse" />
          </span>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-3 text-[#6b6b6b]/50 hover:text-[#000000]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
