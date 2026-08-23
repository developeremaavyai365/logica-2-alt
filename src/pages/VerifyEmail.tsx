import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../auth-store';

type Status = 'verifying' | 'success' | 'error';

export default function VerifyEmail() {
  const { ready, verifyEmail } = useAuthStore();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('verifying');
  const [error, setError] = useState('');
  const attempted = useRef(false);

  useEffect(() => {
    // Wait for the auth store's own bootstrap (which sets the CSRF cookie)
    // to finish first. A verification link opened fresh from an email
    // client is a brand-new tab with no cookie yet — firing this POST
    // before that bootstrap completes races the cookie and fails with
    // "Invalid or missing CSRF token."
    if (!ready) return;
    if (attempted.current) return; // StrictMode double-invoke guard — a
    attempted.current = true; // verification token is single-use, so a
    // duplicate call would show a false "invalid link" error.

    if (!token) {
      setStatus('error');
      setError('This link is missing its verification token.');
      return;
    }

    verifyEmail(token).then((result) => {
      if (result.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(result.error ?? 'This link is invalid or has expired.');
      }
    });
  }, [ready, token, verifyEmail]);

  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>
      <section className="flex justify-center px-4 py-20 sm:px-6 md:px-10">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
          {status === 'verifying' && (
            <>
              <h1 className="text-xl font-bold text-[#000000]">Verifying your email…</h1>
              <p className="mt-3 text-sm text-[#6b6b6b]">One moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="text-xl font-bold text-[#000000]">Email verified</h1>
              <p className="mt-3 text-sm text-[#6b6b6b]">Your account is ready. You can sign in now.</p>
              <Link
                to="/login"
                className="btn-liquid mt-6 inline-block w-full rounded-full border-2 border-[#000000] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#000000] transition-colors"
              >
                Sign In
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="text-xl font-bold text-[#000000]">Verification failed</h1>
              <p className="mt-3 text-sm text-red-600">{error}</p>
              <Link to="/signup" className="mt-6 block text-sm text-[#6b6b6b] underline hover:text-[#000000]">
                Back to sign up
              </Link>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
