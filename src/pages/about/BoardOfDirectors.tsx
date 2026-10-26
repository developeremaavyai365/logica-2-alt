import { Link } from 'react-router-dom';
import WavePanel, { CAREERS_BLUE, CAREERS_NAVY } from '../../components/careers/WavePanel';
import { ABOUT_BACKDROP, ABOUT_CARD } from '../../components/about/AboutHero';
import { BOARD_MEMBERS, type BoardMember } from '../../about-data';

const BOARD_COUNT = 6;
const BOARD = BOARD_MEMBERS.slice(0, BOARD_COUNT);
const KMP = BOARD_MEMBERS.slice(BOARD_COUNT);

/** "~49 years…" reads as "-49" in this typeface. */
const readable = (detail: string) => detail.replace(/^~\s*/, 'Around ');

function SectionTitle({ children }: { children: string }) {
  return (
    <h2
      className="font-dm-sans font-bold"
      style={{ color: CAREERS_NAVY, fontSize: 'clamp(24px, 2.6vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
    >
      {children}
    </h2>
  );
}

/** One person: photo, name, designation and a few lines about them. Every
 *  member gets the same card. */
function MemberCard({ member, delay }: { member: BoardMember; delay: number }) {
  return (
    <div
      className={`animate-fade-up flex w-full flex-col overflow-hidden sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] ${ABOUT_CARD}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* The headshots are on white; over the soft blue the white drops out. */}
      <div className="relative aspect-[6/5]" style={{ background: ABOUT_BACKDROP }}>
        <img src={member.photo} alt={member.name} className="absolute inset-0 h-full w-full object-contain object-bottom mix-blend-multiply" />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <h3 className="text-lg font-semibold" style={{ color: CAREERS_NAVY }}>
          {member.name}
        </h3>
        <p className="mt-1 text-sm font-medium" style={{ color: CAREERS_BLUE }}>
          {member.designation}
        </p>
        <ul className="mt-4 space-y-1.5 border-t border-[#E5E7EB] pt-4">
          {member.details.map((d) => (
            <li key={d} className="text-[14px] leading-relaxed text-[#6B7280]">
              {readable(d)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** The Board of Directors & KMP tab of the About page. */
export default function BoardOfDirectors() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:px-10">
      <SectionTitle>Board Members</SectionTitle>
      {/* Cards wrap and centre, so a short last row sits in the middle. */}
      <div className="mt-8 flex flex-wrap justify-center gap-6">
        {BOARD.map((member, i) => (
          <MemberCard key={member.name} member={member} delay={i * 0.06} />
        ))}
      </div>

      <div className="mt-20">
        <SectionTitle>Key Managerial Personnel</SectionTitle>
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          {KMP.map((member, i) => (
            <MemberCard key={member.name} member={member} delay={i * 0.06} />
          ))}
        </div>
      </div>

      <WavePanel className="mt-20">
        <div className="flex flex-col items-center px-6 py-14 text-center sm:py-16">
          <h2 className="font-dm-sans font-bold text-white" style={{ fontSize: 'clamp(26px, 3.4vw, 44px)', letterSpacing: '-0.02em' }}>
            Want to join us?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-white/80 sm:text-lg">
            We're always open to hearing from people who want to grow with Logica Infoway.
          </p>
          <Link
            to="/careers"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-md px-7 text-base font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: CAREERS_BLUE }}
          >
            View Careers
          </Link>
        </div>
      </WavePanel>
    </section>
  );
}
