import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * ⚠️ DEMO-ONLY AUTH — NOT SECURE, DO NOT SHIP AS-IS.
 *
 * This project is a static Vite SPA with no backend, no database, and no
 * server to trust. There is nothing here to hash passwords against or to
 * issue a real session/JWT from. This store simulates the sign-in/sign-up
 * UX (validation, "email already registered", loading states) entirely in
 * the browser, storing "accounts" — including plaintext passwords — in
 * localStorage. Anyone with devtools can read or forge this. Before any
 * real launch, replace this file with a real backend (e.g. Supabase Auth,
 * or a custom API with bcrypt + server-issued sessions) and keep the same
 * `useAuthStore()` hook shape so the UI layer doesn't need to change.
 */

export interface AuthUser {
  name: string;
  email: string;
}

interface DemoAccount {
  name: string;
  password: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthApi {
  user: AuthUser | null;
  ready: boolean;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => void;
}

const ACCOUNTS_KEY = 'logica2-auth-accounts-demo';
const SESSION_KEY = 'logica2-auth-session-demo';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readAccounts(): Record<string, DemoAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, DemoAccount>) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore write failures (private browsing, quota, etc.)
  }
}

/** Simulates request latency so loading states are visible/testable. */
function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore malformed localStorage
    }
    setReady(true);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) return { ok: false, error: 'Please enter your name.' };
    if (!EMAIL_RE.test(normalizedEmail)) return { ok: false, error: 'Please enter a valid email address.' };
    if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

    await delay();

    const accounts = readAccounts();
    if (accounts[normalizedEmail]) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    accounts[normalizedEmail] = { name: trimmedName, password };
    writeAccounts(accounts);

    const nextUser: AuthUser = { name: trimmedName, email: normalizedEmail };
    setUser(nextUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    return { ok: true };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) return { ok: false, error: 'Please enter a valid email address.' };
    if (!password) return { ok: false, error: 'Please enter your password.' };

    await delay();

    const accounts = readAccounts();
    const account = accounts[normalizedEmail];
    if (!account || account.password !== password) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const nextUser: AuthUser = { name: account.name, email: normalizedEmail };
    setUser(nextUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStore() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthStore must be used within AuthStoreProvider');
  return ctx;
}
