import { getAccessToken, setAccessToken } from './token-store';
import { readCsrfToken } from './csrf';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

if (!API_URL) {
  // Fail loudly at import time rather than let every request fail with a
  // confusing network error — this only fires if VITE_API_URL wasn't set
  // at build time.
  console.error('VITE_API_URL is not set — auth/account features will not work.');
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Endpoints that never carry an access token in the first place (the
 *  backend's @Public() routes). A 401 from one of these is a REAL auth
 *  failure — wrong password, unverified account, expired reset token —
 *  not "the access token expired," so it must never trigger the silent-
 *  refresh-and-retry path below. Without this exclusion, a wrong-password
 *  login 401 gets swallowed and rewritten into a misleading generic
 *  "session expired" message instead of the real one from the backend. */
const NO_REFRESH_RETRY_PATHS = new Set([
  '/auth/signup',
  '/auth/login',
  '/auth/refresh',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/csrf',
]);

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
  }
}

/** Thrown specifically when a request failed because the session is truly
 *  over (refresh itself failed) — callers use this to distinguish "please
 *  log in again" from an ordinary API error. */
export class SessionExpiredError extends Error {}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Internal — prevents the refresh-and-retry logic from recursing. */
  _isRetry?: boolean;
}

let refreshInFlight: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'x-csrf-token': readCsrfToken() ?? '' },
  });

  if (!res.ok) {
    setAccessToken(null);
    throw new SessionExpiredError('Session expired — please log in again.');
  }

  const data = (await res.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}

/** Ensures concurrent 401s only trigger one real refresh call, not one
 *  per in-flight request — everyone waiting gets the same promise. */
function refreshOnce(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, _isRetry, headers, ...rest } = options;
  const method = (options.method ?? 'GET').toUpperCase();

  const finalHeaders = new Headers(headers);
  if (body !== undefined) finalHeaders.set('Content-Type', 'application/json');

  const token = getAccessToken();
  if (token) finalHeaders.set('Authorization', `Bearer ${token}`);

  if (MUTATING_METHODS.has(method)) {
    finalHeaders.set('x-csrf-token', readCsrfToken() ?? '');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    method,
    credentials: 'include', // required so the httpOnly refresh cookie and the CSRF cookie are sent
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !_isRetry && !NO_REFRESH_RETRY_PATHS.has(path)) {
    // Access token expired mid-session — try exactly one silent refresh,
    // then retry the original request exactly once. Never retry the
    // retry: that's how you get an infinite loop against a truly-dead
    // session.
    await refreshOnce(); // throws SessionExpiredError if this fails, which we let propagate
    return apiFetch<T>(path, { ...options, _isRetry: true });
  }

  if (!res.ok) {
    let parsedBody: unknown = null;
    try {
      parsedBody = await res.json();
    } catch {
      // non-JSON error body — leave parsedBody null
    }
    const message =
      (parsedBody as { message?: string | string[] } | null)?.message?.toString() ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, parsedBody);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Call once on app boot so the CSRF cookie is guaranteed to exist before
 *  the user submits any form. */
export async function bootstrapCsrf(): Promise<void> {
  await fetch(`${API_URL}/auth/csrf`, { credentials: 'include' });
}
