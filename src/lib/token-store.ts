/** The access token lives here — a plain module-level variable, never in
 *  localStorage/sessionStorage/cookies. It's gone the moment the tab
 *  closes or the page reloads, which is exactly the point: an XSS payload
 *  that runs can still call fetch() with whatever's in memory *right now*,
 *  but there's nothing durable for it to steal and reuse later, and
 *  nothing here for a non-JS attack (like a cookie read) to find at all.
 *
 *  React components read it via useSyncExternalStore-style subscription
 *  (see auth-store.tsx) rather than storing their own copy in state, so
 *  there's exactly one source of truth. */

type Listener = () => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  listeners.forEach((listener) => listener());
}

export function subscribeToAccessToken(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
