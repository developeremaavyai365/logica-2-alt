import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function AuthorizedPerson() {
  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-black text-xs sm:text-sm font-semibold uppercase tracking-wide">Investor</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#000000]" style={{ letterSpacing: '-0.03em' }}>
            Authorized Person
          </h1>
        </div>
      </div>

      <section className="px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl rounded-2xl border border-black/10 bg-white p-4 sm:p-8">
          <img
            src="/images/investor/authorized-person.jpg"
            alt="Authorized Person"
            className="w-full h-auto rounded-xl"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
