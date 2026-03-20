# BeSafe - Project Guide

## Project Overview

BeSafe is a PWA for automatic safe arrival notifications. Users set routes (Home -> Office), and the app auto-detects departure/arrival via geofencing, sending SMS to emergency contacts.

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
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## Development Status

- [x] Phase 1: Foundation & Design System (Tailwind, M3 components, Landing page)
- [ ] Phase 2: Auth & Database (Supabase schema, auth pages, middleware)
- [ ] Phase 3: Dashboard & Route/Contact Management (Maps, CRUD)
- [ ] Phase 4: Journey Engine & Notifications (Geofencing, SMS)
- [ ] Phase 5: PWA & Polish (Manifest, service worker, settings)
