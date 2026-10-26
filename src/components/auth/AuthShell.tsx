import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import WavePanel from '../careers/WavePanel';

/** The account pages' layout, in the About and Contact pages' design: the
 *  navy wave panel (eyebrow, title, line of text, and points as glass cards)
 *  on one side, the form on the other. On a phone the form comes first. */
export default function AuthShell({
  eyebrow,
  title,
  text,
  points,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  text: string;
  points: { icon: LucideIcon; text: string }[];
  children: ReactNode;
}) {
  return (
    <div className="w-full bg-[#F5F8FC]">
      <div className="bg-white">
        <Header />
      </div>

      <section className="bg-white px-4 pb-16 sm:px-6 md:px-5">
        <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {/* The navy wave panel */}
          <WavePanel className="order-2 flex lg:order-1">
            <div className="flex w-full flex-col justify-between gap-10 px-6 py-10 sm:px-12 sm:py-14 lg:min-h-[620px]">
              <div className="animate-fade-up">
                <span className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">{eyebrow}</span>
                <h2
                  className="mt-5 max-w-lg font-dm-sans font-bold text-white"
                  style={{ fontSize: 'clamp(34px, 4.2vw, 56px)', letterSpacing: '-0.025em', lineHeight: 1.06 }}
                >
                  {title}
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">{text}</p>
              </div>

              <ul className="flex flex-col gap-3">
                {points.map(({ icon: Icon, text: point }, i) => (
                  <li
                    key={point}
                    className="animate-fade-up flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-4 backdrop-blur-sm transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.1] sm:px-5"
                    style={{ animationDelay: `${150 + i * 120}ms`, animationFillMode: 'both' }}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium leading-snug text-white/85 sm:text-[15px]">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </WavePanel>

          {/* The form */}
          <div className="order-1 flex flex-col items-center justify-center pt-6 lg:order-2 lg:py-10">
            <img src="/logica-logo-shine.png" alt="Logica Infoway" className="mb-8 h-16 w-auto object-contain sm:h-20" />
            {children}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/** The light-blue gradient the navy panels put on the end of a title. */
export function TitleGlow({ children }: { children: ReactNode }) {
  return <span className="bg-gradient-to-r from-white via-[#C7D4FF] to-[#8FAEFF] bg-clip-text text-transparent">{children}</span>;
}
