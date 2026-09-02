import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ExternalLink } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import InvestorTabs from '../../components/InvestorTabs';
import { REG_46_ROWS } from '../../reg46-data';

/* The Regulation 46(2) website-disclosure index, as a listed company is
   expected to publish it: clause, what it requires, and where it lives.

   Rows that resolve to a document link out. Rows where the disclosure is the
   statement itself — the former name, a not-applicable — carry the text in
   place of a link rather than being given a URL that does not exist. */
export default function Reg46() {
  useEffect(() => {
    const previous = document.title;
    document.title = 'Reg 46 — Investor Relations | Logica Infoway';
    return () => {
      document.title = previous;
    };
  }, []);

  const needsConfirmation = REG_46_ROWS.filter((r) => r.needsConfirmation);

  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <Link to="/investor" className="text-xs font-medium text-black hover:opacity-80 transition-opacity">
            ← Investor Relations
          </Link>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-black">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-black">Stock Exchange</p>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            Reg 46
          </h1>
        </div>
        <InvestorTabs pathname="/investor/reg-46" />
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-14">
        <h2 className="text-center text-sm font-semibold text-[#000000] sm:text-base">
          Disclosure under Regulation 46 of the SEBI (Listing Obligations and Disclosure
          Requirements) Regulations, 2015
        </h2>

        {/* Scrolls on its own below the breakpoint rather than pushing the
            page sideways. */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#000000]/10 bg-white">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#000000]/10 bg-[#ECEDEC]/60">
                <th scope="col" className="w-16 px-4 py-3 font-semibold text-[#000000]">
                  Sr. No.
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-[#000000]">
                  Particulars
                </th>
                <th scope="col" className="w-[38%] px-4 py-3 font-semibold text-[#000000]">
                  URL
                </th>
              </tr>
            </thead>
            <tbody>
              {REG_46_ROWS.map((row, i) => {
                const external = row.href?.startsWith('http');
                return (
                  <tr key={row.clause} className="border-b border-[#000000]/10 last:border-b-0 align-top">
                    <td className="px-4 py-3 text-[#6b6b6b]">{i + 1}</td>
                    <td className="px-4 py-3 text-[#000000]">
                      <span className="font-medium text-[#6b6b6b]">{row.clause}</span>{' '}
                      {row.particulars}
                      {row.needsConfirmation && (
                        <sup className="ml-0.5 font-semibold text-[#D2781E]">*</sup>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.href ? (
                        external ? (
                          <a
                            href={row.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-start gap-1 break-all text-[#15803D] underline-offset-2 hover:underline"
                          >
                            {row.href}
                            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <Link
                            to={row.href}
                            className="break-all text-[#15803D] underline-offset-2 hover:underline"
                          >
                            {`https://www.logicainfoway.com${row.href}`}
                          </Link>
                        )
                      ) : (
                        <span className="text-[#6b6b6b]">{row.status}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {needsConfirmation.length > 0 && (
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-[#6b6b6b]">
            <span className="font-semibold text-[#D2781E]">*</span> {needsConfirmation.length} of
            these entries are pending confirmation by the Company Secretary — either the clause has
            no document published against it, or the document on file answers a related but
            different test. They are marked rather than matched to an approximate document.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
}
