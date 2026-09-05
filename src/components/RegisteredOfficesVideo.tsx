import type { SyntheticEvent } from 'react';

/** Embeds the standalone "Offices across India" animated showcase (supplied
 *  by Armaan as a self-contained bundled HTML file — carries its own
 *  title/city cards/timeline UI) as the full segment. Served as a static
 *  asset from public/offices-video.html and mounted via iframe so the
 *  bundle's own JS/animation runs untouched, sandboxed from the app. */
export default function RegisteredOfficesVideo() {
  // The bundled player defaults its own root container to a near-black
  // background (the usual Remotion Player letterbox color) — override it
  // to white from the parent once the iframe document is available, since
  // the bundle's own body/CSS is otherwise already white.
  function handleLoad(e: SyntheticEvent<HTMLIFrameElement>) {
    const doc = e.currentTarget.contentDocument;
    if (!doc) return;

    try {
      const style = doc.createElement('style');
      style.textContent = 'html, body, #root, #root > div { background: #ffffff !important; }';
      doc.head.appendChild(style);
    } catch {
      // Ignore — falls back to the bundle's own background if this ever
      // runs cross-origin.
    }

    // The bundle already autoplays on its own (its composition defaults to
    // `autoplay = true`) — clicking the play button here would only ever
    // toggle an already-playing clip back to paused, which was the actual
    // bug. So: just wait for the control bar to exist and hide it, don't
    // touch playback state at all. The bundle's HTML loads (firing this
    // onLoad) before its React/player app finishes mounting — it's still
    // "Unpacking..." fonts/assets asynchronously at this point — so poll
    // briefly until the bar actually exists.
    let attempts = 0;
    const tryHideControls = () => {
      attempts += 1;
      const playButton = Array.from(doc.querySelectorAll('button')).find((b) =>
        (b.title || '').toLowerCase().includes('play'),
      );
      const controlsBar = playButton?.parentElement;
      if (controlsBar) {
        controlsBar.style.display = 'none';
        return;
      }
      if (attempts < 50) setTimeout(tryHideControls, 100);
    };
    tryHideControls();
  }

  return (
    // Held to the same max width and section padding as everything else on
    // the page, rather than running the film full-bleed edge to edge — at
    // full width and its native 3:2 ratio this stood over 900px tall on a
    // normal screen, dwarfing every section around it. The aspect ratio
    // itself is untouched, so the crop the bundle's own composition frames
    // is unchanged; only the footprint on wide screens comes down.
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div
        className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl"
        style={{ aspectRatio: '3 / 2' }}
      >
        <iframe
          src="/offices-video.html"
          title="Logica Infoway — Offices across India"
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          onLoad={handleLoad}
        />
      </div>
    </section>
  );
}
