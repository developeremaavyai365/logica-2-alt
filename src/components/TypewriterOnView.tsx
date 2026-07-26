import { useEffect, useRef, useState } from 'react';

/** Types `text` out, pauses, deletes it, and retypes — looping continuously
 *  for as long as this element is scrolled into view. Stops and resets the
 *  moment it leaves the viewport, then starts the loop fresh on re-entry. */
export default function TypewriterOnView({
  text,
  className,
  typeSpeed = 65,
  deleteSpeed = 32,
  holdMs = 1400,
}: {
  text: string;
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  holdMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timeout: ReturnType<typeof setTimeout>;

    const loop = () => {
      let i = 0;
      let deleting = false;

      const tick = () => {
        if (!deleting) {
          i += 1;
          setDisplay(text.slice(0, i));
          if (i >= text.length) {
            deleting = true;
            timeout = setTimeout(tick, holdMs);
            return;
          }
          timeout = setTimeout(tick, typeSpeed);
        } else {
          i -= 1;
          setDisplay(text.slice(0, i));
          if (i <= 0) {
            deleting = false;
            timeout = setTimeout(tick, 300);
            return;
          }
          timeout = setTimeout(tick, deleteSpeed);
        }
      };

      timeout = setTimeout(tick, typeSpeed);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          clearTimeout(timeout);
          if (entry.isIntersecting) {
            setDisplay('');
            loop();
          } else {
            setDisplay('');
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [text, typeSpeed, deleteSpeed, holdMs]);

  return (
    <span ref={ref} className={`inline-block ${className ?? ''}`}>
      {display}
      <span className="inline-block w-[1px] h-[0.9em] bg-current ml-0.5 align-middle animate-pulse" />
    </span>
  );
}
