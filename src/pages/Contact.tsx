import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactFormSection from '../components/ContactFormSection';
import AboutHero from '../components/about/AboutHero';
import OfficesPanel from '../components/about/OfficesPanel';

/** Contact, in the About pages' design: the navy wave hero, the direct
 *  channels beside the message form, then every office. */
export default function Contact() {
  return (
    <div className="w-full bg-[#F5F8FC]">
      <div className="bg-white">
        <Header />
      </div>

      <AboutHero
        eyebrow="Contact us"
        tabs={false}
        title={
          <>
            We&rsquo;d love to{' '}
            <span className="bg-gradient-to-r from-white via-[#C7D4FF] to-[#8FAEFF] bg-clip-text text-transparent">hear from you</span>
          </>
        }
        subtitle="Questions about a product, a bulk order or a partnership? Our team is a call or a message away."
      />

      <div className="animate-fade-up">
        <ContactFormSection />
      </div>

      <OfficesPanel eyebrow="Visit us" />

      <Footer />
    </div>
  );
}
