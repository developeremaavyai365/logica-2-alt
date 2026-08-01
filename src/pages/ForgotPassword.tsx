import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Stub — no email-sending backend exists yet in this demo.
    setSubmitted(true);
  }

  return (
    <div className="w-full bg-[#dbe8d6]">
      <div className="bg-[#f4f8f3]">
        <Header />
      </div>
      <section className="flex justify-center px-4 py-20 sm:px-6 md:px-10">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-[#1f2a1d]">Reset your password</h1>
          {submitted ? (
            <p className="mt-4 text-sm text-[#4b5b47]">
              If an account exists for <span className="font-medium text-[#1f2a1d]">{email}</span>, a reset link
              would be sent — this is a demo stub with no email backend connected yet.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mt-2 text-sm text-[#4b5b47]">Enter your email and we'll send you a reset link.</p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="mt-5 w-full rounded-lg border border-[#1f2a1d]/15 bg-[#f4f8f3] px-4 py-3 text-sm text-[#1f2a1d] outline-none transition-colors focus:border-[#1f2a1d]/40"
              />
              <button
                type="submit"
                className="btn-liquid mt-5 w-full rounded-full border-2 border-[#1f2a1d] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#1f2a1d] transition-colors"
              >
                Send Reset Link
              </button>
            </form>
          )}
          <Link to="/login" className="mt-5 block text-center text-xs text-[#4b5b47] hover:text-[#1f2a1d] transition-colors">
            Back to Sign In
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
