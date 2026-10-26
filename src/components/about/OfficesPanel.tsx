import { Phone } from 'lucide-react';
import WavePanel from '../careers/WavePanel';
import { AboutHeading } from './AboutHero';
import { offices } from '../../data';

/** "Kolkata, West Bengal – 700072" → "Kolkata, West Bengal 700072": the
 *  About and Contact pages keep their text free of dashes. Dashes inside an
 *  address number (A-78, S-102) are part of it and stay. */
export const withoutDash = (address: string) => address.replace(/\s*[–—]\s*/g, ' ');

/** Every office in the navy wave panel, as on the About overview. Each phone
 *  number is on its own line and is a tap-to-call link. */
export default function OfficesPanel({ eyebrow = 'Where we operate', title = 'Our offices' }: { eyebrow?: string; title?: string }) {
  return (
    <div className="px-4 pb-16 sm:px-6 sm:pb-20 md:px-10">
      <WavePanel className="mx-auto max-w-[1200px]">
        <div className="px-6 py-14 sm:px-12 sm:py-16">
          <AboutHeading eyebrow={eyebrow} light>
            {title}
          </AboutHeading>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offices.map((office) => {
              const numbers = office.phone.split(' / ');
              return (
                <div
                  key={office.city}
                  className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.1]"
                >
                  <h3 className="text-base font-semibold text-white">{office.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{withoutDash(office.address)}</p>
                  <div className="mt-3 flex items-start gap-2 text-sm text-white/55">
                    <Phone className="mt-[3px] h-3.5 w-3.5 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      {numbers.map((n) => (
                        <a key={n} href={`tel:${n.replace(/[^\d+]/g, '')}`} className="transition-colors hover:text-white">
                          {n}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </WavePanel>
    </div>
  );
}
