import { CAREERS_NAVY } from '../../components/careers/WavePanel';
import { ABOUT_CARD } from '../../components/about/AboutHero';
import { COMMITTEES } from '../../about-data';

/** The Composition of Committees tab of the About page: each committee as
 *  a plain card, its members listed with their roles. */
export default function Committees() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:px-10">
      <h2
        className="font-dm-sans font-bold"
        style={{ color: CAREERS_NAVY, fontSize: 'clamp(24px, 2.6vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
      >
        Board Committees
      </h2>

      {/* Two to a row; a last card on its own sits in the middle. */}
      <div className="mt-8 flex flex-wrap justify-center gap-6">
        {COMMITTEES.map((committee, i) => (
          <div
            key={committee.name}
            className={`animate-fade-up w-full lg:w-[calc(50%-12px)] ${ABOUT_CARD}`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <h3 className="border-b border-[#E5E7EB] px-6 py-5 text-lg font-semibold sm:px-7" style={{ color: CAREERS_NAVY }}>
              {committee.name}
            </h3>
            <ul className="divide-y divide-[#EEF1F6] px-6 sm:px-7">
              {committee.members.map((m) => (
                <li key={m.name} className="flex items-center justify-between gap-4 py-3.5 text-[15px]">
                  <span className="font-medium" style={{ color: CAREERS_NAVY }}>
                    {m.name}
                  </span>
                  <span className="text-right text-[#6B7280]">{m.role}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
