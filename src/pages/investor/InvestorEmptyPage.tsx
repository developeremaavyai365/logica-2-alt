import { FileX } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface InvestorEmptyPageProps {
  title: string;
  message: string;
}

export default function InvestorEmptyPage({ title, message }: InvestorEmptyPageProps) {
  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">Investor</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            {title}
          </h1>
        </div>
      </div>

      <section className="px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl rounded-2xl border border-black/10 bg-white px-4 py-16 sm:px-8 flex flex-col items-center text-center gap-3">
          <FileX className="h-10 w-10 text-black/30" />
          <p className="text-black/60 text-sm sm:text-base">{message}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
