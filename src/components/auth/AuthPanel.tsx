import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../auth-store';

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

  const signInForm = (
    <form onSubmit={handleSignIn} className="flex h-full flex-col items-center justify-center px-8 sm:px-12">
      <h1 className="text-2xl font-bold text-[#000000]">Sign In</h1>
      <p className="mt-2 text-xs text-[#6b6b6b]">Use your email and password</p>

      <input
        type="email"
        placeholder="Email"
        value={signInEmail}
        onChange={(e) => setSignInEmail(e.target.value)}
        required
        className="mt-5 w-full rounded-lg border border-[#000000]/15 bg-[#ECEDEC] px-4 py-3 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
      />
      <input
        type="password"
        placeholder="Password"
        value={signInPassword}
        onChange={(e) => setSignInPassword(e.target.value)}
        required
        className="mt-3 w-full rounded-lg border border-[#000000]/15 bg-[#ECEDEC] px-4 py-3 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
      />

      {signInError && <p className="mt-3 text-xs font-medium text-red-600">{signInError}</p>}

      {signInError === 'Please verify your email before logging in.' &&
        (resendSent ? (
          <p className="mt-1 text-xs text-[#6b6b6b]">If that account is unverified, a new link has been sent.</p>
        ) : (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="mt-1 text-xs font-medium text-[#000000] underline underline-offset-2 hover:opacity-70 disabled:opacity-50"
          >
            {resendLoading ? 'Sending…' : 'Resend verification email'}
          </button>
        ))}

      <Link to="/forgot-password" className="mt-4 text-xs text-[#6b6b6b] hover:text-[#000000] transition-colors">
        Forgot your password?
      </Link>

      <button
        type="submit"
        disabled={signInLoading}
        className="btn-liquid mt-6 w-full max-w-[220px] rounded-full border-2 border-[#000000] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#000000] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {signInLoading ? 'Signing In…' : 'Sign In'}
      </button>
    </form>
  );

  const signUpForm = signUpDone ? (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center sm:px-12">
      <h1 className="text-2xl font-bold text-[#000000]">Check your email</h1>
      <p className="mt-3 max-w-[260px] text-sm text-[#6b6b6b]">
        We've sent a verification link to <span className="font-medium text-[#000000]">{signUpEmail}</span>. Verify
        your address to finish creating your account.
      </p>
    </div>
  ) : (
    <form onSubmit={handleSignUp} className="flex h-full flex-col items-center justify-center px-8 sm:px-12">
      <h1 className="text-2xl font-bold text-[#000000]">Create Account</h1>
      <p className="mt-2 text-xs text-[#6b6b6b]">Use your email to register</p>

      <input
        type="text"
        placeholder="Name"
        value={signUpName}
        onChange={(e) => setSignUpName(e.target.value)}
        required
        className="mt-5 w-full rounded-lg border border-[#000000]/15 bg-[#ECEDEC] px-4 py-3 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
      />
      <input
        type="email"
        placeholder="Email"
        value={signUpEmail}
        onChange={(e) => setSignUpEmail(e.target.value)}
        required
        className="mt-3 w-full rounded-lg border border-[#000000]/15 bg-[#ECEDEC] px-4 py-3 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
      />
      <input
        type="password"
        placeholder="Password"
        value={signUpPassword}
        onChange={(e) => setSignUpPassword(e.target.value)}
        required
        minLength={10}
        className="mt-3 w-full rounded-lg border border-[#000000]/15 bg-[#ECEDEC] px-4 py-3 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
      />
      <p className="mt-1.5 w-full text-left text-[11px] text-[#6b6b6b]">
        10+ characters, with upper &amp; lower case, a number, and a symbol.
      </p>

      {signUpError && <p className="mt-3 text-xs font-medium text-red-600">{signUpError}</p>}

      <button
        type="submit"
        disabled={signUpLoading}
        className="btn-liquid mt-6 w-full max-w-[220px] rounded-full border-2 border-[#000000] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#000000] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {signUpLoading ? 'Creating…' : 'Sign Up'}
      </button>
    </form>
  );

  return (
    <div className="w-full max-w-[768px]">
      {/* ===== Desktop: classic double-slider ===== */}
      <div className={`auth-container hidden bg-white sm:block ${mode === 'signup' ? 'right-panel-active' : ''}`}>
        <div className="auth-form-container auth-sign-in-container">{signInForm}</div>
        <div className="auth-form-container auth-sign-up-container">{signUpForm}</div>

        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="auth-overlay-panel auth-overlay-left">
              <h2 className="text-xl font-bold text-white">Welcome Back!</h2>
              <p className="mt-3 max-w-[220px] text-xs leading-relaxed text-white/70">
                Sign in to pick up where you left off — orders, wishlist, and faster checkout.
              </p>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="mt-6 rounded-full border-2 border-white px-8 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
              >
                Sign In
              </button>
            </div>
            <div className="auth-overlay-panel auth-overlay-right">
              <h2 className="text-xl font-bold text-white">New Here?</h2>
              <p className="mt-3 max-w-[220px] text-xs leading-relaxed text-white/70">
                Create an account to save your details and check out faster next time.
              </p>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="mt-6 rounded-full border-2 border-white px-8 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile: stacked tab toggle ===== */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg sm:hidden">
        <div className="flex border-b border-[#000000]/10">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
              mode === 'signin' ? 'bg-[#000000] text-white' : 'text-[#6b6b6b]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
              mode === 'signup' ? 'bg-[#000000] text-white' : 'text-[#6b6b6b]'
            }`}
          >
            Sign Up
          </button>
        </div>
        <div className="min-h-[420px] py-8">{mode === 'signin' ? signInForm : signUpForm}</div>
      </div>
    </div>
  );
}
