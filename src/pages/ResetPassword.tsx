import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../auth-store';

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
      setError('This reset link is missing its token — please request a new one.');
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

  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>
      <section className="flex justify-center px-4 py-20 sm:px-6 md:px-10">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-[#000000]">Set a new password</h1>

          {!token && (
            <p className="mt-4 text-sm text-red-600">
              This link is missing its reset token. Request a new one from the{' '}
              <Link to="/forgot-password" className="underline">
                forgot password
              </Link>{' '}
              page.
            </p>
          )}

          {token && !done && (
            <form onSubmit={handleSubmit}>
              <p className="mt-2 text-sm text-[#6b6b6b]">Choose a new password for your account.</p>
              <input
                type="password"
                required
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="mt-5 w-full rounded-lg border border-[#000000]/15 bg-[#ECEDEC] px-4 py-3 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
              />
              <p className="mt-1.5 text-[11px] text-[#6b6b6b]">
                10+ characters, with upper &amp; lower case, a number, and a symbol.
              </p>

              {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-liquid mt-5 w-full rounded-full border-2 border-[#000000] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#000000] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          {done && (
            <p className="mt-4 text-sm text-[#6b6b6b]">
              Password reset. Every existing session on your account has been signed out for safety — please{' '}
              <Link to="/login" className="font-medium text-[#000000] underline">
                sign in
              </Link>{' '}
              with your new password.
            </p>
          )}

          <Link to="/login" className="mt-5 block text-center text-xs text-[#6b6b6b] hover:text-[#000000] transition-colors">
            Back to Sign In
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
