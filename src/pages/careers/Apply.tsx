import { useState, type CSSProperties, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TextField from '../../components/form/fields/TextField';
import TextAreaField from '../../components/form/fields/TextAreaField';
import FileField from '../../components/form/fields/FileField';
import { readCsrfToken } from '../../lib/csrf';

type Status = 'idle' | 'sending' | 'success' | 'error';

const ACCENT = '#3D4FE0';
const LIQUID_ACCENT = { '--liquid': ACCENT, '--liquid-ink': '#ffffff' } as CSSProperties;

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

/** A dedicated application form rather than a mailto link, so a resume can
 *  actually be attached instead of asking the applicant to remember to
 *  attach it themselves in their own email client.
 *
 *  Submits as multipart FormData straight to this site's own backend
 *  (/careers/apply), not Web3Forms — Web3Forms' free plan rejects any
 *  submission carrying a file attachment. No 'Content-Type' header is set
 *  here deliberately — the browser fills in the multipart boundary itself
 *  when given a FormData body, and setting the header manually strips that
 *  boundary and breaks the upload. This route is @Public() but still
 *  mutating, so it needs the CSRF header and credentials like any other
 *  mutating request — it just can't go through apiFetch() since that
 *  JSON-stringifies bodies, which doesn't work for a file upload. */
export default function Apply() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') ?? '';

  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setStatus('sending');
    setMessage('Please wait...');

    try {
      const res = await fetch(`${API_URL}/careers/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-csrf-token': readCsrfToken() ?? '' },
        body: formData,
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        setStatus('success');
        setMessage(json?.message ?? 'Application received — thank you.');
        form.reset();
      } else {
        setStatus('error');
        const backendMessage = json?.message;
        setMessage(Array.isArray(backendMessage) ? backendMessage.join(' ') : backendMessage ?? 'Something went wrong!');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong!');
    }
  }

  return (
    <div className="w-full bg-[#ECEDEC]">
      <Header />

      {/* One continuous video section carrying both the heading and the
          form — not a fixed-height hero band followed by a plain-background
          form section. The section has no height of its own; the video is
          absolutely positioned and simply fills whatever height the heading
          + form end up needing, so it never runs short or leaves a flat
          band of unused video at the bottom. Same attributes HeroVideo.tsx
          uses on the homepage (autoplay/muted/loop/playsInline).

          Video is a supplied 4K clip (23.7MB) — heavier than this site's
          other background video (the homepage hero, 3MB) since there was no
          way to re-encode it in this environment. The poster frame at least
          gives the section something to paint before the full clip loads.

          The form card stays fully opaque white rather than translucent —
          glassy would stay legible against a still frame but not
          necessarily against every frame the clip plays through, and the
          card needs to read the same at second 40 as it does at second 1. */}
      <section className="relative isolate overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/video/apply-hero.mp4"
          poster="/images/careers/apply-hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60" />

        <div className="relative z-10 flex flex-col items-center px-4 py-14 sm:px-6 sm:py-20 md:px-10">
          <div className="max-w-2xl text-center">
            <h1
              className="font-dm-sans font-bold text-white"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
            >
              Apply to Logica Infoway
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed">
              Tell us a bit about yourself and attach your resume — we'll get back to you if
              there's a fit.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 w-full max-w-md space-y-5 rounded-3xl bg-white p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:p-8"
          >
            <TextField
              label="Full Name"
              type="text"
              name="name"
              id="name"
              placeholder="Your full name"
              required
              accent={ACCENT}
            />

            <TextField
              label="Email Address"
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              required
              accent={ACCENT}
            />

            <TextField
              label="Phone Number"
              type="text"
              name="phone"
              id="phone"
              placeholder="+91 XXXXX XXXXX"
              required
              accent={ACCENT}
            />

            <TextField
              label="Role You're Interested In"
              type="text"
              name="role"
              id="role"
              defaultValue={roleParam}
              placeholder="e.g. Retail Associate, or leave blank if general"
              accent={ACCENT}
            />

            <FileField
              label="Resume"
              name="attachment"
              id="resume"
              accept=".pdf,.doc,.docx"
              required
              hint="PDF, DOC or DOCX"
              accent={ACCENT}
              ctaText="Click to upload your resume"
            />

            <TextAreaField
              label="Anything else you'd like us to know?"
              name="message"
              id="message"
              accent={ACCENT}
              rows={4}
              placeholder="Optional"
            />

            <button
              type="submit"
              disabled={status === 'sending'}
              style={LIQUID_ACCENT}
              className="btn-liquid inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-[#3D4FE0] text-sm font-semibold text-[#3D4FE0] transition-colors disabled:opacity-60"
            >
              <Mail className="h-4 w-4" /> {status === 'sending' ? 'Sending…' : 'Submit Application'}
            </button>

            {message && (
              <p
                className={`text-center text-sm ${
                  status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-red-600' : 'text-[#6b6b6b]'
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
