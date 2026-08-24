import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

// Real reels from the official Logica Infoway Instagram account — add more
// permalinks here as new reels go up; each renders via Instagram's own
// oEmbed widget so it always reflects the live post (likes, caption, etc).
const REEL_PERMALINKS: string[] = ['https://www.instagram.com/reel/DcSxqsMTB2Z/'];

function useInstagramEmbedScript(deps: unknown[]) {
  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.instagram.com/embed.js"]');
    if (existing) {
      existing.addEventListener('load', () => window.instgrm?.Embeds.process());
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => window.instgrm?.Embeds.process();
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function ReelEmbed({ permalink }: { permalink: string }) {
  const ref = useRef<HTMLQuoteElement>(null);

  return (
    <blockquote
      ref={ref}
      className="instagram-media shrink-0 snap-start"
      data-instgrm-permalink={permalink}
      data-instgrm-version="14"
      style={{ margin: 0, width: 'min(320px, 85vw)' }}
    />
  );
}

export default function CompanyReels() {
  useInstagramEmbedScript([]);

  return (
    <section className="w-full bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <h2
        className="font-dm-sans mx-auto max-w-6xl bg-gradient-to-r from-black to-[#15803D] bg-clip-text font-extrabold text-transparent"
        style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', letterSpacing: '-0.04em' }}
      >
        From the Logica Floor
      </h2>
      <p
        className="font-inter mx-auto mt-2 max-w-6xl bg-gradient-to-r from-black to-[#15803D] bg-clip-text text-sm font-extrabold text-transparent sm:text-base"
        style={{ letterSpacing: '-0.01em' }}
      >
        A look inside our stores, launches and everyday work — straight from @logicainfowayofficial.
      </p>

      <div className="scrollbar-none mx-auto mt-8 flex max-w-6xl snap-x snap-mandatory justify-center gap-4 overflow-x-auto pb-2 sm:gap-5">
        {REEL_PERMALINKS.map((permalink) => (
          <ReelEmbed key={permalink} permalink={permalink} />
        ))}
      </div>
    </section>
  );
}
