# Logica Backend

Self-hosted backend for Logica Infoway's e-commerce site. NestJS + Prisma + PostgreSQL, custom JWT auth (no Supabase, no third-party auth-as-a-service).

## Status: Phase 1 (Auth) implemented

See the phased plan below. Phases 2–7 (catalog, cart/checkout, order lifecycle, payments, admin/audit) are **not built yet** — this is deliberately just Phase 1 so it can be reviewed and tested before more is built on top of it.

## What's implemented in Phase 1

- Signup (email or phone) with server-side strong-password enforcement (10+ chars, upper/lower/digit/symbol)
- Argon2id password hashing (OWASP-recommended params, configurable via env)
- Email verification (token-based; verification link is currently **logged to the console**, not actually emailed — see "Known gaps" below)
- Login with account lockout after 5 failed attempts (15 min lockout), generic error messages (no account-enumeration leak)
- RS256-signed access tokens (15 min expiry) — asymmetric so only this service can *mint* tokens, while anything that only needs to *verify* only needs the public key
- Opaque, hashed refresh tokens (30 day expiry) in an `httpOnly, secure, sameSite=strict` cookie — never in localStorage, never stored in plaintext
- Refresh rotation with reuse detection: every refresh invalidates the old token and issues a new one; if an already-used token is presented again, the entire session family is revoked (compromise response)
- Logout revokes the specific refresh token server-side
- Password reset (token-based, single-use, 30 min expiry) — resetting also revokes every existing session for that user
- Per-route rate limiting on every auth endpoint (tighter than the app-wide default), plus the account-lockout logic on top for login specifically
- Global `JwtAuthGuard` — every route requires a valid access token by default; you opt a route *out* with `@Public()` rather than opting protected routes in, so a forgotten guard can never leave something open by accident
- `RolesGuard` + `@Roles()` scaffolding ready for Phase 2 (not wired to any routes yet since there are no role-gated endpoints in Phase 1)
- Global validation pipe: unknown fields on any request are rejected outright (`forbidNonWhitelisted`), not silently dropped
- `helmet()` for security headers, strict CORS allow-list (no wildcard), global exception filter that never leaks stack traces to the client
- **CSRF protection** (double-submit cookie): a non-httpOnly `logica_csrf` cookie is set on first contact (or explicitly via `GET /auth/csrf`); every mutating request (`POST`/`PUT`/`PATCH`/`DELETE`) must echo that same value in an `x-csrf-token` header, checked with a timing-safe comparison. `signup` and `login` are exempt (no ambient session cookie to forge yet); everything else — including `refresh` and `logout`, which ride on the ambient httpOnly refresh cookie — is protected. See `src/common/middleware/csrf.middleware.ts`.

## Frontend integration contract (confirmed — build against this)

- **Base URL**: whatever `PORT`/host you deploy this on, e.g. `http://localhost:4000`.
- **Access token**: returned in the JSON body of `login`/`refresh` as `{ accessToken: string }`. Keep it in memory only (React state/context) — never localStorage/sessionStorage. Send it as `Authorization: Bearer <token>`.
- **Refresh token**: never touched by frontend JS. It's an `httpOnly, secure (prod), sameSite=strict` cookie named `logica_rt`, scoped to path `/auth`, set automatically by `login`/`refresh` responses. The browser sends it automatically on requests to `/auth/*` as long as `credentials: 'include'` is set on the fetch/axios call.
- **CSRF token**: a JS-readable cookie named `logica_csrf`. Read it with `document.cookie`, send it back as header `x-csrf-token` on every `POST`/`PUT`/`PATCH`/`DELETE`. Call `GET /auth/csrf` once on app boot to guarantee it exists before the user does anything. Not required on `signup`/`login`.
- **CORS**: every request needs `credentials: 'include'`; the backend's `CORS_ORIGINS` env var must list the frontend's exact origin(s) — no wildcard works with credentialed requests anyway (browsers block it).
- **401 handling**: access tokens expire in 15 minutes. On a 401 from any protected endpoint, call `POST /auth/refresh` once (cookie-authenticated, needs the CSRF header) to get a new access token, then retry the original request once. If refresh itself 401s, the session is truly over — clear in-memory state and redirect to login. Guard against infinite loops: never auto-retry a request that was itself a refresh call.
- **Signup now requires `name`** (added after the frontend's signup form was reviewed — the User model didn't have it before): `POST /auth/signup` body is `{ name, email?, phone?, password }` (one of email/phone required).
- **`GET /auth/me`** (protected) returns `{ id, name, email, phone, role, emailVerified }` — the JWT payload deliberately has no PII (just `sub`/`role`/`sessionId`), so call this once after establishing a session to get anything displayable.

## Known gaps — flagged, not hidden

- **Email sending is a console-log stub** (`src/mail/mail.service.ts`). Verification/reset links print to the server log instead of being emailed. Wire a real provider (SES, Resend, etc.) before this goes anywhere near production — the rest of the auth flow doesn't need to change, only this file.
- **No integration test run yet** — this sandbox has no Docker, so I couldn't spin up Postgres/Redis to run a live signup → verify → login → refresh → logout cycle end to end. The build compiles clean and the password-validator unit tests pass, but you should run the flow for real (see below) before trusting it in front of users.
- **HSTS / CSP** headers: `helmet()` sets sane defaults, but the *real* CSP policy and HSTS max-age should be finalized at your reverse proxy (nginx/Caddy) in front of this service, once you know the actual frontend origins in production.
- **Phone OTP login**: deferred to a later phase, as agreed.

## Local setup

```bash
cd backend
npm install
docker compose up -d          # Postgres + Redis
cp .env.example .env          # then edit DATABASE_URL/REDIS_URL/etc if needed
npm run keys:generate         # generates keys/jwt-private.pem + jwt-public.pem (gitignored)
npx prisma migrate dev --name init
npm run start:dev
```

Try it:

```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"Correct-Horse9"}'
# check the server console for the verification link (mail is stubbed to console)

curl -X POST http://localhost:4000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"<paste from console log>"}'

curl -c cookies.txt -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"you@example.com","password":"Correct-Horse9"}'
# -> { "accessToken": "..." } and a Set-Cookie for the refresh token in cookies.txt

curl -b cookies.txt -c cookies.txt -X POST http://localhost:4000/auth/refresh
curl -b cookies.txt -X POST http://localhost:4000/auth/logout
```

## Folder structure

```
backend/
  src/
    main.ts, app.module.ts
    config/            # env validation (zod) — boot fails fast on misconfiguration
    common/            # guards, decorators, global exception filter
    prisma/            # PrismaService/Module
    redis/             # RedisModule (ready for Phase 2 caching/session use)
    mail/              # MailService (console stub — replace before prod)
    modules/
      auth/            # everything Phase 1 built
  prisma/schema.prisma # full schema for ALL phases, defined upfront (see below)
  scripts/generate-jwt-keys.js
  docker-compose.yml   # local Postgres + Redis
  .github/workflows/ci.yml  # build + test + npm audit on every push
```

The Prisma schema already includes the full data model from the original proposal (products, variants, cart, orders, order status history, payments, invoices, audit log) even though only the `User`/`RefreshToken`/`*VerificationToken` tables are used by Phase 1 code — this avoids painful schema churn as later phases build on top, and lets you see the whole shape of the system now.

## Phased plan (confirm before I start each one)

1. **Auth** — ✅ this delivery
2. Users/Addresses/RBAC — profile, addresses, `RolesGuard` proven on a real admin-only route
3. Product catalog — categories, brands, products, variants, soft-delete, admin CRUD
4. Cart/Checkout — server-side cart, guest-to-user merge, server-recomputed pricing
5. Order lifecycle — atomic stock decrement, status timeline, GST invoice generation
6. Payments — Razorpay integration, signature-verified webhooks, refund/failure states
7. Admin/audit/hardening — audit logging on sensitive actions, final CSP/CSRF/HSTS pass
