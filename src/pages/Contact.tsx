import { Mail, Phone, MapPin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { offices } from '../data';

export default function Contact() {
  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-16">
          <span className="text-[#3d5638] text-xs sm:text-sm font-semibold uppercase tracking-wide">Contact us</span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal text-[#336443]" style={{ letterSpacing: '-0.03em' }}>
            Let's talk about your requirement
          </h1>
          <p className="mt-5 text-[#4b5b47] text-sm sm:text-base leading-relaxed">
            For bulk, corporate and government orders, reach us directly — we typically respond within one business day.
          </p>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12">
        {/* Quick contact + form */}
        <div>
          <div className="space-y-4 mb-10">
            <a href="tel:+917003999192" className="flex items-center gap-3 text-sm text-[#1f2a1d] font-medium hover:opacity-80 transition-opacity">
              <span className="w-9 h-9 rounded-full bg-[#f4f8f3] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </span>
              +91 7003999192
            </a>
            <a href="mailto:info@logicainfoway.com" className="flex items-center gap-3 text-sm text-[#1f2a1d] font-medium hover:opacity-80 transition-opacity">
              <span className="w-9 h-9 rounded-full bg-[#f4f8f3] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </span>
              info@logicainfoway.com
            </a>
            <div className="flex items-start gap-3 text-sm text-[#4b5b47]">
              <span className="w-9 h-9 rounded-full bg-[#f4f8f3] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              2 Saklat Place, 1st Floor, Kolkata, West Bengal, India – 700072
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-[#1f2a1d]/15 bg-white px-4 py-3 text-sm text-[#1f2a1d] placeholder:text-[#4b5b47]/50 focus:outline-none focus:border-[#1f2a1d]/40 transition-colors"
              />
              <input
                type="tel"
                placeholder="Phone number"
                className="w-full rounded-xl border border-[#1f2a1d]/15 bg-white px-4 py-3 text-sm text-[#1f2a1d] placeholder:text-[#4b5b47]/50 focus:outline-none focus:border-[#1f2a1d]/40 transition-colors"
              />
            </div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-[#1f2a1d]/15 bg-white px-4 py-3 text-sm text-[#1f2a1d] placeholder:text-[#4b5b47]/50 focus:outline-none focus:border-[#1f2a1d]/40 transition-colors"
            />
            <textarea
              rows={4}
              placeholder="Tell us what you're looking for"
              className="w-full rounded-xl border border-[#1f2a1d]/15 bg-white px-4 py-3 text-sm text-[#1f2a1d] placeholder:text-[#4b5b47]/50 focus:outline-none focus:border-[#1f2a1d]/40 transition-colors resize-none"
            />
            <button
              type="submit"
              className="btn-liquid border-2 border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Offices */}
        <div>
          <h2 className="text-lg font-semibold text-[#1f2a1d] mb-5">Our offices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offices.map((office) => (
              <div key={office.city} className="rounded-2xl bg-[#f4f8f3] border border-[#1f2a1d]/10 p-5">
                <h3 className="text-sm font-semibold text-[#1f2a1d]">{office.label}</h3>
                <p className="mt-2 text-xs text-[#4b5b47] leading-relaxed">{office.address}</p>
                <p className="mt-3 text-xs text-[#3d5638] font-medium">{office.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
