import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Hash, LinkIcon, Lock, LogOut, Type } from 'lucide-react';
import { useAuthStore } from '../auth-store';
import AuthShell, { TitleGlow } from '../components/auth/AuthShell';
import { AUTH_HEADING, AUTH_SUBMIT, IconField } from '../components/auth/fields';
import { ABOUT_CARD } from '../components/about/AboutHero';

/** What makes a password the backend accepts, and what happens after. */
const TIPS = [
  { icon: Type, text: 'At least 10 characters, with upper and lower case letters' },
  { icon: Hash, text: 'Include at least one number and one symbol' },
  { icon: LogOut, text: 'For your safety, every signed-in device is signed out once you reset' },
];

/** A centred message in the card: an icon, a title, a line of text and an
 *  action. Used for the missing-link and the done states. */
function Notice({
  tone,
  icon,
  title,
  children,
  action,
}: {
  tone: 'ok' | 'error';
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up flex flex-col items-center px-6 py-12 text-center sm:px-10">
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          tone === 'ok' ? 'bg-[#EEF1FF] text-[#3D4FE0]' : 'bg-red-50 text-red-600'
        }`}
      >
        {icon}
      </span>
      <h1 className="mt-4 font-dm-sans text-2xl font-bold text-[#061A40]">{title}</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6B7280]">{children}</p>
      <div className="mt-7 w-full">{action}</div>
    </div>
  );
}

export default function ResetPassword() {
  const { resetPassword } = useAuthStore();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }
    setDone(true);
  }

  const arrow = <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />;

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={
        <>
          Almost there. <TitleGlow>Pick a new password.</TitleGlow>
        </>
      }
      text="Choose a strong password you haven't used before, then sign back in."
      points={TIPS}
    >
      <div className="w-full max-w-md">
        <div className={`overflow-hidden ${ABOUT_CARD}`}>
          {!token ? (
            <Notice
              tone="error"
              icon={<LinkIcon className="h-7 w-7" />}
              title="This link isn't complete"
              action={
                <Link to="/forgot-password" className={AUTH_SUBMIT}>
                  Request a new link
                  {arrow}
                </Link>
              }
            >
              The reset link is missing its token. Request a new one and use the link from that email.
            </Notice>
          ) : done ? (
            <Notice
              tone="ok"
              icon={<CheckCircle2 className="h-7 w-7" />}
              title="Password reset"
              action={
                <Link to="/login" className={AUTH_SUBMIT}>
                  Sign in
                  {arrow}
                </Link>
              }
            >
              For your safety, every existing session on your account has been signed out. Sign in with your new password.
            </Notice>
          ) : (
            <form onSubmit={handleSubmit} className="animate-fade-up">
              <div className="px-5 pb-2 pt-7 sm:px-7">
                <h1 className={AUTH_HEADING} style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                  Set a new password
                </h1>
                <p className="mt-2 text-[15px] text-[#6B7280]">Choose a new password for your account.</p>

                <div className="mt-6">
                  <IconField
                    icon={<Lock className="h-4 w-4" />}
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="New password"
                    required
                    minLength={10}
                    autoComplete="new-password"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF]">
                    10+ characters, with upper &amp; lower case, a number, and a symbol.
                  </p>
                </div>

                {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
              </div>

              <div className="px-5 pb-7 pt-5 sm:px-7">
                <button type="submit" disabled={loading} className={AUTH_SUBMIT}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                  {!loading && arrow}
                </button>
              </div>
            </form>
          )}
        </div>

        {!done && (
          <Link
            to="/login"
            className="group mx-auto mt-5 flex w-fit items-center gap-1.5 text-sm font-semibold text-[#061A40] transition-colors hover:text-[#3D4FE0]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:-translate-x-1" />
            Back to Sign In
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
