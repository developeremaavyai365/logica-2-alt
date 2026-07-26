import { useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MEDIA_ENTRIES, MEDIA_CERTIFICATES } from '../media-data';

export default function Media() {
  const byYear = useMemo(() => {
    const sorted = [...MEDIA_ENTRIES].sort((a, b) => (a.sortDate < b.sortDate ? 1 : -1));
    const groups = new Map<string, typeof sorted>();
    for (const entry of sorted) {
      const year = entry.sortDate.slice(0, 4);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(entry);
    }
    return Array.from(groups.entries());
  }, []);

  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-[#3d5638] text-xs sm:text-sm font-semibold uppercase tracking-wide">Media</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
            Awards &amp; Moments
          </h1>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        {byYear.map(([year, entries]) => (
          <div key={year} className="mb-14">
            <h2 className="text-2xl font-semibold text-[#1f2a1d] mb-6">{year}</h2>
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.title} className="rounded-2xl border border-[#1f2a1d]/10 p-5 sm:p-6">
                  <div className={`grid gap-2 mb-4 ${entry.images.length === 1 ? 'grid-cols-1' : entry.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {entry.images.slice(0, 3).map((img) => (
                      <div key={img} className="aspect-video rounded-xl overflow-hidden bg-[#f4f8f3]">
                        <img src={img} alt={entry.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  {entry.images.length > 3 && (
                    <p className="text-xs text-[#4b5b47]/70 mb-2">+{entry.images.length - 3} more</p>
                  )}
                  <span
                    className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full mb-2 ${
                      entry.category === 'award' ? 'bg-[#F0F048]/40 text-[#7a6a00]' : 'bg-[#78C0F0]/30 text-[#1f5a8a]'
                    }`}
                  >
                    {entry.category === 'award' ? 'Award' : 'Celebration'}
                  </span>
                  <h3 className="text-base font-semibold text-[#1f2a1d]">{entry.title}</h3>
                  <p className="text-xs text-[#4b5b47] mt-1">{entry.date}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-16">
          <h2 className="text-xl font-semibold text-[#1f2a1d] mb-6">Brand recognition &amp; certifications</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {MEDIA_CERTIFICATES.map((cert) => (
              <div key={cert.name} className="rounded-xl border border-[#1f2a1d]/10 p-3 flex flex-col items-center text-center">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#f4f8f3] mb-2">
                  <img src={cert.image} alt={cert.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-[#4b5b47]">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
