import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../auth-store';

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
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#f0f0f0]">
        <Header />
      </div>
      <section className="flex justify-center px-4 py-20 sm:px-6 md:px-10">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-[#000000]">Reset your password</h1>
          {submitted ? (
            <p className="mt-4 text-sm text-[#6b6b6b]">
              If an account exists for <span className="font-medium text-[#000000]">{email}</span>, a reset link
              has been sent. It's valid for 30 minutes.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mt-2 text-sm text-[#6b6b6b]">Enter your email and we'll send you a reset link.</p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="mt-5 w-full rounded-lg border border-[#000000]/15 bg-[#f0f0f0] px-4 py-3 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-liquid mt-5 w-full rounded-full border-2 border-[#000000] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#000000] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
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
