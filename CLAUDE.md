# BeSafe - Project Guide

## Project Overview

BeSafe is a PWA for automatic safe arrival notifications. Users set routes (Home -> Office), and the app auto-detects departure/arrival via geofencing, sending SMS to emergency contacts.

## Working Directory

All npm commands (`npm run dev`, `npm run build`, `npm run lint`) must be run from the `web-app/` directory.

## Tech Stack

- **Framework**: Next.js 16, App Router, React 19, TypeScript strict
- **Styling**: Tailwind CSS with Material You (Material Design 3) design tokens
- **UI**: shadcn/ui components customized with M3 styling
- **Animations**: Framer Motion with Material easing `cubic-bezier(0.2, 0, 0, 1)`
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Maps**: Mapbox GL JS via react-map-gl
- **SMS**: Plivo API via Next.js API routes
- **State**: Zustand (client state) + TanStack Query (server state)
- **Validation**: Zod schemas
- **Icons**: Lucide React

## Design System - Material You

### Colors
- Primary: `#6750A4` (Purple)
- Secondary container: `#E8DEF8` (Lavender)
- Surface: `#FFFBFE` (Warm off-white)
- Tertiary: `#7D5260` (Mauve, for alerts)
- All tokens defined in `tailwind.config.ts`

### UI Patterns
- Pill-shaped buttons (`rounded-full`)
- Cards with `rounded-3xl`
- Inputs with `rounded-2xl`
- Large border radii (24-48px) on containers
- Tonal surfaces (not harsh shadows)
- `active:scale-95` on all buttons
- Minimum 44x44px touch targets
- 300ms transitions with material easing

### Framer Motion
- Shared variants in `lib/motion.ts`
- Use `staggerContainer` + `staggerItem` for list animations
- Use `cardHover` for hover lift effects
- Always respect `prefers-reduced-motion`

## File Conventions

### Directory Structure
- `app/` — Pages and API routes (App Router)
- `app/(dashboard)/` — Route group for authenticated pages
- `components/ui/` — shadcn/ui primitives (M3 customized)
- `components/landing/` — Landing page sections
- `components/map/` — Mapbox components
- `components/journey/` — Journey tracking UI
- `components/contacts/` — Contact management UI
- `lib/supabase/` — Supabase client/server setup
- `lib/stores/` — Zustand stores
- `lib/geo/` — Geofencing logic
- `lib/services/` — External API wrappers (Plivo)
- `lib/validations/` — Zod schemas
- `hooks/` — Custom React hooks
- `types/` — TypeScript types

### Naming
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `use-feature-name.ts` → `useFeatureName()`
- Stores: `feature-store.ts`
- Validations: `feature.ts` with `featureSchema`

## Database Tables

- `profiles` — User profiles (extends auth.users)
- `routes` — User-defined routes with geofence data
- `contacts` — Emergency contacts (E.164 phone format)
- `route_contacts` — Many-to-many route-contact mapping
- `journeys` — Journey sessions with status tracking
- `notifications_log` — SMS delivery log

## Key Architecture Decisions

1. **No Prisma** — Use Supabase JS client directly
2. **API routes for SMS** — Not Supabase Edge Functions (simpler deployment)
3. **Service worker is hand-written** — Full control over geofencing + caching
4. **shadcn/ui as base, M3 styling on top** — Accessibility + custom visuals
5. **Route group `(dashboard)`** — Shared layout without affecting URLs

## Commands

```bash
cd web-app
npm run dev    # Start development server (localhost:3000)
npm run build  # Build for production
npm run lint   # Run ESLint
```

## Testing

No automated test suite yet. Manual testing via `npm run dev` on `localhost:3000`. Full end-to-end testing requires real Supabase, Mapbox, and Plivo credentials configured in `.env.local`. Without credentials, the app still renders UI but data operations will no-op.

## What NOT to Do

- **Don't modify `components/ui/` directly** — These are shadcn/ui primitives with M3 customizations. Use them as-is or wrap them.
- **Don't use Prisma** — Supabase JS client is the ORM replacement.
- **Don't use Edge Functions** — SMS and server logic go through Next.js API routes.
- **Don't remove the Supabase client placeholder fallback** — The app gracefully handles missing env vars; don't break that.
- **Don't use raw hex colors** — Always use M3 design tokens (e.g., `text-primary`, `bg-surface-container`).
- **Don't use `alert()`** — Use `sonner` toast (`toast.success()`, `toast.error()`).

## Coding Style

- Add `"use client"` to components by default (most components use hooks/interactivity).
- Use stagger animations from `lib/motion.ts` (`staggerContainer`, `staggerItem`) for lists and page content.
- Use M3 color tokens from `tailwind.config.ts` — never raw hex values.
- All interactive elements must have minimum 44x44px touch targets.
- All transitions use 300ms duration with material easing `cubic-bezier(0.2, 0, 0, 1)`.

## Key Patterns

### Auth Flow
`AuthProvider` (in `components/providers/auth-provider.tsx`) initializes on mount → checks Supabase session → populates Zustand `auth-store` → components read auth state via `useAuth()` hook.

### Data Fetching
Direct Supabase client calls inside `useEffect` — no TanStack Query wrappers yet. Pattern: create client → query in effect → set local state.

### Middleware
`middleware.ts` early-returns when Supabase env vars are missing, allowing the app to render without a backend for UI development.

## External Services Setup

| Service | Purpose | Env Vars |
|---------|---------|----------|
| **Supabase** | Auth, database (PostgreSQL + RLS) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Mapbox** | Map display for route creation | `NEXT_PUBLIC_MAPBOX_TOKEN` |
| **Plivo** | SMS notifications to contacts | `PLIVO_AUTH_ID`, `PLIVO_AUTH_TOKEN`, `PLIVO_PHONE_NUMBER` |

To set up Supabase schema, run `supabase/schema.sql` in your Supabase project's SQL Editor.

## Current Limitations / Known Issues

- **iOS Safari**: Background geolocation is unreliable; service worker geofencing may not trigger when app is backgrounded.
- **No automated tests**: All testing is manual.
- **Demo mode is temporary**: A demo login exists for UI browsing without credentials. All demo code is marked with `// DEMO MODE - TEMPORARY` comments and should be removed before production.

## Development Status

- [x] Phase 1: Foundation & Design System (Tailwind, M3 components, Landing page)
- [x] Phase 2: Auth & Database (Supabase schema, auth pages, middleware)
- [x] Phase 3: Dashboard & Route/Contact Management (Maps, CRUD)
- [x] Phase 4: Journey Engine & Notifications (Geofencing, SMS)
- [x] Phase 5: PWA & Polish (Manifest, service worker, settings)
