# Tinker Carpentry

Storefront and admin portal for a handmade carpentry business — one Next.js app serving both the public store and the maker's private management portal, backed by a single Supabase project. Stripe handles payment, so the app never touches card data.

Full build plan, decisions, data model, and phased task breakdown live in [project-plan.html](./project-plan.html).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Supabase Postgres (Row Level Security) |
| Auth | Supabase Auth |
| Media | Supabase Storage + `next/image` |
| Payments | Stripe Checkout + Stripe Tax |
| Email | Resend |
| Hosting | Vercel |

## Getting started

```bash
npm install
npm run dev
```

Requires a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

Open [http://localhost:3000](http://localhost:3000).

## Status

Phase 0 (foundation & environments) — see the [build sequence](./project-plan.html#phases) for progress.
