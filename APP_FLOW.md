# UniSpend — App Flow & Marketing Brief

> A single reference you can use to (a) explain the app, (b) build a marketing campaign, and (c) generate a pitch deck / PPT.

---

## 1. One-liner

**UniSpend is an AI-powered money app for young India — connect your bank, see where every rupee goes, chat with a financial co-pilot, and grow your wealth, all in one place.**

Alt taglines:
- "Your money, finally on autopilot."
- "Spend smart. Save smarter. Powered by AI."
- "From paycheck to portfolio — one app."

---

## 2. The Problem

- Young Indians juggle **multiple bank accounts, UPI apps, cards, and subscriptions** with no single view.
- Budgeting apps are **manual, boring, and generic** — people stop using them in a week.
- Financial advice is **locked behind advisors** or buried in jargon.
- People *want* to invest and save but **don't know how much they can safely spare**.

## 3. The Solution

UniSpend ties it together with **automatic bank sync + an AI layer** that turns raw transactions into plain-English guidance:

- Auto-aggregates accounts and **categorizes every transaction**.
- Computes a **Financial Health Score** and **spending personality**.
- A **conversational AI co-pilot** answers any money question using *your real data*.
- Surfaces **savings, investing, rewards, and subscription** opportunities automatically.

---

## 4. Target Audience

| Persona | Who | Pain | Hook |
|---|---|---|---|
| **The Student** | College / first job, ₹ in thousands | "Where did my money go?" | Effortless tracking + nudges |
| **The Young Pro** | 22–30, salaried | Wants to save/invest but unsure how much | Health score + "can I afford X?" |
| **The Optimizer** | Already budgets manually | Tired of spreadsheets | AI does it automatically |

Primary market: **Gen-Z & millennial India** (₹, lakhs/crores, SIPs, tax-saving context built in).

---

## 5. Core Value Props (benefit-led)

- **One screen for everything** — balances, spending, investments, rewards, subscriptions.
- **AI that knows *your* numbers** — not generic tips; answers grounded in your transactions.
- **Know your number** — a 0–100 Financial Health Score you can actually move.
- **"Can I afford it?"** — instant, data-backed yes/no on any purchase or goal.
- **Bank-grade security** — read-only bank links via Plaid; credentials never stored.

---

## 6. The App Flow (user journey)

A new user moves through the app like this:

**1. Onboarding (Splash)**
- 3 swipeable slides: *Connect securely → Smart AI tracking → Grow your wealth*.
- Sets the promise before sign-up.

**2. Sign Up / Log In (Auth)**
- Email + password (Firebase auth); Google sign-in option.
- Fast, frictionless entry.

**3. Connect Your Bank (Connect Bank)**
- Secure bank link via **Plaid** ("Secured by Plaid", 256-bit encryption messaging).
- Pick a bank or search; OAuth handled in-flow. Option to *Skip for now*.

**4. Home / Dashboard** — the daily hub
- **Total Balance** across all linked accounts + live **Health Score** badge.
- **KPI grid**: Spent (this month), Saved, Balance, Available to spend.
- **Spending Trend**: 7-day bar chart with daily average.
- **Top Categories**: where money goes, with progress bars.
- **AI Insights**: auto-generated, personalized observations.
- **Recent Transactions**: clean, categorized feed.

**5. AI Co-pilot** — the differentiator
- Chat with an AI that has your real financial context.
- Ask anything: *"Can I afford an iPhone next month?"*, *"Where is my money going?"*, *"How much to save for a ₹1Cr flat?"*, *"Explain SIPs."*
- Quick-action chips for one-tap questions; always-on local fallback so it never dies.

**6. Spending** — deep dive
- Month-by-month spending, category breakdown, trend vs last month, AI suggestions to cut waste.

**7. Invest** — grow wealth
- Portfolio value, holdings, day & total P&L, buying power, market movers; place trades (paper/Alpaca).

**8. Rewards** — stay engaged
- Cashback and **tiered rewards** (Bronze → Silver → Gold → Platinum); redeem perks.

**9. Subscriptions** — stop the leaks
- Detects recurring + **"forgotten" subscriptions** quietly draining money.

**10. Profile** — control center
- Profile, risk score, AI health & spender type, connected accounts, settings.

> **Flow in one line:** Onboard → Sign up → Connect bank → Dashboard → (Co-pilot · Spending · Invest · Rewards · Subscriptions) → Profile.

---

## 7. The AI Layer (lead with this)

Two complementary AI systems:

1. **AI Insights engine** — analyzes your transactions to produce:
   - Financial Health Score (0–100), spending trend, **risk score**, **spender type** (Smart Saver / Balanced / Heavy Spender), category distribution, cashflow, runway, and personalized suggestions.
2. **AI Co-pilot (Groq · Llama-3.3-70B)** — a fast, conversational assistant that answers any money question using the above context in plain English (₹, lakhs/crores), with goal math and "afford-it" calculations.

**Why it matters:** most apps *show* data. UniSpend *interprets* it and tells you what to do.

---

## 8. How It Works (tech credibility for judges)

- **Frontend:** React Native (Android), single dark "Obsidian Emerald" design system.
- **Backend:** Node.js **microservices** (API gateway + auth, plaid, investment, subscription, notification, user) on **Docker**, with **PostgreSQL** + **Redis**.
- **Integrations:** **Plaid** (bank aggregation), **Alpaca** (investing), **Groq** (AI co-pilot), **Firebase** (auth), AI analysis service for insights.
- **Architecture story:** secure, modular, scalable — each capability is an independent service behind one gateway.

---

## 9. Differentiators

- **Context-aware AI**, not generic chatbots — every answer uses your real data.
- **All-in-one**: tracking + investing + rewards + subscriptions, not just budgeting.
- **Built for India** (₹, SIPs, tax framing) — not a US app retrofitted.
- **Actionable, not just analytical** — a score you can move and an assistant that tells you how.

---

## 10. Marketing Campaign Kit

**Positioning statement**
> For young Indians who feel out of control with money, UniSpend is the AI money app that turns every transaction into clear, personal guidance — so you spend smart, save more, and start investing without the jargon.

**Campaign themes / angles**
- *"Where did my money go?"* — relatable pain → instant clarity.
- *"Ask your money anything."* — showcase the co-pilot.
- *"What's your money score?"* — the Health Score as a shareable hook.
- *"Cancel the subscriptions you forgot."* — quick, viral savings moment.

**Content ideas**
- Short reels: a real "Can I afford this?" question answered live by the co-pilot.
- Carousel: "5 subscriptions silently draining your salary."
- Health-Score challenge: users share/improve their score (gamified, UGC-friendly).
- Before/after: messy spreadsheet → UniSpend dashboard.

**Channels**: Instagram Reels + carousels, YouTube Shorts, campus ambassadors, finance creators (collabs), Reddit (r/IndiaInvestments, r/personalfinanceindia).

**Suggested CTAs**: "Get your free Health Score", "Ask the co-pilot a money question", "See where your money really goes."

---

## 11. Pitch Deck / PPT Outline (slide-by-slide)

1. **Title** — UniSpend logo + one-liner + tagline.
2. **Problem** — fragmented money, manual budgeting, no guidance (use the §2 bullets).
3. **Solution** — one app: sync + AI guidance (§3).
4. **Product demo / flow** — the screen journey (§6), screenshots of Dashboard + Co-pilot.
5. **The AI advantage** — Insights engine + Co-pilot, "interprets not just shows" (§7).
6. **Market** — Gen-Z/millennial India, personas, TAM (§4).
7. **Why we win** — differentiators (§9).
8. **Tech & architecture** — microservices + integrations diagram (§8).
9. **Traction / roadmap** — what's built, what's next (see below).
10. **Business model** — freemium, premium AI, affiliate (investing/cards), rewards partnerships.
11. **Ask / close** — what you want (users, funding, partners) + tagline.

---

## 12. Demo Script (60–90s)

1. Open app → onboarding promise.
2. Connect a bank (Plaid sandbox) → dashboard fills with real data.
3. Show **Health Score** + spending trend + top categories.
4. Open **Co-pilot** → ask *"Can I afford an iPhone next month?"* → instant data-backed answer.
5. Flash **Rewards** + **Subscriptions** (the "forgotten subscription" moment).
6. Close on tagline.

---

## 13. Roadmap (talking points)

- **Now:** bank sync, AI insights + co-pilot, spending, investing (paper), rewards, subscriptions.
- **Next:** real brokerage, UPI insights, bill reminders, shared/family accounts, push nudges, web app.
- **Later:** credit-building, goal automation, marketplace of financial products.

---

*Generated as a living brief — update as features ship.*
