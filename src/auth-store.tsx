import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, bootstrapCsrf, ApiError, SessionExpiredError } from './lib/api-client';
import { setAccessToken } from './lib/token-store';

/**
 * Real auth store, backed by the Logica backend (NestJS + Prisma +
 * Postgres, custom JWT auth — see /backend). Replaces the earlier
 * localStorage demo. The access token lives only in memory (see
 * lib/token-store.ts); the refresh token is an httpOnly cookie this file
 * never reads directly; CSRF is handled per-request in lib/api-client.ts.
 */

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  emailVerified: boolean;
}

interface AuthResult {
  ok: boolean;
  error?: string;
  /** Set on a successful signup — the account exists but needs email
   *  verification before it can log in. */
  needsVerification?: boolean;
}

interface AuthApi {
  user: AuthUser | null;
  ready: boolean;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signIn: (identifier: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  verifyEmail: (token: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthApi | null>(null);

/** Every failure mode here — wrong password, unknown account, unverified
 *  email, locked account — comes back as whatever generic-but-useful
 *  message the backend already chose (it's the one deliberately avoiding
 *  account-enumeration leaks); this just relays it rather than
 *  second-guessing it. */
function messageFrom(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (Array.isArray(err.body && (err.body as { message?: unknown }).message)) {
      return ((err.body as { message: string[] }).message)[0] ?? fallback;
    }
    return err.message || fallback;
  }
  if (err instanceof SessionExpiredError) return err.message;
  return fallback;
}

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await bootstrapCsrf().catch(() => {
        // Non-fatal — worst case the first mutating request sets the
        // cookie instead. Don't block app startup on this.
      });

      try {
        // Attempt a silent refresh: if the httpOnly refresh cookie from a
        // previous session is still valid, this restores the session
        // without the user re-entering credentials.
        await apiFetch<{ accessToken: string }>('/auth/refresh', { method: 'POST' });
        const profile = await apiFetch<AuthUser>('/auth/me');
        if (!cancelled) setUser(profile);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      await apiFetch('/auth/signup', { method: 'POST', body: { name, email, password } });
      return { ok: true, needsVerification: true };
    } catch (err) {
      return { ok: false, error: messageFrom(err, 'Could not create account.') };
    }
  }, []);

  const signIn = useCallback(async (identifier: string, password: string): Promise<AuthResult> => {
    try {
      const data = await apiFetch<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: { identifier, password },
      });
      setAccessToken(data.accessToken);
      const profile = await apiFetch<AuthUser>('/auth/me');
      setUser(profile);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: messageFrom(err, 'Invalid credentials.') };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Even if the network call fails, still clear local state below —
      // the user's intent to log out should always take effect locally.
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<AuthResult> => {
    try {
      await apiFetch('/auth/verify-email', { method: 'POST', body: { token } });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: messageFrom(err, 'Invalid or expired verification link.') };
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      await apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: messageFrom(err, 'Something went wrong.') };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<AuthResult> => {
    try {
      await apiFetch('/auth/reset-password', { method: 'POST', body: { token, newPassword } });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: messageFrom(err, 'Invalid or expired reset link.') };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signUp, signIn, signOut, verifyEmail, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStore() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthStore must be used within AuthStoreProvider');
  return ctx;
}
