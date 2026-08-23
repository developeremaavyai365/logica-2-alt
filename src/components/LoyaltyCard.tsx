import { useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function LoyaltyCard() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/rewards-hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/50" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-10">
        <p
          className="font-inter text-xs font-medium uppercase text-[#F0C94A]"
          style={{ letterSpacing: '0.14em' }}
        >
          Logica Rewards
        </p>
        <h2
          className="font-dm-sans font-normal text-white"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.05em', lineHeight: 1.05 }}
        >
          Join the Logica Rewards Program
        </h2>
        <p className="font-inter max-w-md text-sm text-[#F3E9FA]/80 sm:text-base" style={{ letterSpacing: '-0.02em' }}>
          Get early access to new launches, exclusive pricing, and priority support.
        </p>

        {submitted ? (
          <p className="font-inter mt-2 text-sm text-[#F0C94A]">You're on the list — we'll be in touch.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-12 flex-1 rounded-full border border-[#F0C94A]/40 bg-white/10 px-5 text-sm text-white placeholder:text-[#F3E9FA]/50 outline-none backdrop-blur-sm focus:border-[#F0C94A]/80"
            />
            <button
              type="submit"
              className="btn-liquid flex h-12 items-center justify-center gap-1 rounded-full border-2 border-[#F0C94A] px-6 text-sm font-medium text-[#F0C94A] transition-colors"
              style={{ '--liquid': '#F0C94A', '--liquid-ink': '#000000' } as CSSProperties}
            >
              Join Now
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
