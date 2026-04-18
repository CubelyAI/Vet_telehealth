# VetConnect — Vet Telehealth Platform

A production-ready veterinary telehealth booking platform built with Next.js 14 App Router, Supabase, Stripe, and Resend.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript strict) |
| Styling | Tailwind CSS + shadcn/ui (new-york, zinc) |
| ORM | Prisma 5.x |
| Database + Auth | Supabase (Postgres + Auth) |
| Payments | Stripe Checkout |
| Email | Resend (React Email) |

---

## Prerequisites

- **Node.js 20+** — [download](https://nodejs.org)
- **Supabase CLI** — `npm install -g supabase`
- **Stripe CLI** — [install guide](https://stripe.com/docs/stripe-cli)

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd vet-telehealth
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value. See the inline comments in `.env.example` for where to find each key.

### 3. Supabase project setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Copy the project URL and anon key from **Settings → API** into `.env.local`.
3. Copy both connection strings from **Settings → Database → Connection string**:
   - **Transaction mode** (port 6543) → `DATABASE_URL`
   - **Direct** (port 5432) → `DIRECT_URL`
4. Copy the service role key from **Settings → API** into `SUPABASE_SERVICE_ROLE_KEY`.

### 4. Run database migration

Prisma uses `DIRECT_URL` for migrations (bypasses the connection pooler):

```bash
npx prisma migrate dev --name init
```

This creates all tables defined in `prisma/schema.prisma`.

### 5. Apply Row Level Security policies

```bash
psql "$DIRECT_URL" -f supabase/policies.sql
```

Or paste the contents of `supabase/policies.sql` into the Supabase SQL editor.

### 6. Seed a vet account

Create a vet user via **Supabase Dashboard → Authentication → Users → Invite user**, then insert a matching row into the `vets` table:

```sql
INSERT INTO vets (id, name, email, ahpra_number)
VALUES (
  '<supabase-auth-uid>',
  'Dr Jane Smith',
  'jane@vetconnect.com',
  'VET0001234'
);
```

### 7. Set up Stripe webhook (local development)

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET`.

### 8. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  (booking)/
    book/               ← Multi-step customer booking flow (Steps 1-5)
    confirmation/[token]/ ← Post-payment confirmation page
  (dashboard)/
    dashboard/          ← Protected vet dashboard
      appointments/     ← All appointments + detail view
      availability/     ← Manage availability slots
  (auth)/
    login/              ← Vet-only login
  api/
    availability/       ← GET public availability slots
    booking/            ← POST create booking + Stripe session
    stripe/webhook/     ← Stripe webhook handler
    dashboard/          ← Protected vet API routes

lib/                    ← Singletons: prisma, supabase, stripe, resend
components/
  ui/                   ← shadcn/ui components
  booking/              ← Multi-step form components
  dashboard/            ← Vet dashboard components
prisma/
  schema.prisma         ← Database schema
supabase/
  policies.sql          ← RLS policies (apply after migration)
emails/
  confirmation.tsx      ← Resend React Email template
```

---

## Authentication Model

| User Type | Auth Method |
|---|---|
| **Vets** | Supabase Auth (email + password). Dashboard routes are server-side protected via `createServerComponentClient` and `middleware.ts`. |
| **Customers** | **No account / no login.** Identified solely by a `booking_token` (UUID v4) embedded in their confirmation URL and stored on their `Appointment` row. |

---

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Supabase connection (Prisma runtime queries) |
| `DIRECT_URL` | Non-pooled Supabase connection (Prisma migrations) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side writes that bypass RLS (webhook handler) |
| `STRIPE_WEBHOOK_SECRET` | Verify Stripe webhook signatures |
| `NEXT_PUBLIC_APP_URL` | Base URL for confirmation email links |

---

## Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npx prisma studio    # Visual database browser
npx prisma migrate dev --name <name>  # Create + apply a new migration
```

---

## Deployment

1. Deploy to Vercel (recommended) or any Node.js host.
2. Add all environment variables from `.env.example` to your hosting provider.
3. Register a production Stripe webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`.
4. Update `NEXT_PUBLIC_APP_URL` to your production URL.
5. Verify your sending domain in the Resend dashboard and update `RESEND_FROM_EMAIL`.
