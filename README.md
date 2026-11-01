# Nakshly

**Homes for sale and rent across India — on a map, with real price history and an estimate on every home.**

Nakshly is a full-stack real estate marketplace for India. It covers buying, selling, renting, valuation, home loans, agents, new projects and landlord tools, adapted for how Indian property actually works: ₹ lakh/crore, BHK, carpet vs super built-up area, RERA registration, stamp duty by state, security deposits measured in months, owner listings with no brokerage, and agents who publish their fees.

> **Status:** working MVP with demo data. Everything labelled **Demo** (listings, transactions, agents, projects) is generated sample data with fictional names.

## Features

| Area | What's there |
| --- | --- |
| **Search** | Split map/list search for buy, rent and recently sold; price pins that collapse to dots when crowded; *search as I move the map*; filters for price, BHK, baths, home type, furnishing, possession, listed-by (owner/agent/builder), carpet area, tenant type, verified only; sort; pagination; save search; mobile map/list toggle |
| **Home page** | Photo gallery + full-screen viewer, Nakshly Estimate with range, confidence and the comparables used, price & listing history, locality price trend, EMI + stamp duty + registration + GST cost calculator (sale) or move-in cost (rent), neighbourhood map, nearby registered sales, similar homes, save/share, request a tour (date + in-person/video), contact, one-tap rental application |
| **Nakshly Estimate** | Comparable-sales model (`src/lib/estimate.ts`): normalises comps for size, floor, age, furnishing, Vastu facing, parking and type; fits local growth; weighted median by distance/recency/locality/BHK; range widens with dispersion |
| **Sell** | Free home value tool, track your home's value over time, 6-step listing wizard (map pin, photo upload, live price suggestion), drafts, edit, price changes recorded in public history, mark sold/rented, pause, delete |
| **Rent** | Universal renter profile, apply to any rental, landlord applications inbox (shortlist/accept/decline), leases with escalation, month-by-month rent ledger with overdue flags |
| **Agents** | Directory and profiles with RERA agent number, published buy/sell and rental fees, deals, languages, localities, reviews (signed-in users, one each), contact |
| **New projects** | Builder projects with RERA ID, configurations, possession date, price range, units for sale, enquiry form |
| **Money** | EMI calculator with amortisation schedule, affordability (FOIR + RBI loan-to-value caps), stamp duty by state with women's concessions, rent vs buy, indicative lender rates, loan advisor callback |
| **Market trends** | City table (₹/sq ft, YoY, rent, gross yield) and city pages with monthly trends and locality comparisons |
| **Accounts** | Email/password auth (scrypt, hashed session tokens), saved homes and searches, inbox with two-way threads for owners, agents and buyers |
| **Admin** | Verify/unverify listings and agents, take down listings, loan leads, platform stats |
| **SEO** | Clean URLs (`/buy/bengaluru`, `/property/123-3-bhk-apartment-powai-mumbai`), per-page metadata, JSON-LD, sitemap, robots |

30 cities across 20 states/UTs are open for listings; 13 cities ship with demo market data.

## Tech

- **Next.js 16** (App Router, Server Components, Server Actions, Cache Components/PPR), **React 19**, **TypeScript**, **Tailwind CSS 4**
- **Postgres** — [Neon](https://neon.tech) (or any Postgres) in production via `@neondatabase/serverless`; embedded **PGlite** locally with zero setup
- **Leaflet** + OpenStreetMap tiles (configurable provider)
- **Zod** validation, **Vitest** unit tests, GitHub Actions CI
- Photo storage: **Vercel Blob** if configured, local disk otherwise

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. On first request an embedded database is created in `./.data` and seeded with ~1,700 listings, ~7,300 transactions, 104 agents and 39 projects (takes under a second).

Demo accounts (local defaults, change via `.env.local`):

| Email | Password | Role |
| --- | --- | --- |
| admin@nakshly.dev | nakshly-admin | Admin (`/admin`) |
| demo@nakshly.dev | nakshly-demo | Buyer/renter |
| agent@nakshly.dev | nakshly-demo | Agent (owns the first Mumbai agent profile) |

Reset local data: stop the server and delete `./.data`.

## Scripts

| Command | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit tests (formatting, finance, estimate model, search params) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:setup` | Create tables in `DATABASE_URL` |
| `npm run db:demo` | Create tables and load demo data (skips if listings exist) |

## Deploy (Vercel + Neon)

1. Create a Postgres database (e.g. Neon) and copy its connection string.
2. Locally: `DATABASE_URL=... SEED_ADMIN_PASSWORD=... SEED_DEMO_PASSWORD=... npm run db:demo` (or `db:setup` for an empty site).
3. Import the repo in Vercel and set env vars from `.env.example`: `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, a production map tile provider, and `BLOB_READ_WRITE_TOKEN` for photo uploads (local disk is not persistent on serverless).
4. Deploy.

## Project layout

```
src/app/            routes (buy|rent|sold/[[...city]], property/[slug], home-value, post-property, agents, new-projects,
                    home-loans, calculators, research, landlords, inbox, saved, my-listings, admin, api/*)
src/components/     UI (search/, property/, listing/, agents/, calculators, header, footer…)
src/lib/geo.ts      cities, localities and demo market levels
src/lib/estimate.ts valuation model
src/lib/finance.ts  EMI, affordability, RBI LTV caps, stamp duty table
src/lib/db/         schema + Neon/PGlite drivers
src/lib/queries/    read queries      src/lib/actions/   server actions (mutations)
src/lib/seed/       deterministic demo data generator
tests/              Vitest unit tests
```

## Before a public launch

- Replace demo data with real sources: owner/agent listings, registered-transaction data (state registration portals), and projects verified against state RERA portals.
- Add phone OTP login and ownership verification (property tax receipt / sale deed upload) before marking listings verified.
- Use a commercial map tile provider; the OSM public server is not for production traffic.
- Have counsel review Terms and Privacy (DPDP Act 2023), and confirm stamp-duty figures, which are indicative.
- Add rate limiting on auth and enquiry endpoints, email notifications for new leads and saved-search matches, and image resizing.
- Run a trademark search on the name.
