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
  dateOfBirth: string | null;
  gender: string | null;
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
  /** The /admin panel's sign-in: administrator accounts only. */
  adminSignIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  verifyEmail: (token: string) => Promise<AuthResult>;
  resendVerification: (email: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
  updateProfile: (data: { name?: string; phone?: string; dateOfBirth?: string; gender?: string }) => Promise<AuthResult>;
  /** Signs every other device out; this one stays signed in. */
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthApi | null>(null);

/** Every failure mode here — wrong password, unknown account, unverified
 *  email, locked account — comes back as whatever generic-but-useful
 *  message the backend already chose (it's the one deliberately avoiding
 *  account-enumeration leaks); this just relays it rather than
 *  second-guessing it. */
export function messageFrom(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (Array.isArray(err.body && (err.body as { message?: unknown }).message)) {
      return ((err.body as { message: string[] }).message)[0] ?? fallback;
    }
    return err.message || fallback;
  }
  if (err instanceof SessionExpiredError) return err.message;
  // fetch() itself failed: no answer from the server at all (offline, or
  // the backend is down). Never report that as wrong credentials.
  if (err instanceof TypeError) return "Can't reach Logica right now. Please check your internet connection and try again.";
  return fallback;
}

/** Restores a previous session from the httpOnly refresh cookie, once per
 *  page load. Shared, because React runs start-up effects twice in
 *  development: two refreshes at once would send the same refresh token
 *  twice, the second would be refused as reused, and the visitor would
 *  look signed out. */
let sessionRestore: Promise<AuthUser | null> | null = null;
function restoreSession(): Promise<AuthUser | null> {
  sessionRestore ??= (async () => {
    await bootstrapCsrf().catch(() => {
      // Non-fatal — worst case the first mutating request sets the
      // cookie instead. Don't block app startup on this.
    });
    try {
      await apiFetch<{ accessToken: string }>('/auth/refresh', { method: 'POST' });
      return await apiFetch<AuthUser>('/auth/me');
    } catch {
      return null;
    }
  })();
  return sessionRestore;
}

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    restoreSession().then((profile) => {
      if (cancelled) return;
      setUser(profile);
      setReady(true);
    });
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

  const adminSignIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await apiFetch<{ accessToken: string }>('/auth/admin/login', {
        method: 'POST',
        body: { identifier: email, password },
      });
      setAccessToken(data.accessToken);
      const profile = await apiFetch<AuthUser>('/auth/me');
      setUser(profile);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: messageFrom(err, 'Invalid email or password.') };
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

  const resendVerification = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      await apiFetch('/auth/resend-verification', { method: 'POST', body: { email } });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: messageFrom(err, 'Something went wrong.') };
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

  const updateProfile = useCallback(
    async (data: { name?: string; phone?: string; dateOfBirth?: string; gender?: string }): Promise<AuthResult> => {
      try {
        const profile = await apiFetch<AuthUser>('/auth/me', { method: 'PATCH', body: data });
        setUser(profile);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: messageFrom(err, 'Could not save your changes.') };
      }
    },
    [],
  );

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
    try {
      await apiFetch('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: messageFrom(err, 'Could not change your password.') };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        signUp,
        signIn,
        adminSignIn,
        signOut,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStore() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthStore must be used within AuthStoreProvider');
  return ctx;
}
