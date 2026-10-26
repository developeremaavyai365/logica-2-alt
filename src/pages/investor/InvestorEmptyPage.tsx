import { FileX } from 'lucide-react';
import { ABOUT_CARD } from '../../components/about/AboutHero';

/** The body of an investor page with nothing published yet. */
export default function InvestorEmptyPage({ message }: { message: string }) {
  return (
    <section className="px-4 py-14 sm:px-6 md:px-10">
      <div className={`mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-16 text-center sm:px-8 ${ABOUT_CARD}`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF1FD] text-[#3D4FE0]">
          <FileX className="h-6 w-6" />
        </span>
        <p className="text-[15px] text-[#6B7280] sm:text-base">{message}</p>
      </div>
    </section>
  );
}
