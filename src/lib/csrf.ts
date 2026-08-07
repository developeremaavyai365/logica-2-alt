const CSRF_COOKIE_NAME = 'logica_csrf';

/** Reads the CSRF token cookie the backend sets — it's deliberately NOT
 *  httpOnly (the whole double-submit-cookie mechanism requires JS to be
 *  able to read it and echo it back as a header), unlike the refresh
 *  token cookie which the frontend never touches. */
export function readCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
