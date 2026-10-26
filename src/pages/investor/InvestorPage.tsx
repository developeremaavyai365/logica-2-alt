import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import InvestorHero from '../../components/investor/InvestorHero';
import { INVESTOR_SECTIONS } from '../../investor-sections';
import InvestorHub from './InvestorHub';
import InvestorSection from './InvestorSection';
import InvestorEmptyPage from './InvestorEmptyPage';
import AuthorizedPerson from './AuthorizedPerson';
import GrievanceRedressal from './GrievanceRedressal';

const CIN = 'Logica Infoway Limited · CIN L30007WB1995PLC073218';

/** The investor pages that are not document lists, by address. */
const STANDALONE: Record<string, { title: string; body: ReactNode }> = {
  '/advertisement': { title: 'Advertisement', body: <InvestorEmptyPage message="No advertisements have been published yet." /> },
  '/basis-of-allotment': {
    title: 'Basis of Allotment',
    body: <InvestorEmptyPage message="No basis of allotment records have been published yet." />,
  },
  '/authorized-person': { title: 'Authorized Person', body: <AuthorizedPerson /> },
  '/grievance-redressal': { title: 'Grievance Redressal', body: <GrievanceRedressal /> },
};

/** Investor Relations as one page, like About: every investor address keeps
 *  its own URL, but they all render here, so moving between them keeps the
 *  header and hero where they are and swaps only the content below. */
export default function InvestorPage() {
  const { pathname: rawPath } = useLocation();
  const pathname = rawPath.replace(/\/+$/, '') || '/';

  let eyebrow = 'Investor Relations';
  let title: ReactNode;
  let subtitle: ReactNode = CIN;
  let body: ReactNode;

  if (pathname === '/investor') {
    title = 'Reports, Filings & Disclosures';
    body = <InvestorHub />;
  } else if (pathname.startsWith('/investor/')) {
    const section = INVESTOR_SECTIONS.find((s) => s.slug === pathname.slice('/investor/'.length));
    if (!section) return <Navigate to="/investor" replace />;
    eyebrow = `Investor Relations · ${section.category}`;
    title = section.label;
    subtitle = undefined;
    body = <InvestorSection section={section} />;
  } else {
    const page = STANDALONE[pathname];
    if (!page) return <Navigate to="/investor" replace />;
    title = page.title;
    subtitle = undefined;
    body = page.body;
  }

  return (
    <div className="w-full bg-[#F5F8FC]">
      <div className="bg-white">
        <Header />
      </div>

      <InvestorHero pathname={pathname} eyebrow={eyebrow} title={title} subtitle={subtitle} />

      {/* Keyed by page so the new content fades in, and a section's search
          and year filter start fresh on every page. */}
      <div key={pathname} className="animate-fade-up">
        {body}
      </div>

      <Footer />
    </div>
  );
}
