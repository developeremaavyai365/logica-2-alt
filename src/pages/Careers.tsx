import Header from '../components/Header';
import Footer from '../components/Footer';
import { offices } from '../data';

export default function Careers() {
  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-[#3d5638] text-xs sm:text-sm font-semibold uppercase tracking-wide">Careers</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
            Grow with Logica Infoway
          </h1>
        </div>
      </div>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20 text-center">
        <blockquote className="text-lg sm:text-xl text-[#1f2a1d] leading-relaxed font-normal" style={{ letterSpacing: '-0.01em' }}>
          "Our philosophy is that corporate enterprises must be managed not merely in the interests
          of their owners, but equally in those of their employees, of the consumers of their
          products, of the local community and finally of the country as a whole."
        </blockquote>
      </section>

      <section className="w-full bg-[#f4f8f3] py-16 sm:py-20 px-4 sm:px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-[#1f2a1d] mb-8 text-center">Offices across India</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offices.map((office) => (
              <div key={office.city} className="rounded-2xl bg-white border border-[#1f2a1d]/10 p-5">
                <h3 className="text-sm font-semibold text-[#1f2a1d]">{office.label}</h3>
                <p className="mt-2 text-xs text-[#4b5b47] leading-relaxed">{office.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20 text-center">
        <h2 className="text-xl font-semibold text-[#1f2a1d] mb-3">No open positions listed right now</h2>
        <p className="text-sm text-[#4b5b47] leading-relaxed mb-6">
          We don't have a live job board yet, but we're always glad to hear from people who want to
          grow with us. Send your resume and we'll reach out when something opens up.
        </p>
        <a
          href="mailto:info@logicainfoway.com?subject=Career%20Enquiry"
          className="inline-block btn-liquid border-2 border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Email your resume
        </a>
      </section>

      <Footer />
    </div>
  );
}
