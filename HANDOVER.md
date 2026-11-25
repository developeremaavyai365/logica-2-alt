# Handover — Logica Infoway website

Handover notes for the Logica Infoway website repository
(`developeremaavyai365/logica-2-alt`), prepared on 25 November 2026.

This file contains **no passwords, keys or tokens**. Secrets are handed over
separately (see [Credentials and access](#credentials-and-access)).

---

## 1. Where everything is

| Branch | What it holds | Live? |
| --- | --- | --- |
| `main` | The live website at www.logicainfoway.com (Vercel deploys from it). Last change: H1 FY27 investor presentation, 20.11.2026. | Yes |
| `handover/shop-and-admin` | `main` plus 14 finished but **unreleased** commits: customer accounts, checkout and orders, the admin panel for products, offers and orders, and this file. | No |

Every commit, with its full history, is on GitHub. Nothing is left only on a
personal machine.

The unreleased branch builds cleanly. On 25.11.2026:

- backend: 17 test suites, 201 tests, all passing; type-check clean
- website: `npm run build` succeeds

---

## 2. What the system is

- **Website** (`/`): Vite + React 18 + TypeScript + Tailwind. Deployed on
  **Vercel** from `main`. See [README.md](README.md) for layout and how to
  add investor filings.
- **Backend** (`/backend`): NestJS + Prisma + PostgreSQL + Redis. Hosted on
  **Railway**: project `fulfilling-tenderness`, services `logica-2-alt` (API),
  `Postgres` and `Redis`. Shell access: `railway ssh -s logica-2-alt -e production`.
  Note: [backend/README.md](backend/README.md) still says "Phase 1 (Auth)";
  everything listed below has since been built.
- **DNS** points at Vercel. Keep the CAA records for `letsencrypt.org` and
  `emsign.com`; removing them breaks certificate renewal.

### Backend modules (`backend/src/modules`)

| Module | Does |
| --- | --- |
| `auth` | Sign-up, email verification, login with lockout, refresh-token rotation, password reset and change, admin login, CSRF |
| `account` | Saved addresses and wishlist |
| `products` | Product catalogue in the database, bulk Excel add/edit, change history, photos (local disk or S3-compatible storage such as Cloudflare R2) |
| `sap-import` | Upload of the SAP stock sheet (item code, stock, MRP, MOP); links SAP codes to shop products |
| `checkout` | Server-side pricing from SAP prices, stock reservation, cash on delivery, test-mode payment |
| `orders` | Customer orders; admin order workflow, emails, GST invoice, Excel export |
| `offers` | Offers set up in the admin |
| `careers` | Careers form |

### Website areas

- Public site, shop, product pages, investor relations (statutory filings in
  `src/investor-data.ts` and `public/investor/`)
- Customer account: profile, addresses, wishlist, orders, login and security
- Admin panel at `/admin` (separate sign-in): products, bulk upload, SAP
  import and matching, offers, orders, title formats

---

## 3. Releasing the unreleased work

`handover/shop-and-admin` adds **six database migrations** that are not yet
on the production database:

```
20261113090000_account_addresses_and_wishlist
20261113120000_checkout_orders
20261116070848_product_listings
20261116124003_listing_details
20261117130000_shop_offers
20261117160000_order_fulfilment
```

To release it:

1. Back up the production Postgres database on Railway.
2. Set the new environment variables on the Railway API service (section 4),
   especially the seller details for invoices and the photo storage settings.
3. Merge `handover/shop-and-admin` into `main`.
4. Run the migrations: `railway ssh -s logica-2-alt -e production`, then
   `npx prisma migrate deploy`.
5. Check the site. **Checkout stays switched off** until
   `CHECKOUT_ENABLED=true` is set. Leave `PAYMENT_MODE` unset or `off` in
   production: no real payment gateway is connected yet, and `test` is refused
   in production on purpose.

---

## 4. Configuration (names only)

### Website (Vercel)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend API |

### Backend (Railway, or `backend/.env` locally; template in `backend/.env.example`)

| Group | Variables |
| --- | --- |
| Server | `NODE_ENV`, `PORT`, `CORS_ORIGINS`, `FRONTEND_URL`, `COOKIE_DOMAIN`, `REFRESH_COOKIE_NAME` |
| Database and cache | `DATABASE_URL`, `REDIS_URL` |
| Login tokens | `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` (or the `_PATH` versions), `JWT_ACCESS_TOKEN_TTL`, `JWT_REFRESH_TOKEN_TTL_DAYS` |
| Password hashing | `ARGON2_MEMORY_COST`, `ARGON2_TIME_COST`, `ARGON2_PARALLELISM` |
| Email | `MAIL_PROVIDER`, `MAIL_FROM`, `RESEND_API_KEY` or `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`; `ORDER_ALERT_EMAILS` |
| Photos | `PHOTO_STORAGE`, `LOCAL_UPLOADS_URL`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` |
| Shop | `CHECKOUT_ENABLED`, `PAYMENT_MODE`, `COD_ENABLED`, `COD_MAX_RUPEES`, `SHIPPING_FEE_RUPEES` |
| Invoices | `SELLER_NAME`, `SELLER_GSTIN`, `SELLER_ADDRESS` |

JWT keys can be generated with `npm --prefix backend run keys:generate`. Replacing
them signs every user out once; nothing else changes.

---

## 5. Running it locally

```bash
npm install && npm run dev                     # website, http://localhost:5173
cd backend && npm install
docker compose up -d                           # Postgres + Redis
cp .env.example .env                           # then fill it in
npm run keys:generate
npx prisma migrate deploy
node scripts/create-admin.js                   # first admin account
npm run start:dev                              # API, http://localhost:4000
npm test                                       # backend tests
```

A sample SAP sheet is in `backend/samples/sap-sheet-template.xlsx` (also
downloadable from the admin panel).

---

## 6. Open items and decisions for the company

- **Payments:** no gateway is connected (only cash on delivery and a test
  mode). Choosing a provider (and saved cards through it) is the next step.
- **Delivery fee:** currently free (`SHIPPING_FEE_RUPEES=0`).
- **GST rates** per product category for invoices need confirming.
- **SAP codes:** production SAP codes still need linking to shop products in
  the admin panel. A rule for products that have more than one SAP code was
  deferred.
- **MRP in the stock sheet:** the store stock sheet has no MRP column, and
  the import requires one.
- Planned but not built: coupons, wallet, gift cards, reward coins,
  notification centre.
- `backend/README.md` describes only the first phase and should be updated.

---

## Credentials and access

Handed over **separately, by a secure channel, not by email or chat**.
Check each item off as the company confirms it has access:

- [ ] GitHub account `developeremaavyai365` (owner of this repository)
- [ ] Vercel project for the website
- [ ] Railway project `fulfilling-tenderness` (API, Postgres, Redis)
- [ ] Domain registrar and DNS for `logicainfoway.com`
- [ ] Email sending (Resend and/or SMTP mailbox)
- [ ] Photo storage (Cloudflare R2 bucket and its access keys), if set up
- [ ] Website admin accounts (`/admin`)
- [ ] Production JWT keys (or generate new ones; see section 4)
- [ ] Old WordPress host (still serves some filing PDFs under `/wp-content/uploads/`)

For each account, any personal recovery email or phone number should be
replaced with a company one, and the passwords changed after the handover.
The Railway database password should be rotated: it appeared in a screenshot
during development.
