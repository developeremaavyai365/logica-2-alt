import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { COMMITTEES } from '../../about-data';

export default function Committees() {
  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">About us</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            Composition of Committees
          </h1>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {COMMITTEES.map((committee) => (
            <div key={committee.name} className="rounded-2xl border border-[#000000]/10 p-6">
              <h3 className="text-base font-semibold text-[#000000] mb-4">{committee.name}</h3>
              <div className="rounded-xl overflow-hidden border border-[#000000]/10">
                {committee.members.map((m, i) => (
                  <div
                    key={m.name}
                    className={`flex justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-[#ECEDEC]' : 'bg-white'}`}
                  >
                    <span className="text-[#000000] font-medium">{m.name}</span>
                    <span className="text-[#6b6b6b]">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
