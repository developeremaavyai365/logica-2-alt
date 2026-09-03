# Logica Infoway

Website for Logica Infoway Limited (BSE: 543746) — storefront, product
catalogue, and the investor-relations section that carries the company's
statutory filings.

Vite + React + TypeScript + Tailwind, deployed on Vercel. A NestJS backend
lives in [`backend/`](backend/README.md) and has its own README.

---

## Running it

```bash
npm install
cp .env.example .env.local     # then set VITE_API_URL
npm run dev                    # http://localhost:5173
```

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | `tsc -b && vite build` — type-check then bundle |
| `npm run preview` | Serve the production build locally |

The frontend runs standalone. You only need `backend/` for auth and anything
that talks to the API; follow its README separately.

**The clone is large** (~860 MB of history, mostly filings and video). If you
don't need the history:

```bash
git clone --depth 1 https://github.com/developeremaavyai365/logica-2-alt.git
```

---

## Layout

```
src/
  pages/            One file per route. pages/investor/ and pages/about/ are the
                    two multi-page areas.
  components/       Shared UI. Homepage sections are components, composed in
                    pages/Home.tsx — that file is the running order of the page.
  *-data.ts         Content, as typed data rather than a CMS. See below.
  chatbot/          Q&A knowledge base for the on-site chat widget.
backend/            NestJS + Postgres + Redis + Prisma. Separate README.
public/investor/    353 filing PDFs served from the site itself.
vercel.json         Redirects preserving URLs from the previous WordPress site.
                    Don't delete these — external links and filings point at them.
```

There is **no CMS**. All content is committed data: products in
`products-data.ts` (214 entries), filings in `investor-data.ts` (~400), company
facts in `data.ts` and `about-data.ts`. Editing content means editing a `.ts`
file and deploying.

---

## The investor section

This is the part most likely to bite you. It is regulatory content: these are
the company's statutory filings, and a document that goes missing or lands in
the wrong year is a real problem, not a cosmetic one.

**`investor-data.ts`** holds arrays of `{ title, year, url }`.
**`investor-sections.ts`** maps those arrays onto pages and onto the tab
navigation. **`pages/investor/InvestorSection.tsx`** renders any of them.

### Adding a filing

1. Put the PDF in `public/investor/<section>/`, **or** use the
   `https://www.logicainfoway.com/wp-content/uploads/…` URL if it is already on
   the WordPress host. Both patterns are in use and both are fine — the local
   one ships with the build, the WordPress one can be swapped without a deploy.
2. Add an entry to the right array in `investor-data.ts`.
3. Put the date in the **title** (`"Outcome of Board Meeting — September 1, 2026"`).
   Sorting reads it from there.

### Two rules that are not obvious

**Sorting is automatic — don't hand-order the arrays.** `InvestorSection.tsx`
parses a date out of each title and sorts newest-first on render. Array order
is irrelevant.

**The `year` field is the source of truth for which financial year a document
belongs to. Never re-derive it from the date in the title.** They disagree on
17 documents, and the `year` field is usually the correct one. For example:

> `"Financial Results for Half Year FY Ended March 31 2025"` carries
> `year: "2025-26"` — because that is when it was *filed*. The March 2025 in
> the title is the period it *reports on*.

Bucketing by title date would silently move those filings into the wrong
folder. The year filter (`fyBucket`) reads the `year` field only.

**Other things worth knowing:**

- Years are folded by leading digits, so `"2024"`, `"2024-25"` and `"2025"`
  don't fragment one financial year into three near-duplicate buckets.
- Eight documents carry no year at all. They are reachable under "All years",
  which is why "All years" is the default rather than the newest year.
- **Policies are deliberately not year-filtered** — the company asked for those
  on a single page. `NO_YEAR_FILTER` in `InvestorSection.tsx`.
- Four investor pages are not document lists (Advertisement, Basis of Allotment,
  Authorized Person, Grievance Redressal). They are carried explicitly in
  `INVESTOR_TABS`; building the nav from `INVESTOR_SECTIONS` alone would strand
  them with no route in.

---

## Scroll and reveal effects

Several sections animate on scroll. Two shared pieces:

- **`use-in-view.ts`** — IntersectionObserver wrapper, re-firing on entry and
  exit so reveals replay.
- **`components/RevealText.tsx`** — text that darkens word by word as it is
  scrolled through. Used by the Who We Are statement and the Logica Infoway
  captions.

**Anything gated behind an observer must have a fallback timer.** `useInView`
carries `REVEAL_FALLBACK`, which reveals the content regardless after 2.5s. If
the observer never fires — an old browser, an embedded webview, a broken
preview pane — the worst case is a section that appears without animating,
rather than a section nobody ever sees. Don't remove it.

The same reasoning applies to `RevealText`: unfilled words sit at 45% ink, not
transparent, so every line is readable before the reveal reaches it.

---

## Deployment

Vercel builds and deploys **automatically on every push to `main`**. There is no
manual deploy step, and no `.vercel` link in the repo — don't run `vercel` from
the CLI expecting it to hit this project.

Anyone with push access can therefore ship to production. If that isn't wanted,
give collaborators `pull` access and work through pull requests.

Two things that look like failures but aren't:

- The homepage bundle is ~915 KB (241 KB gzipped). Vite warns about it on every
  build. Nothing is broken; it is a code-splitting opportunity, not an error.
- The site is an SPA, so a stale cached `index.html` can reference a hashed
  bundle that no longer exists and 404. If a deploy looks like it hasn't landed,
  hard-refresh before investigating.

---

## Open items

Things a new developer should know are unfinished rather than discover the hard
way:

- **Checkout is not connected to a payment provider.** `Cart.tsx` shows a notice
  saying so. Razorpay is the intended gateway and is named in the UI, but no
  integration exists.
- **19 chatbot answers still contain `[NEEDS CONFIRMATION: …]` placeholders**,
  and they render to visitors verbatim — covering delivery times, serviceable
  cities, returns, refunds and damaged goods. Search
  `src/chatbot/knowledge-base.json` for the marker. These need answers from the
  company, not invention.
- **`about-data.ts` says 52 retail stores; the homepage stats say 82+.** Nothing
  renders `OVERVIEW_SCALE` today so it is not a live contradiction, but it will
  be the moment something does.
- Two board-meeting outcomes (16.06.2023, 13.12.2023) were chased and are not
  recoverable from public filings; the 16.06.2023 meeting's agenda was routine
  banking business that triggered no Regulation 30 disclosure.

---

## House rules

- `npm run build` must pass before pushing — it type-checks as well as bundles.
- Don't commit `.env.local`, `backend/keys/*.pem`, or anything under
  `node_modules`/`dist`. All are gitignored; keep it that way.
- Content claims on the investor pages and the chatbot are read by investors and
  customers. If a fact isn't in the data or a filed document, don't write it.
