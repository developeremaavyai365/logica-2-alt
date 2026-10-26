import { useMemo, useState, type ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { CAREERS_BLUE, CAREERS_NAVY } from '../components/careers/WavePanel';
import MediaLightbox, { type LightboxPhoto } from '../components/media/MediaLightbox';
import HighlightsSlider from '../components/media/HighlightsSlider';
import PhotoMosaic from '../components/media/PhotoMosaic';
import Reveal from '../components/media/Reveal';
import { MEDIA_ENTRIES, MEDIA_CERTIFICATES, type MediaEntry } from '../media-data';

const byNewest = (a: MediaEntry, b: MediaEntry) => (a.sortDate < b.sortDate ? 1 : -1);
const AWARDS = MEDIA_ENTRIES.filter((e) => e.category === 'award').sort(byNewest);
const CELEBRATIONS = MEDIA_ENTRIES.filter((e) => e.category === 'event').sort(byNewest);
/** Every photo of every award, newest award first, each its own slide. The
 *  showcase is the only place awards appear, so no award photo shows twice. */
const HIGHLIGHTS = AWARDS.flatMap((e) => e.images.map((src) => ({ src, title: e.title, date: e.date })));
const HIGHLIGHT_PHOTOS: LightboxPhoto[] = HIGHLIGHTS.map((h) => ({ src: h.src, title: h.title, meta: h.date }));

/** A section title, centred: a small blue label over the heading. */
function SectionHeading({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div className="text-center">
      <span className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: CAREERS_BLUE }}>
        {eyebrow}
      </span>
      <h2
        className="mt-3 font-dm-sans font-bold"
        style={{ color: CAREERS_NAVY, fontSize: 'clamp(26px, 3vw, 40px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
      >
        {children}
      </h2>
    </div>
  );
}

const photosOf = (entry: MediaEntry): LightboxPhoto[] => entry.images.map((src) => ({ src, title: entry.title, meta: entry.date }));

/** One award or celebration: its badge, date and title centred on top, and
 *  its photos below across the full width, each of which opens full screen. */
function EntryRow({ entry, onOpen }: { entry: MediaEntry; onOpen: (photos: LightboxPhoto[], index: number) => void }) {
  return (
    <Reveal>
      <article>
        <header className="mx-auto mb-8 flex max-w-3xl flex-col items-center text-center sm:mb-10">
          <h3
            className="font-dm-sans font-bold text-[#061A40]"
            style={{ fontSize: 'clamp(24px, 3vw, 38px)', letterSpacing: '-0.025em', lineHeight: 1.15 }}
          >
            {entry.title}
          </h3>
        </header>
        <div className={entry.images.length === 1 ? 'mx-auto max-w-4xl' : ''}>
          <PhotoMosaic photos={entry.images} title={entry.title} onOpen={(i) => onOpen(photosOf(entry), i)} />
        </div>
      </article>
    </Reveal>
  );
}

/** Between two entries: a fine line fading in and out, a blue dot at its
 *  centre. */
function Divider() {
  return (
    <div aria-hidden="true" className="mx-auto my-16 flex w-56 items-center gap-3 sm:my-24">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C9D3F2]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#3D4FE0]" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C9D3F2]" />
    </div>
  );
}

function Entries({ entries, onOpen }: { entries: MediaEntry[]; onOpen: (photos: LightboxPhoto[], index: number) => void }) {
  return (
    <div className="mt-12 sm:mt-16">
      {entries.map((entry, i) => (
        <div key={entry.title}>
          {i > 0 && <Divider />}
          <EntryRow entry={entry} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}

/** The Media tab of the About page: the awards showcase, celebrations and
 *  certifications, under the About page's hero. */
export default function Media() {
  const [lightbox, setLightbox] = useState<{ photos: LightboxPhoto[]; index: number } | null>(null);
  const open = (photos: LightboxPhoto[], index: number) => setLightbox({ photos, index });

  const certificatePhotos = useMemo<LightboxPhoto[]>(
    () => MEDIA_CERTIFICATES.map((c) => ({ src: c.image, title: c.name, meta: 'Brand recognition' })),
    [],
  );

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 md:px-10">
        <Reveal>
          <SectionHeading eyebrow="Highlights">Awards &amp; Recognitions</SectionHeading>
        </Reveal>
        <Reveal delay={120} className="mt-10">
          <HighlightsSlider slides={HIGHLIGHTS} onOpen={(i) => open(HIGHLIGHT_PHOTOS, i)} />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 md:px-10">
        <Reveal>
          <SectionHeading eyebrow="Life at Logica">Celebrations &amp; Moments</SectionHeading>
        </Reveal>
        <Entries entries={CELEBRATIONS} onOpen={open} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 md:px-10">
        <Reveal>
          <SectionHeading eyebrow="Authorized partner certifications">Brand Recognition &amp; Certifications</SectionHeading>
        </Reveal>
        {/* Ten certificates: five to a row from md up (two full rows), two to a
            row on a phone (five full rows), so no row is left part-empty. */}
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:mt-16 md:grid-cols-5 md:gap-x-6">
          {MEDIA_CERTIFICATES.map((cert, i) => (
            <Reveal key={cert.name} delay={(i % 5) * 80}>
              <button
                type="button"
                onClick={() => open(certificatePhotos, i)}
                aria-label={`View ${cert.name} certificate`}
                className="group flex w-full flex-col items-center text-center"
              >
                <span className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-[0_22px_44px_-26px_rgba(6,26,64,0.5)] ring-1 ring-[#061A40]/[0.06] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_34px_60px_-28px_rgba(6,26,64,0.55)]">
                  <img
                    src={cert.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                  <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/90 text-[#061A40] opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <Maximize2 className="h-4 w-4" />
                  </span>
                </span>
                {/* Room for two lines on every name, so the rows line up. */}
                <span className="mt-4 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-[#061A40] transition-colors group-hover:text-[#3D4FE0]">
                  {cert.name}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {lightbox && <MediaLightbox photos={lightbox.photos} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </>
  );
}
