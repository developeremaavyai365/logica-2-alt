import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Share2, Phone, type LucideIcon } from 'lucide-react';
import { socials } from '../data';

const PHONE_NUMBER = '+91 7003999192';

// Get a free key at https://web3forms.com/ and paste it here to make this
// form actually deliver email.
const WEB3FORMS_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';

type Status = 'idle' | 'sending' | 'success' | 'error';

// Same fill-rise-on-hover treatment used for the homepage's social icons
// earlier — white circle base, brand-colored fill rises from the bottom,
// icon flips on the Y axis, staggered reveal on scroll-into-view.
const SOCIAL_ICONS: Record<string, { icon: LucideIcon; fill: string }> = {
  Facebook: { icon: Facebook, fill: '#3b5999' },
  Twitter: { icon: Twitter, fill: '#1da1f2' },
  Instagram: { icon: Instagram, fill: '#d6249f' },
  LinkedIn: { icon: Linkedin, fill: '#0077b5' },
  Pinterest: { icon: Share2, fill: '#e60023' },
};

export default function ContactFormSection() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const socialRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<boolean[]>(() => socials.map(() => false));

  useEffect(() => {
    const el = socialRef.current;
    if (!el) return;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          timers.forEach(clearTimeout);
          timers = [];

          if (entry.isIntersecting) {
            setRevealed(socials.map(() => false));
            socials.forEach((_, i) => {
              timers.push(
                setTimeout(() => {
                  setRevealed((prev) => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                  });
                }, i * 120),
              );
            });
          } else {
            setRevealed(socials.map(() => false));
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
    };
  }, []);

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
    <section className="bg-[#ECEDEC] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-md">
        <div className="animate-fade-up text-center">
          <h2
            className="font-dm-sans font-bold text-black"
            style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', letterSpacing: '-0.04em' }}
          >
            Contact Us
          </h2>
          <p className="font-inter mt-3 text-sm text-black/50 sm:text-base" style={{ letterSpacing: '-0.02em' }}>
            Fill up the form below to send us a message.
          </p>
        </div>

        <a
          href={`tel:${PHONE_NUMBER.replace(/\s+/g, '')}`}
          className="animate-fade-up delay-100 group mt-6 flex items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm transition-all duration-300 hover:border-black/20 hover:shadow-md"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:scale-110">
            <Phone className="h-4 w-4" />
          </span>
          <span className="text-left">
            <span className="font-inter block text-xs text-black/50" style={{ letterSpacing: '-0.02em' }}>
              Prefer to talk? Call us directly
            </span>
            <span className="font-dm-sans block text-lg font-bold text-black" style={{ letterSpacing: '-0.03em' }}>
              {PHONE_NUMBER}
            </span>
          </span>
        </a>

        <div className="animate-fade-up delay-150 my-6 flex items-center gap-3 text-black/30">
          <span className="h-px flex-1 bg-black/10" />
          <span className="font-inter text-xs uppercase" style={{ letterSpacing: '0.1em' }}>
            or
          </span>
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-fade-up delay-200 space-y-5 rounded-2xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] transition-shadow duration-300 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] sm:p-8"
        >
          <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
          <input type="hidden" name="subject" value="New enquiry from logicainfoway.com" />
          <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <div>
            <label htmlFor="name" className="font-inter mb-2 block text-sm text-black/60" style={{ letterSpacing: '-0.02em' }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="John Doe"
              required
              className="font-inter h-12 w-full rounded-md border border-black/10 bg-[#FEFDF9] px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/40"
            />
          </div>

          <div>
            <label htmlFor="email" className="font-inter mb-2 block text-sm text-black/60" style={{ letterSpacing: '-0.02em' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="you@company.com"
              required
              className="font-inter h-12 w-full rounded-md border border-black/10 bg-[#FEFDF9] px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/40"
            />
          </div>

          <div>
            <label htmlFor="phone" className="font-inter mb-2 block text-sm text-black/60" style={{ letterSpacing: '-0.02em' }}>
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              placeholder="+91 7003999192"
              required
              className="font-inter h-12 w-full rounded-md border border-black/10 bg-[#FEFDF9] px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/40"
            />
          </div>

          <div>
            <label htmlFor="message" className="font-inter mb-2 block text-sm text-black/60" style={{ letterSpacing: '-0.02em' }}>
              Your Message
            </label>
            <textarea
              rows={5}
              name="message"
              id="message"
              placeholder="Your Message"
              required
              className="font-inter w-full rounded-md border border-black/10 bg-[#FEFDF9] px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/40"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-liquid font-inter flex h-14 w-full items-center justify-center rounded-md border-2 border-[#1f2a1d] font-medium text-[#1f2a1d] transition-colors disabled:opacity-60"
            style={{ letterSpacing: '-0.03em', fontSize: '16px' }}
          >
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>

          {message && (
            <p
              className={`font-inter text-center text-sm ${
                status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-red-600' : 'text-black/50'
              }`}
            >
              {message}
            </p>
          )}
        </form>

        <div ref={socialRef} className="mt-12 text-center">
          <p className="font-inter text-sm text-black/50" style={{ letterSpacing: '-0.02em' }}>
            Or find us on
          </p>
          <div className="mt-5 flex items-center justify-center gap-4 sm:gap-5">
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
                  className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-black/10 bg-white sm:h-14 sm:w-14"
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
                    className="relative z-10 h-5 w-5 text-black transition-all duration-500 group-hover:text-white group-hover:[transform:rotateY(360deg)]"
                    strokeWidth={1.75}
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
