import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Share2,
  Twitter,
  type LucideIcon,
} from 'lucide-react';
import { offices, socials } from '../data';
import { useInView } from '../use-in-view';
import { WEB3FORMS_ACCESS_KEY } from '../lib/web3forms';
import TextField from './form/fields/TextField';
import TextAreaField from './form/fields/TextAreaField';
import { ABOUT_CARD, ABOUT_TEXT, AboutHeading } from './about/AboutHero';
import { withoutDash } from './about/OfficesPanel';
import { CAREERS_BLUE, CAREERS_NAVY } from './careers/WavePanel';

const PHONE_NUMBER = '+91 7003999192';
/** The general enquiries address the footer publishes. */
const EMAIL = 'info@logicainfoway.com';
const HEAD_OFFICE = offices.find((o) => o.label === 'Head Office') ?? offices[0];

type Status = 'idle' | 'sending' | 'success' | 'error';

// White circle, brand colour rises from the bottom on hover, icon flips on
// the Y axis; the row reveals one icon at a time when scrolled into view.
const SOCIAL_ICONS: Record<string, { icon: LucideIcon; fill: string }> = {
  Facebook: { icon: Facebook, fill: '#3b5999' },
  Twitter: { icon: Twitter, fill: '#1da1f2' },
  Instagram: { icon: Instagram, fill: '#d6249f' },
  LinkedIn: { icon: Linkedin, fill: '#0077b5' },
  Pinterest: { icon: Share2, fill: '#e60023' },
};

/** The three direct ways to reach the company, each a card that acts. */
const CHANNELS: { icon: LucideIcon; label: string; value: string; href: string; external?: boolean }[] = [
  { icon: Phone, label: 'Call us', value: PHONE_NUMBER, href: `tel:${PHONE_NUMBER.replace(/\s+/g, '')}` },
  { icon: Mail, label: 'Write to us', value: EMAIL, href: `mailto:${EMAIL}` },
  {
    icon: MapPin,
    label: HEAD_OFFICE.label,
    value: withoutDash(HEAD_OFFICE.address),
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HEAD_OFFICE.address)}`,
    external: true,
  },
];

/** The Contact page body, in the About pages' design: the direct channels
 *  and socials on the left, the message form in a card on the right. */
export default function ContactFormSection() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  // Shared useInView rather than an observer of its own: that hook only drops
  // out of view once the row is completely gone, where a bare `isIntersecting`
  // against a ratio would blank the icons while they were still on screen.
  const [socialRef, socialsInView] = useInView<HTMLDivElement>(0.4);
  const [revealed, setRevealed] = useState<boolean[]>(() => socials.map(() => false));

  useEffect(() => {
    if (!socialsInView) {
      setRevealed(socials.map(() => false));
      return;
    }

    setRevealed(socials.map(() => false));
    const timers = socials.map((_, i) =>
      setTimeout(() => {
        setRevealed((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 120),
    );
    return () => timers.forEach(clearTimeout);
  }, [socialsInView]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    setStatus('sending');
    setMessage('Please wait...');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.status === 200) {
        setStatus('success');
        setMessage(json.message);
        form.reset();
      } else {
        setStatus('error');
        setMessage(json.message);
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong!');
    }
  }

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20 md:px-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left — direct channels + socials */}
        <div className="flex flex-col lg:col-span-5">
          <AboutHeading eyebrow="Reach us">Talk to our team</AboutHeading>
          <p className={`mt-4 ${ABOUT_TEXT}`}>
            For product enquiries, bulk orders and partnerships, call us, write to us, or send a message and we will get back to you.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {CHANNELS.map(({ icon: Icon, label, value, href, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className={`${ABOUT_CARD} group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7D2FE] hover:shadow-[0_18px_40px_-16px_rgba(61,79,224,0.35)]`}
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white transition-colors duration-300 group-hover:!bg-[#3D4FE0]"
                  style={{ backgroundColor: CAREERS_NAVY }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: CAREERS_BLUE }}>
                    {label}
                  </span>
                  <span className="mt-1 block break-words text-[15px] font-semibold leading-snug" style={{ color: CAREERS_NAVY }}>
                    {value}
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-[#9CA3AF] transition-all duration-300 group-hover:rotate-45 group-hover:text-[#3D4FE0]" />
              </a>
            ))}
          </div>

          <div ref={socialRef} className={`${ABOUT_CARD} mt-4 p-5`}>
            <span className="block text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: CAREERS_BLUE }}>
              Follow us
            </span>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {socials.map((social, i) => {
                const cfg = SOCIAL_ICONS[social.label];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#E5E7EB] bg-white"
                    style={{
                      opacity: revealed[i] ? 1 : 0,
                      transform: revealed[i] ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.7)',
                      transitionProperty: 'opacity, transform',
                      transitionDuration: '550ms',
                      transitionTimingFunction: 'cubic-bezier(0.2,0.7,0.2,1)',
                    }}
                  >
                    <span
                      className="absolute inset-0 top-full transition-all duration-500 group-hover:top-0"
                      style={{ background: cfg.fill }}
                    />
                    <Icon
                      className="relative z-10 h-[18px] w-[18px] transition-all duration-500 group-hover:text-white group-hover:[transform:rotateY(360deg)]"
                      style={{ color: CAREERS_NAVY }}
                      strokeWidth={1.75}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — the message form */}
        <form onSubmit={handleSubmit} className={`${ABOUT_CARD} p-6 sm:p-10 lg:col-span-7`}>
          <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
          <input type="hidden" name="subject" value="New enquiry from logicainfoway.com" />
          <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <AboutHeading eyebrow="Write to us">Send us a message</AboutHeading>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField label="Full Name" type="text" name="name" id="name" placeholder="John Doe" accent={CAREERS_BLUE} required />
            <TextField
              label="Email Address"
              type="email"
              name="email"
              id="email"
              placeholder="you@company.com"
              accent={CAREERS_BLUE}
              required
            />
            <TextField
              label="Phone Number"
              type="tel"
              name="phone"
              id="phone"
              placeholder="Your phone number"
              accent={CAREERS_BLUE}
              className="sm:col-span-2"
              required
            />
            <TextAreaField
              label="Your Message"
              rows={6}
              name="message"
              id="message"
              placeholder="How can we help?"
              accent={CAREERS_BLUE}
              className="sm:col-span-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="group mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white transition-colors duration-300 hover:!bg-[#3D4FE0] disabled:opacity-60"
            style={{ backgroundColor: CAREERS_NAVY }}
          >
            {status === 'sending' ? 'Sending…' : 'Send Message'}
            {status !== 'sending' && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
          </button>

          {message && (
            <p
              aria-live="polite"
              className={`mt-4 text-center text-sm ${
                status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-red-600' : 'text-[#6B7280]'
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
