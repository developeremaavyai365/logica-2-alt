import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function OrgChart() {
  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-[#3d5638] text-xs sm:text-sm font-semibold uppercase tracking-wide">About us</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
            Organization Chart
          </h1>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="rounded-2xl border border-[#1f2a1d]/10 overflow-hidden">
          <img src="/about/organization-chart.jpg" alt="Logica Infoway organization chart" className="w-full h-auto" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
