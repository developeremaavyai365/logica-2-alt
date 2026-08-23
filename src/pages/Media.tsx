import { useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MEDIA_ENTRIES, MEDIA_CERTIFICATES, type MediaEntry } from '../media-data';

function MediaCard({ entry }: { entry: MediaEntry }) {
  const [expanded, setExpanded] = useState(false);
  const cover = entry.images[0];
  const extra = entry.images.length - 1;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#000000] shadow-sm transition-shadow duration-300 hover:shadow-xl">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="relative block aspect-[4/3] w-full overflow-hidden"
      >
        <img
          src={cover}
          alt={entry.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

        {/* Category badge */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${
            entry.category === 'award' ? 'bg-black text-white' : 'bg-white text-[#000000]'
          }`}
        >
          {entry.category === 'award' ? '★ Award' : 'Celebration'}
        </span>

        {extra > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            +{extra} photo{extra > 1 ? 's' : ''}
          </span>
        )}

        {/* Title/date */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-left">
          <h3 className="text-sm font-bold leading-snug text-white sm:text-base" style={{ letterSpacing: '-0.01em' }}>
            {entry.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-white/70">{entry.date}</p>
        </div>
      </button>

      {/* Expanded photo strip */}
      {expanded && entry.images.length > 1 && (
        <div className="grid grid-cols-3 gap-1 bg-black p-1">
          {entry.images.map((img) => (
            <div key={img} className="aspect-square overflow-hidden">
              <img src={img} alt={entry.title} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Media() {
  const awards = useMemo(
    () => [...MEDIA_ENTRIES].filter((e) => e.category === 'award').sort((a, b) => (a.sortDate < b.sortDate ? 1 : -1)),
    [],
  );
  const celebrations = useMemo(
    () => [...MEDIA_ENTRIES].filter((e) => e.category === 'event').sort((a, b) => (a.sortDate < b.sortDate ? 1 : -1)),
    [],
  );

  return (
    <div className="w-full bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#000000]">
        <img
          src={awards[0]?.images[0]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/60 via-[#000000]/85 to-[#000000]" />
        <div className="relative">
          <Header />
          <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 text-center sm:px-6 sm:pb-24 md:px-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 sm:text-sm">Newsroom</span>
            <h1
              className="mt-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Awards &amp; Moments
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/60 sm:text-base">
              Recognition from the brands we partner with, and the moments that make Logica Infoway what it is.
            </p>
          </div>
        </div>
      </div>

      {/* Awards */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:px-10">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h2 className="text-2xl font-bold text-[#000000] sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>
              Awards &amp; Recognitions
            </h2>
            <p className="mt-1 text-sm text-[#6b6b6b]">{awards.length} accolades from our brand partners</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((entry) => (
            <MediaCard key={entry.title} entry={entry} />
          ))}
        </div>
      </section>

      {/* Celebrations */}
      <section className="bg-[#ECEDEC] px-4 py-16 sm:px-6 sm:py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl font-bold text-[#000000] sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>
              Celebrations &amp; Moments
            </h2>
            <p className="mt-1 text-sm text-[#6b6b6b]">Life at Logica — festivals, milestones, and team moments</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {celebrations.map((entry) => (
              <MediaCard key={entry.title} entry={entry} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand recognition */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:px-10">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl font-bold text-[#000000] sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>
            Brand Recognition &amp; Certifications
          </h2>
          <p className="mt-1 text-sm text-[#6b6b6b]">Authorized partner certifications from the brands we carry</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
          {MEDIA_CERTIFICATES.map((cert) => (
            <div
              key={cert.name}
              className="group flex flex-col items-center rounded-xl border border-[#000000]/10 p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#000000]/25 hover:shadow-md"
            >
              <div className="mb-2 aspect-square w-full overflow-hidden rounded-lg bg-white">
                <img
                  src={cert.image}
                  alt={cert.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-[10px] font-medium text-[#6b6b6b]">{cert.name}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
