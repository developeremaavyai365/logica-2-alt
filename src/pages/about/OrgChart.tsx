import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface OrgNode {
  name: string;
  role?: string;
  root?: boolean;
  exec?: boolean;
  children?: OrgNode[];
}

const ORG_TREE: OrgNode = {
  name: 'Board of Directors & KMP',
  root: true,
  children: [
    {
      name: 'Gaurav Goel',
      role: 'Chairman Cum Managing Director',
      exec: true,
      children: [
        {
          name: 'Deepak Kumar Jha',
          role: 'Chief Financial Officer',
          children: [{ name: 'Accounting & Finance' }],
        },
        {
          name: 'Priyanka Gera',
          role: 'Company Secretary & Compliance Officer',
          children: [{ name: 'Secretarial & Legal' }],
        },
        {
          name: 'Sundeep Mishra',
          role: 'Chief Operating Officer',
          children: [{ name: 'Business Development, Sales' }],
        },
        {
          name: 'Kshitij Goel',
          role: 'Chief Information Officer',
          children: [{ name: 'Business Development, Exports' }],
        },
      ],
    },
    { name: 'Shweta Goel', role: 'Whole-Time Director', exec: true },
    { name: 'Rakesh Kumar Goel', role: 'Non Executive Director', exec: true },
    { name: 'Dinesh Arya', role: 'Independent Director', exec: true },
    { name: 'Nil Kamal Samanta', role: 'Independent Director', exec: true },
    { name: 'Vinita Saraf', role: 'Independent Director', exec: true },
  ],
};

function OrgCard({ node }: { node: OrgNode }) {
  return (
    <div
      className={`inline-flex min-w-[150px] flex-col gap-1 rounded-2xl border px-4 py-3 text-left shadow-sm ${
        node.root
          ? 'border-black bg-black text-white'
          : node.exec
            ? 'relative border-black/10 bg-white pl-5 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[3px] before:rounded-full before:bg-[#1f6fa8] before:content-[""]'
            : 'border-black/10 bg-white'
      }`}
    >
      <p className={`text-sm font-bold leading-snug ${node.root ? 'text-white' : 'text-black'}`}>{node.name}</p>
      {node.role && <p className={`text-xs leading-snug ${node.root ? 'text-white/80' : 'text-black/60'}`}>{node.role}</p>}
    </div>
  );
}

function OrgBranch({ node }: { node: OrgNode }) {
  return (
    <li>
      <OrgCard node={node} />
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <OrgBranch key={child.name} node={child} />
          ))}
        </ul>
      )}
    </li>
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
        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white py-10">
          <ul className="org-tree">
            <OrgBranch node={ORG_TREE} />
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
