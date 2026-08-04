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

function DirectorCard({ d }: { d: Director }) {
  return (
    <div
      className={`flex w-full max-w-[220px] flex-col gap-1 rounded-2xl border px-4 py-3.5 text-left shadow-sm ${
        d.chairman ? 'border-black bg-black text-white' : 'border-black/10 bg-white'
      }`}
    >
      <p className={`text-sm font-bold leading-snug ${d.chairman ? 'text-white' : 'text-black'}`}>{d.name}</p>
      <p className={`text-xs leading-snug ${d.chairman ? 'text-white/80' : 'text-black/60'}`}>{d.role}</p>
    </div>
  );
}

function KmpColumn({ k }: { k: KmpNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex w-full flex-col gap-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-left shadow-sm">
        <p className="text-sm font-bold leading-snug text-black">{k.name}</p>
        <p className="text-xs leading-snug text-black/60">{k.role}</p>
      </div>
      <div className="h-5 w-px bg-black/15" />
      <div className="w-full rounded-2xl border border-[#1f6fa8]/20 bg-[#1f6fa8]/5 px-4 py-3 text-left">
        <p className="text-xs font-semibold leading-snug text-[#1f6fa8]">{k.department}</p>
      </div>
    </div>
  );
}

export default function OrgChart() {
  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#f0f0f0]">
        <Header />
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-[#1f6fa8] text-xs sm:text-sm font-semibold uppercase tracking-wide">About us</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            Organization Chart
          </h1>
        </div>
      </div>

      <section className="px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl rounded-2xl border border-black/10 bg-white px-4 py-12 sm:px-8">
          {/* Tier 1 — Board of Directors, a peer group */}
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-black/40">Board of Directors</p>
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {BOARD.map((d) => (
              <DirectorCard key={d.name} d={d} />
            ))}
          </div>

          {/* Connector — Chairman & MD heads day-to-day management */}
          <div className="my-8 flex flex-col items-center gap-2">
            <div className="h-8 w-px bg-black/15" />
            <div className="flex items-center gap-1.5 rounded-full bg-[#ECEDEC] px-3 py-1.5 text-center">
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-black/50" />
              <span className="text-[11px] font-medium text-black/60">
                Key Managerial Personnel — reporting to the Chairman &amp; Managing Director
              </span>
            </div>
            <div className="h-8 w-px bg-black/15" />
          </div>

          {/* Tier 2 — Key Managerial Personnel, each with their department */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {KMP.map((k) => (
              <KmpColumn key={k.name} k={k} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
