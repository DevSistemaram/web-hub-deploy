# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev        # Start dev server on port 3001
yarn build      # Production build
yarn start      # Run production build (port 3001)
```

No lint or test scripts are configured.

## Environment

Copy `.env.example` to `.env.local` and set:
```
NEXT_PUBLIC_API_URL=http://localhost:3000   # Backend API server
```

## Architecture

**Hub Portal** is a Next.js 15 (App Router) frontend for a marketplace integration service. It lets users connect their ERP to Brazilian marketplaces (Mercado Livre, Shopee) via OAuth, manage API tokens, and receive standardized order data.

This is a pure frontend — all business logic lives in the backend API pointed to by `NEXT_PUBLIC_API_URL`.

### API Layer (`src/lib/api.ts`)

Single centralized API client. All requests go to `${NEXT_PUBLIC_API_URL}/api{path}` and automatically inject the Bearer token. Organized into namespaces:
- `api.auth.*` — register, login
- `api.integrations.*` — list integrations, get OAuth URLs, handle callbacks
- `api.settings.*` — ERP token CRUD

The Next.js config (`next.config.ts`) also proxies `/api/*` requests to the backend, so server-side fetches work the same way.

### Auth (`src/lib/auth.ts`)

MVP implementation: token stored in `localStorage` as `hub_token`, user info as `hub_user`. The dashboard layout (`src/app/dashboard/layout.tsx`) does a client-side redirect to `/login` if unauthenticated. `middleware.ts` is currently a no-op placeholder — a future migration to httpOnly cookies + server-side validation is noted there.

### Route Structure

- `/` — Landing page
- `/(auth)/login`, `/(auth)/register` — Auth pages (route group, no layout wrapper)
- `/dashboard` — Protected section; layout handles auth guard + sidebar nav
- `/dashboard/integrations` — Marketplace connection cards; OAuth callbacks at `.../mercadolivre/callback` and `.../shopee/callback`
- `/dashboard/settings` — ERP API token generation and revocation

### Components

`src/components/auth/` — form components (LoginForm, RegisterForm)  
`src/components/dashboard/` — IntegrationCard (marketplace status/connect), ErpTokenCard (token display/revoke)

All components are `'use client'` with local React state; no global state manager.

### Styling

Tailwind CSS with a custom sky-blue brand palette defined in `tailwind.config.ts`. No component library — all UI built from scratch. Path alias `@/*` maps to `src/*`.

## OAuth Callback URLs

When testing locally, these must be registered in marketplace developer consoles:
- `http://localhost:3001/dashboard/integrations/mercadolivre/callback`
- `http://localhost:3001/dashboard/integrations/shopee/callback`
