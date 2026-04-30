# Next.js Supabase AI SaaS Starter

A production-oriented Next.js 14 starter for building AI SaaS products with Supabase, Stripe billing, email delivery, rate limiting, observability, and a prewired shadcn/ui + Tailwind UI foundation.

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript (strict mode)
- **Styling/UI**: Tailwind CSS, shadcn/ui, Radix UI primitives, Lucide icons
- **Data/Auth**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Payments**: Stripe
- **AI**: OpenAI
- **Email**: Resend
- **Validation/Forms**: Zod, React Hook Form, Hookform Resolvers
- **Rate limiting**: Upstash Redis + Upstash Ratelimit
- **Monitoring**: Sentry for Next.js

## Setup

1. **Clone**

```bash
git clone <your-repo-url>
cd nextjs-supabase-ai-saas-starter
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

```bash
cp .env.example .env.local
```

Fill all values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_BUSINESS`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SITE_URL`
- `SENTRY_DSN`

4. **Run locally**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Add your project keys and URL to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run the initial migration:
   - `supabase/migrations/00001_initial_schema.sql`
4. Generate TypeScript database types:

```bash
pnpm supabase:types
```

5. Replace `YOUR_PROJECT` in `package.json` script with your actual Supabase project ID before generating types.

## Folder Structure

```txt
.
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (marketing)/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── forms/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── config/
├── hooks/
├── lib/
│   ├── ai/
│   ├── email/
│   ├── ratelimit/
│   ├── stripe/
│   ├── supabase/
│   └── utils.ts
├── public/
├── supabase/
│   └── migrations/
├── types/
├── .env.example
└── components.json
```

## Notes

- The latest shadcn CLI deprecates the old `toast` generator in favor of `sonner`. A compatibility `components/ui/toast.tsx` export is included so either pattern can be used.
- Import alias is configured as `@/*` in `tsconfig.json`.

## Deployment Guide (Stub)

Deployment instructions will be added here later, including:

- Environment setup per platform
- Build and runtime configuration
- Secret management
- Stripe webhook setup
- Post-deploy verification checklist
