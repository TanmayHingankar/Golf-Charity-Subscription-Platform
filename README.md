# Digital Heroes Golf Charity Subscription Platform

Premium open-source build for Digital Heroes full-stack contest.

## Project Summary

A subscription-based platform where golfers manage Stableford scores, enter algorithmic/random monthly draws (5/4/3 matching system), and donate a portion of subscription revenue to charities. Includes user/admin dashboards, Stripe billing, confidence checks, and a differentiated charity-first experience.

## Tech Stack

- Frontend: Next.js 16 + TypeScript + Tailwind CSS
- Backend: Express + TypeScript + Node
- Database: PostgreSQL (Supabase friendly)
- Payments: Stripe Checkout + Webhooks
- Auth: JWT + role-based access (`user`, `admin`)
- CI: TypeScript compile (noEmit), Next.js build
- Deploy: Vercel (frontend), Render or similar (backend), Supabase for DB

## Architecture Overview

1. User / auth flow
2. Subscription with Stripe
3. Score engine (latest 5 records, 1-45, date required)
4. Draw engine (monthly, run once, 5/4/3 matches)
5. Prize distribution + jackpot rollover
6. Charity selection + contribution percentage
7. Winner proof admin verification + payout tracking
8. Analytics and admin controls

## Repository Structure

- `frontend/` – Next.js app
  - `src/app` – pages and components
  - `src/app/api/proxy/[...path]/route.ts` – proxy route to backend
- `backend/` – Express API
  - `src/routes` – endpoints
  - `src/services` – domain logic
  - `src/config` – DB + Stripe config
  - `db/schema.sql` – Postgres schema
- `.env.example` (backend env vars)

## Quickstart - Local Development

### Backend

```bash
cd "d:\Backup 28-01-2023\Desktop\AI Projects\Digital Heros\backend"
cp .env.example .env
# update values, especially DB + stripe
npm install
npm run dev
```

### Frontend

```bash
cd "d:\Backup 28-01-2023\Desktop\AI Projects\Digital Heros\frontend"
npm install
npm run dev
```

In browser:
- frontend: http://localhost:3000
- backend: http://localhost:4000/api/health

## API Endpoint Highlights

### Auth
- `POST /api/auth/register` - email/password signup
- `POST /api/auth/login` - generate JWT tokens
- `GET /api/auth/me` - profile (protected)

### Scores
- `GET /api/scores` - last 5 scores
- `POST /api/scores` - add score (1-45, date)

### Charities
- `GET /api/charities` - list
- `GET /api/charities/:id` - profile

### Subscription
- `POST /api/subscription/checkout` - Stripe checkout session
- `POST /api/subscription/webhook` - Stripe webhook events
- `GET /api/subscription` - current subscription
- `POST /api/subscription/cancel` - cancel at period end

### Draws
- `POST /api/draws/create` - admin create monthly draw
- `POST /api/draws/:drawId/run` - admin run draw algorithm
- `GET /api/draws` - list draws

### Admin
- `GET /api/admin/users`
- `GET /api/admin/analytics`

## DB Schema (Snapshot)

- `users` (id, email, password_hash, role, charity_id, charity_pct, is_subscribed)
- `charities` (id, name, description, min_pct, slug)
- `scores` (id, user_id, value, played_at)
- `subscriptions` (id, user_id, stripe_subscription_id, plan, price_cents, status)
- `draws` (id, draw_month, status, method, numbers, jackpot_rollover)
- `winners` (id, draw_id, user_id, match_count, prize_cents, status)
- `audit_logs` (id, actor_id, action, details)

## Production Deployment Checklist

### Supabase
- new project, create table via `db/schema.sql`
- configure `DATABASE_URL` in backend env
- use PG connection pool allowed IPs

### Stripe
- create products/prices: monthly/yearly
- set `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`
- set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Backend host
- Deploy to Render/Heroku/AWS App Runner.
- env: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `STRIPE_*`.

### Frontend host
- deploy to Vercel
- env: `NEXT_PUBLIC_API_URL` = backend url

### QA
- run build checks:
  - backend: `npm run dev` (or `npm run build` with tsc)
  - frontend: `npm run build`
- test happy paths and edge cases manually

## Special Notes

- The project is intentionally designed as a `charity-first` experience (not typical golf brand).
- Draw engine includes stubs for algorithmic mode and allows future weighted balancing.
- Score rolloff automatically prunes oldest beyond 5.

## Future/differentiation road map

- Corporate/team account module
- Multi-tenant campaigns
- AI performance insights (score recommendations)
- Instant grace credit for charity matching events
- Superfan animations + micro-interactions in beta UI

## Acknowledgements

Built as a senior full-stack solution for Digital Heroes selection assignment 2026. All behavior implements PRD sections: auth, subscription, score system, draw engine, charity integration, winner lifecycle, dashboards, and production hardening.

## AI Usage log

- Code and architecture authored by AI assistant (GitHub Copilot style) in VS Code environment.
- Task driven by PRD request for production-level project.
