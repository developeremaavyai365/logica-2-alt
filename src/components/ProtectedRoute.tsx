import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../auth-store';

/** Client-side guard for pages like account/checkout/order history — this
 *  is a UX convenience (redirect before the page even tries to render),
 *  NOT the real security boundary. Every protected backend endpoint
 *  re-verifies the access token itself regardless of what this component
 *  does; a determined attacker skipping this redirect entirely still
 *  can't call an authenticated API without a valid token. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, ready } = useAuthStore();
  const location = useLocation();

  if (!ready) {
    // Avoid a flash-redirect to /login while the silent refresh (which
    // may well restore a valid session from the httpOnly cookie) is
    // still in flight.
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#6b6b6b]">Loading…</div>;
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
}
