import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, Mail, MailCheck, MousePointerClick } from 'lucide-react';
import { useAuthStore } from '../auth-store';
import AuthShell, { TitleGlow } from '../components/auth/AuthShell';
import { AUTH_HEADING, AUTH_SUBMIT, IconField } from '../components/auth/fields';
import { ABOUT_CARD } from '../components/about/AboutHero';

/** How a reset works, shown on the navy panel. */
const STEPS = [
  { icon: Mail, text: 'Enter the email address you signed up with' },
  { icon: MousePointerClick, text: 'Open the reset link we send you, valid for 30 minutes' },
  { icon: KeyRound, text: 'Choose a new password and sign back in' },
];

export default function ForgotPassword() {
  const { forgotPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // The backend always responds the same way whether or not the email
    // is registered (avoids account-enumeration), so there's nothing to
    // branch on here either — just show the same message either way.
    await forgotPassword(email);
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={
        <>
          Locked out? <TitleGlow>We&rsquo;ve got you.</TitleGlow>
        </>
      }
      text="Reset your password in three quick steps and get back to your orders and wishlist."
      points={STEPS}
    >
      <div className="w-full max-w-md">
        <div className={`overflow-hidden ${ABOUT_CARD}`}>
          {submitted ? (
            <div className="animate-fade-up flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF1FF] text-[#3D4FE0]">
                <MailCheck className="h-7 w-7" />
              </span>
              <h1 className="mt-4 font-dm-sans text-2xl font-bold text-[#061A40]">Check your email</h1>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6B7280]">
                If an account exists for <span className="font-medium text-[#061A40]">{email}</span>, a reset link has been
                sent. It&rsquo;s valid for 30 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="animate-fade-up">
              <div className="px-5 pb-2 pt-7 sm:px-7">
                <h1 className={AUTH_HEADING} style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                  Reset your password
                </h1>
                <p className="mt-2 text-[15px] text-[#6B7280]">Enter your email and we&rsquo;ll send you a reset link.</p>

                <div className="mt-6">
                  <IconField
                    icon={<Mail className="h-4 w-4" />}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="Email address"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="px-5 pb-7 pt-5 sm:px-7">
                <button type="submit" disabled={loading} className={AUTH_SUBMIT}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <Link
          to="/login"
          className="group mx-auto mt-5 flex w-fit items-center gap-1.5 text-sm font-semibold text-[#061A40] transition-colors hover:text-[#3D4FE0]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:-translate-x-1" />
          Back to Sign In
        </Link>
      </div>
    </AuthShell>
  );
}
