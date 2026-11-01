# Nakshly — how it grows and how it pays for itself

## 1. The name

**Nakshly** comes from *naksha* (नक्शा), which means a map or plan in Hindi, Urdu, Gujarati, Marathi and Bengali. The *-ly* ending makes it sound global, the way Zerodha comes from *zero* and *rodha*. The word *naksha* runs through Indian property:

- Every state's cadastral map portal is called **Bhu-Naksha**.
- The government's urban land survey programme is called **NAKSHA**.
- Families ask an architect for the *ghar ka naksha*, the house plan.

So the name points to property without saying "property", the way 7/12 or AnyROR do. It is also map-first, like Zillow.

**Availability:** checked on 1 Nov 2026.

- nakshly.com, nakshly.in and nakshly.app were all unregistered (RDAP lookup).
- A web search found no company, app or trademark using the exact word.

**To do before launch:**

- Buy the .in and .com domains.
- File a trademark at IP India in classes 36 (real estate), 42 (software) and 35 (advertising). Individuals and startups pay a reduced fee.

Tagline: **"Every home in India, on one map. No brokerage."**

## 2. What we copy from Zillow, and what we change for India

| Zillow (US) | Nakshly (India) | Why it's different |
|---|---|---|
| Free consumer search and Zestimate bring the traffic | Free search, map and **Nakshly Estimate** | Same idea |
| Premier Agent: agents pay for leads (most of Zillow's revenue) | **Nakshly Pro**: agents pay for a locality slot, builders pay per verified lead | Indian buyers distrust brokers, so the agent product is opt-in and fee-transparent. Owner listings stay free. |
| Rentals: landlords pay listing fees | Owners list **free**; renters never pay brokerage | Brokerage on rentals is the pain we remove. Charging owners up front kills supply. |
| Zillow Home Loans | **Home loan referral**: free to the user, the lender pays us on disbursement | Banks and housing finance companies already pay referral partners (DSAs) |
| Closing and title services in the US | **Fixed-fee paperwork**: rent agreement, tenant verification, lawyer's title check, sale deed registration | This replaces the ₹1,500–3,000 "agreement charge" brokers add on, at a published price |
| Public records (county assessor data) | **Land records**: 7/12, 8-A, Khatauni, Patta, RTC, Jamabandi links and guides by state | India's records are split across state portals. Explaining them builds trust and brings search traffic. |

## 3. Who pays and who doesn't

Free forever: searching, the map, the Estimate, contacting owners, posting a listing, the renter profile, the land-records guides and the calculators.

| Revenue line | Who pays | Price in the app | When we get paid |
|---|---|---|---|
| Rent agreement | Tenant or owner | ₹499 + stamp duty at actuals | After delivery |
| Tenant verification | Owner | ₹299 | After filing |
| Lawyer's title check | Buyer | ₹2,999 | After the report |
| Sale deed and registration help | Buyer | ₹4,999 + government fees at actuals | After registration |
| Listing boost | Owner (optional) | ₹299 for 14 days | Up front |
| Nakshly Pro | Agent | ₹2,999/month per locality | Monthly |
| Builder leads | Builder | Per verified lead (price agreed per project) | Monthly invoice |
| Home loan referral | Lender | Referral commission, a share of the loan amount | On disbursement |

Prices live in `src/lib/services.ts`. Requests land in the admin panel under **Service requests (revenue)**.

**Payments:** until a payment gateway is connected (Razorpay is the standard choice in India), fees are collected after delivery by UPI. That builds trust early on: "pay only after the work is done."

**What sustains the app:** two lines can each cover hosting and a small team on their own, without ever charging owners or tenants a brokerage.

- **Home-loan referrals:** a few loans a month pays for the servers.
- **Builder leads:** builders already spend heavily on online leads.

Paperwork fees are frequent and small. They build the habit and the brand.

## 4. How it markets itself

Each loop is built into the product. None needs ad spend.

1. **The To-Let / For Sale board (offline loop).** After posting, owners get a printable A4 board with a QR code (`/property/[id]/board`). Indian homes hang "To-Let" boards on the gate, and each board advertises one home and Nakshly to everyone who walks past. The QR opens `/p/[id]?utm_source=board`, so we can count it.
2. **WhatsApp sharing.** Every listing has a one-tap WhatsApp button with a prefilled message ("direct from owner, no brokerage"). Every listing link shows a preview card with price, BHK and locality (`opengraph-image.tsx`). Families share homes on WhatsApp before they decide.
3. **Search traffic from land records.** People search for "7/12 online", "AnyROR", "Khatauni" and "Patta Chitta" every day. `/land-records/[state]` answers those searches and links to the official portal, so the visitor meets Nakshly while doing their due diligence. Each listing page also carries structured data and a "check the records" block for its state.
4. **Invite and earn.** Every user has a referral link (`/invite`). When two people they invite post a home, their next rent agreement or tenant verification is free. That reward costs us little and pulls in new listings.
5. **The Estimate pulls owners in.** Owners check what their home is worth, track it, and list on Nakshly when they're ready to sell or rent, like Zillow's Zestimate to listing path.
6. **The savings badge.** Owner listings show "you save ~₹X brokerage", which turns the main value of the product into a reason to share it.

**What to measure each week** (all tagged with `utm_source`): share of new users from `board`, `whatsapp` and referrals; owner listings per week; enquiries per listing; service requests per 100 closed rentals.

## 4b. Getting the first listings (cold start)

We don't scrape OLX or 99acres. Their terms forbid it, and the phone numbers in those ads belong to people who never agreed to be on Nakshly. Instead, every route makes it cheap for an owner to move their own ad over:

| Channel | What's in the product | Why it works |
|---|---|---|
| **Paste your ad** | Listing wizard step 1: paste the OLX, Facebook or WhatsApp ad and 10+ fields fill themselves (`src/lib/ad-parse.ts`) | Owners already wrote the ad, so moving it takes 2 minutes |
| **Housing societies** | `/societies`: RWA sign-up, a printable QR notice for the notice board, help-desk day | One secretary reaches 100–500 owners, and societies want brokers out and tenants verified |
| **Founding owners** | `/list-free`: brokerage-savings calculator, first 500 owners per city get a free tenant verification and a Featured badge | Costs ₹299 per owner and buys a real listing |
| **Founding agents** | `/pros`: Pro free for 3 months if they publish their fee and RERA number | Agents bring inventory and get leads; fee transparency keeps the brand promise |
| **Free rent agreements** | `/agreements`: both sides agree online in minutes, with the state's steps | Tenants who found a home elsewhere still come to Nakshly for the paperwork, and every agreement creates two accounts |
| **Agreement checker** | `/agreements/check`: 9 questions, or an AI review of a photo or PDF in any Indian language | Every tenant with a bad agreement is a future user and a story to share |
| **Offline loops** | QR To-Let boards, society notices | Every board and notice advertises Nakshly to passers-by |

Demo listings stay labelled **Demo** until a city has real supply. The home page says so.

## 5. Launch plan

A map-based marketplace only works when the map is full. The app covers all of India, but launch should go one city at a time:

1. **One city first** (Ahmedabad or Vadodara, where the founder can meet owners in person). Goal: 500 real owner listings across 10 localities.
   - Get them through housing societies: offer each society's secretary a free rent-agreement drive.
   - Put up To-Let boards and post in local WhatsApp groups.
2. **Turn on paperwork services** in that city with one partner lawyer and one stamp vendor.
3. **Add the second and third cities** once enquiries per listing are steady. Then sign up builders for leads in those cities.
4. **Home-loan partnerships** with two or three lenders once there is buyer traffic.

The demo data shows the product in 13 cities. **Remove it** (it is flagged `is_demo`) city by city as real listings arrive. Don't present demo listings as real ones.

## 6. Costs

| Item | Cost at launch |
|---|---|
| Hosting (Vercel Hobby, Neon free tier, Blob) | ₹0 to start. Upgrade to Vercel Pro (~$20/month) before taking commercial traffic, since the Hobby plan is for non-commercial use |
| Domains (.in + .com) | ~₹2,000/year |
| Trademark (3 classes) | A few thousand rupees per class at IP India's reduced rate |
| Google Play developer account | US$25, one-time |
| Map tiles | Free OpenStreetMap tiles are for light use. Move to a paid tile provider before heavy traffic |
| Phone OTP (SMS) | A small fee per SMS, needed to stop fake "owner" listings |

## 7. Risks and how the product handles them

- **Brokers posing as owners.** Planned: phone OTP, a limit on listings per phone number, a "report this listing" button and the survey-number field. Owners who give a survey/CTS number can be checked against the state portal.
- **Legal.** Get a lawyer's opinion on:
  - Whether charging agents for leads requires RERA registration as an intermediary in the launch state.
  - Compliance with the Digital Personal Data Protection Act, 2023.
  - The terms of the paperwork services.
- **Accuracy of land-record links.** Portals get renamed (for example Dharani → Bhu Bharati). Every guide says to confirm the site is on .gov.in or .nic.in, and the links live in one file (`src/lib/land-records.ts`).
- **Play Store.** New personal developer accounts must run a closed test (currently 12 testers for 14 days) before they can publish to production. Start that clock as soon as the account exists.
