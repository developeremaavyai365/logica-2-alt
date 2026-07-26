import { useEffect, useRef, useState } from 'react';

/** Types out `text` whenever this element scrolls into view, and resets so
 *  it replays every time the section is re-entered — same replay-on-view
 *  pattern used by StatsCounter / FollowUs. */
export default function TypewriterOnView({
  text,
  className,
  speed = 65,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let interval: ReturnType<typeof setInterval>;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          clearInterval(interval);
          if (entry.isIntersecting) {
            let i = 0;
            setDisplay('');
            interval = setInterval(() => {
              i += 1;
              setDisplay(text.slice(0, i));
              if (i >= text.length) clearInterval(interval);
            }, speed);
          } else {
            setDisplay('');
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [text, speed]);

  return (
    <span ref={ref} className={`inline-block ${className ?? ''}`}>
      {display}
      <span className="inline-block w-[1px] h-[0.9em] bg-current ml-0.5 align-middle animate-pulse" />
    </span>
  );
}
