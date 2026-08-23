import { ChevronDown } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface Director {
  name: string;
  role: string;
  chairman?: boolean;
}

interface KmpNode {
  name: string;
  role: string;
  department: string;
}

/** Board sits as one peer group (real governance structure — directors don't
 *  report to each other); the Chairman & Managing Director separately heads
 *  day-to-day management, so KMP reports there rather than to the full board. */
const BOARD: Director[] = [
  { name: 'Gaurav Goel', role: 'Chairman Cum Managing Director', chairman: true },
  { name: 'Shweta Goel', role: 'Whole-Time Director' },
  { name: 'Rakesh Kumar Goel', role: 'Non Executive Director' },
  { name: 'Dinesh Arya', role: 'Independent Director' },
  { name: 'Nil Kamal Samanta', role: 'Independent Director' },
  { name: 'Vinita Saraf', role: 'Independent Director' },
];

const KMP: KmpNode[] = [
  { name: 'Deepak Kumar Jha', role: 'Chief Financial Officer', department: 'Accounting & Finance' },
  { name: 'Priyanka Gera', role: 'Company Secretary & Compliance Officer', department: 'Secretarial & Legal' },
  { name: 'Sundeep Mishra', role: 'Chief Operating Officer', department: 'Business Development, Sales' },
  { name: 'Kshitij Goel', role: 'Chief Information Officer', department: 'Business Development, Exports' },
];

function DirectorCard({ d, delay }: { d: Director; delay: number }) {
  return (
    <div
      className={`animate-fade-up group flex w-full max-w-[220px] cursor-default flex-col gap-1 rounded-2xl border px-4 py-3.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 ${
        d.chairman
          ? 'border-black bg-black text-white hover:shadow-xl hover:shadow-black/20'
          : 'border-black/10 bg-white hover:border-black/40 hover:shadow-lg hover:shadow-black/10'
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <p
        className={`text-sm font-bold leading-snug transition-colors ${
          d.chairman ? 'text-white' : 'text-black group-hover:text-black'
        }`}
      >
        {d.name}
      </p>
      <p className={`text-xs leading-snug ${d.chairman ? 'text-white/80' : 'text-black/60'}`}>{d.role}</p>
    </div>
  );
}

function KmpColumn({ k, delay }: { k: KmpNode; delay: number }) {
  return (
    <div className="animate-fade-up flex flex-col items-center text-center" style={{ animationDelay: `${delay}s` }}>
      <div className="group flex w-full cursor-default flex-col gap-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-black/40 hover:shadow-lg hover:shadow-black/10">
        <p className="text-sm font-bold leading-snug text-black transition-colors group-hover:text-black">{k.name}</p>
        <p className="text-xs leading-snug text-black/60">{k.role}</p>
      </div>
      <div className="h-5 w-px bg-black/15" />
      <div className="w-full cursor-default rounded-2xl border border-black/15 bg-[#ECEDEC] px-4 py-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-black/40 hover:bg-[#ECEDEC]">
        <p className="text-xs font-semibold leading-snug text-black">{k.department}</p>
      </div>
    </div>
  );
}

export default function OrgChart() {
  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">About us</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            Organization Chart
          </h1>
        </div>
      </div>

      <section className="px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl rounded-2xl border border-black/10 bg-white px-4 py-12 sm:px-8">
          {/* Tier 1 — Board of Directors, a peer group */}
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-black" style={{ letterSpacing: '-0.02em' }}>
            Board of Directors
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {BOARD.map((d, i) => (
              <DirectorCard key={d.name} d={d} delay={i * 0.08} />
            ))}
          </div>

          {/* Connector — Chairman & MD heads day-to-day management */}
          <div className="my-10 flex flex-col items-center gap-3">
            <div className="h-8 w-px bg-black/15" />
            <h2 className="text-center text-2xl sm:text-3xl font-bold text-black" style={{ letterSpacing: '-0.02em' }}>
              Key Managerial Personnel
            </h2>
            <div className="flex items-center gap-1.5 rounded-full bg-[#ECEDEC] px-3 py-1.5 text-center">
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-black/50" />
              <span className="text-[11px] font-medium text-black/60">
                Reporting to the Chairman &amp; Managing Director
              </span>
            </div>
            <div className="h-8 w-px bg-black/15" />
          </div>

          {/* Tier 2 — Key Managerial Personnel, each with their department */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {KMP.map((k, i) => (
              <KmpColumn key={k.name} k={k} delay={0.4 + i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
