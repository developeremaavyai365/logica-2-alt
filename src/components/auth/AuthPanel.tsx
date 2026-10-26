import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../auth-store';
import { ABOUT_CARD } from '../about/AboutHero';
import { AUTH_HEADING as HEADING, AUTH_SUBMIT as SUBMIT, IconField } from './fields';

type Mode = 'signin' | 'signup';

interface Props {
  initialMode?: Mode;
  /** Called once sign-in or sign-up succeeds. */
  onSuccess?: () => void;
}

export default function AuthPanel({ initialMode = 'signin', onSuccess }: Props) {
  const { signIn, signUp, resendVerification } = useAuthStore();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpDone, setSignUpDone] = useState(false);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setSignInError('');
    setResendSent(false);
    setSignInLoading(true);
    const result = await signIn(signInEmail, signInPassword);
    setSignInLoading(false);
    if (!result.ok) {
      setSignInError(result.error ?? 'Something went wrong.');
      return;
    }
    onSuccess?.();
  }

  async function handleResendVerification() {
    setResendLoading(true);
    await resendVerification(signInEmail);
    setResendLoading(false);
    setResendSent(true);
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setSignUpError('');
    setSignUpLoading(true);
    const result = await signUp(signUpName, signUpEmail, signUpPassword);
    setSignUpLoading(false);
    if (!result.ok) {
      setSignUpError(result.error ?? 'Something went wrong.');
      return;
    }
    // Signup succeeding does NOT mean the account can log in yet — the
    // backend requires email verification first. Show that instead of
    // treating this like a successful sign-in.
    setSignUpDone(true);
  }

  const tab = (target: Mode) =>
    `flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 ${
      mode === target
        ? 'bg-[#061A40] text-white shadow-[0_8px_18px_-10px_rgba(6,26,64,0.7)]'
        : 'text-[#6B7280] hover:text-[#061A40]'
    }`;

  return (
    <div className="w-full max-w-md">
      {/* One card: the Sign In / Sign Up switch, then the form. */}
      <div className={`overflow-hidden ${ABOUT_CARD}`}>
        {/* Sign In / Sign Up switch */}
        <div className="mx-5 mt-5 flex gap-1 rounded-xl bg-[#F1F4FF] p-1 sm:mx-7 sm:mt-7">
          <button type="button" onClick={() => setMode('signin')} aria-pressed={mode === 'signin'} className={tab('signin')}>
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            aria-pressed={mode === 'signup'}
            className={tab('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="animate-fade-up">
            {/* Module — fields */}
            <div className="px-5 pb-2 pt-7 sm:px-7">
              <h1 className={HEADING} style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                Welcome back
              </h1>
              <p className="mt-2 text-[15px] text-[#6B7280]">Sign in to pick up right where you left off.</p>

              <div className="mt-6 space-y-3">
                <IconField
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                  value={signInEmail}
                  onChange={setSignInEmail}
                  placeholder="Email address"
                  required
                  autoComplete="email"
                />
                <IconField
                  icon={<Lock className="h-4 w-4" />}
                  type="password"
                  value={signInPassword}
                  onChange={setSignInPassword}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {signInError && <p className="mt-3 text-xs font-medium text-red-600">{signInError}</p>}

              {signInError === 'Please verify your email before logging in.' &&
                (resendSent ? (
                  <p className="mt-1 text-xs text-[#6B7280]">If that account is unverified, a new link has been sent.</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="mt-1 text-xs font-medium text-[#061A40] underline underline-offset-2 hover:text-[#3D4FE0] disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                  </button>
                ))}

              <div className="mt-3 flex justify-end">
                <Link to="/forgot-password" className="text-xs font-medium text-[#6B7280] transition-colors hover:text-[#3D4FE0]">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="px-5 pb-7 pt-5 sm:px-7">
              <button type="submit" disabled={signInLoading} className={SUBMIT}>
                {signInLoading ? 'Signing In…' : 'Sign In'}
                {!signInLoading && (
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                )}
              </button>
            </div>
          </form>
        ) : signUpDone ? (
          <div className="animate-fade-up flex flex-col items-center px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF1FF] text-[#3D4FE0]">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-4 font-dm-sans text-2xl font-bold text-[#061A40]">Check your email</h1>
            <p className="mt-2 max-w-xs text-sm text-[#6B7280]">
              We've sent a verification link to <span className="font-medium text-[#061A40]">{signUpEmail}</span>. Verify
              your address to finish creating your account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="animate-fade-up">
            {/* Module — fields */}
            <div className="px-5 pb-2 pt-7 sm:px-7">
              <h1 className={HEADING} style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                Create your account
              </h1>
              <p className="mt-2 text-[15px] text-[#6B7280]">Takes less than a minute.</p>

              <div className="mt-6 space-y-3">
                <IconField
                  icon={<UserIcon className="h-4 w-4" />}
                  type="text"
                  value={signUpName}
                  onChange={setSignUpName}
                  placeholder="Full name"
                  required
                  autoComplete="name"
                />
                <IconField
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                  value={signUpEmail}
                  onChange={setSignUpEmail}
                  placeholder="Email address"
                  required
                  autoComplete="email"
                />
                <div>
                  <IconField
                    icon={<Lock className="h-4 w-4" />}
                    type="password"
                    value={signUpPassword}
                    onChange={setSignUpPassword}
                    placeholder="Password"
                    required
                    minLength={10}
                    autoComplete="new-password"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF]">
                    10+ characters, with upper &amp; lower case, a number, and a symbol.
                  </p>
                </div>
              </div>

              {signUpError && <p className="mt-3 text-xs font-medium text-red-600">{signUpError}</p>}
            </div>

            <div className="px-5 pb-7 pt-5 sm:px-7">
              <button type="submit" disabled={signUpLoading} className={SUBMIT}>
                {signUpLoading ? 'Creating…' : 'Create Account'}
                {!signUpLoading && (
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-[#6B7280]">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="font-semibold text-[#061A40] underline underline-offset-2 hover:text-[#3D4FE0]"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
