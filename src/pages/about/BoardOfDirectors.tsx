import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { BOARD_MEMBERS, type BoardMember } from '../../about-data';

const BOARD_COUNT = 6;
const BOARD = BOARD_MEMBERS.slice(0, BOARD_COUNT);
const KMP = BOARD_MEMBERS.slice(BOARD_COUNT);

function MemberCard({ member, delay }: { member: BoardMember; delay: number }) {
  return (
    <div
      className="animate-fade-up group flex flex-col items-center rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-black/20 hover:shadow-xl hover:shadow-black/10 sm:p-8"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[#ECEDEC] shadow-inner sm:h-32 sm:w-32">
        <img
          src={member.photo}
          alt={member.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <h3 className="mt-5 text-base font-semibold text-black transition-colors group-hover:text-black sm:text-lg">
        {member.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-black">{member.designation}</p>
      <ul className="mt-4 space-y-1.5">
        {member.details.map((d) => (
          <li key={d} className="text-xs leading-relaxed text-black/60">
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BoardOfDirectors() {
  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">About us</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            Board of Directors &amp; KMP
          </h1>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-normal text-black text-center" style={{ letterSpacing: '-0.03em' }}>
          Board Members
        </h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BOARD.map((member, i) => (
            <MemberCard key={member.name} member={member} delay={i * 0.08} />
          ))}
        </div>

        <h2 className="mt-20 text-2xl sm:text-3xl font-normal text-black text-center" style={{ letterSpacing: '-0.03em' }}>
          Key Managerial Personnel
        </h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {KMP.map((member, i) => (
            <MemberCard key={member.name} member={member} delay={0.4 + i * 0.08} />
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-[#000000] p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-normal text-white" style={{ letterSpacing: '-0.02em' }}>
            Want to join us?
          </h2>
          <p className="mt-2 text-white/70 text-sm max-w-md mx-auto">
            We're always open to hearing from people who want to grow with Logica Infoway.
          </p>
          <Link
            to="/careers"
            className="mt-5 inline-block btn-liquid border-2 border-white text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            style={{ '--liquid': '#fff', '--liquid-ink': '#000000' } as CSSProperties}
          >
            View Careers
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
