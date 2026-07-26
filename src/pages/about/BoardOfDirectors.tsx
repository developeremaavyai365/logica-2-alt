import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { BOARD_MEMBERS } from '../../about-data';

export default function BoardOfDirectors() {
  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-[#3d5638] text-xs sm:text-sm font-semibold uppercase tracking-wide">About us</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
            Board of Directors &amp; KMP
          </h1>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BOARD_MEMBERS.map((member) => (
            <div key={member.name} className="rounded-2xl border border-[#1f2a1d]/10 p-6">
              <div className="w-16 h-16 rounded-full bg-[#f4f8f3] overflow-hidden mb-4">
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-base font-semibold text-[#1f2a1d]">{member.name}</h3>
              <p className="text-sm font-medium text-[#3d5638] mt-0.5">{member.designation}</p>
              <ul className="mt-4 space-y-1.5">
                {member.details.map((d) => (
                  <li key={d} className="text-xs text-[#4b5b47] leading-relaxed">{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-[#1f2a1d] p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-normal text-white" style={{ letterSpacing: '-0.02em' }}>
            Want to join us?
          </h2>
          <p className="mt-2 text-white/70 text-sm max-w-md mx-auto">
            We're always open to hearing from people who want to grow with Logica Infoway.
          </p>
          <Link
            to="/careers"
            className="mt-5 inline-block btn-liquid border-2 border-white text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            style={{ '--liquid': '#fff', '--liquid-ink': '#1f2a1d' } as CSSProperties}
          >
            View Careers
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
