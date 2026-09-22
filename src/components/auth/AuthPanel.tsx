import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../auth-store';

type Mode = 'signin' | 'signup';

// Same green as the split-screen's gradient half, so the form half reads as
// part of the same design instead of a plain black-accented card dropped
// next to it.
const GREEN = '#15803D';
const LIQUID_GREEN = { '--liquid': GREEN, '--liquid-ink': '#ffffff' } as CSSProperties;

interface Props {
  initialMode?: Mode;
  /** Called once sign-in or sign-up succeeds. */
  onSuccess?: () => void;
}

/** A single modern card rather than the old two-panel "slide the colored
 *  overlay across" pattern — that layout is a recognizable tutorial
 *  template (Florin Pop's CodePen), which reads as generic rather than
 *  something built for this site. One card, a pill segmented control to
 *  switch modes, icon-accented inputs and a password visibility toggle
 *  instead. */
function IconField({
  icon,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
}: {
  icon: ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]">{icon}</span>
      <input
        type={resolvedType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="h-[52px] w-full rounded-2xl border-2 border-black/10 bg-[#F7F7F7] pl-11 pr-11 text-sm text-black outline-none transition-colors placeholder:text-[#9a9a9a] focus:border-[#15803D] focus:bg-white"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-[#9a9a9a] transition-colors hover:bg-black/5 hover:text-black"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
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

  return (
    <div className="w-full max-w-md">
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-25px_rgba(0,0,0,0.35)]">
        {/* Segmented control */}
        <div className="p-6 pb-0 sm:p-8 sm:pb-0">
          <div className="relative flex rounded-full bg-[#ECEDEC] p-1">
            <span
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-[#15803D] shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: mode === 'signup' ? 'translateX(calc(100% + 8px))' : 'translateX(0)' }}
            />
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`relative z-10 flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                mode === 'signin' ? 'text-white' : 'text-[#6b6b6b]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`relative z-10 flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                mode === 'signup' ? 'text-white' : 'text-[#6b6b6b]'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="animate-fade-up">
              <h1 className="text-2xl font-bold text-black" style={{ letterSpacing: '-0.02em' }}>
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-[#6b6b6b]">Sign in to pick up right where you left off.</p>

              <div className="mt-6 space-y-3.5">
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
                  <p className="mt-1 text-xs text-[#6b6b6b]">If that account is unverified, a new link has been sent.</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="mt-1 text-xs font-medium text-black underline underline-offset-2 hover:opacity-70 disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                  </button>
                ))}

              <div className="mt-3 flex justify-end">
                <Link to="/forgot-password" className="text-xs text-[#6b6b6b] transition-colors hover:text-black">
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={signInLoading}
                style={LIQUID_GREEN}
                className="btn-liquid mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#15803D] text-sm font-semibold text-[#15803D] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signInLoading ? 'Signing In…' : 'Sign In'}
                {!signInLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : signUpDone ? (
            <div className="animate-fade-up flex flex-col items-center py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DFF5E3] text-[#15803D]">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-black">Check your email</h1>
              <p className="mt-2 max-w-xs text-sm text-[#6b6b6b]">
                We've sent a verification link to <span className="font-medium text-black">{signUpEmail}</span>. Verify
                your address to finish creating your account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="animate-fade-up">
              <h1 className="text-2xl font-bold text-black" style={{ letterSpacing: '-0.02em' }}>
                Create your account
              </h1>
              <p className="mt-1.5 text-sm text-[#6b6b6b]">Takes less than a minute.</p>

              <div className="mt-6 space-y-3.5">
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
                  <p className="mt-1.5 text-[11px] text-[#9a9a9a]">
                    10+ characters, with upper &amp; lower case, a number, and a symbol.
                  </p>
                </div>
              </div>

              {signUpError && <p className="mt-3 text-xs font-medium text-red-600">{signUpError}</p>}

              <button
                type="submit"
                disabled={signUpLoading}
                style={LIQUID_GREEN}
                className="btn-liquid mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#15803D] text-sm font-semibold text-[#15803D] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signUpLoading ? 'Creating…' : 'Create Account'}
                {!signUpLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-[#6b6b6b]">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="font-semibold text-black underline underline-offset-2"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
