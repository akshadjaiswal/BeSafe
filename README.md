# BeSafe - Automatic Safe Arrival Notifications

> Never forget to say you're safe. BeSafe automatically notifies your loved ones when you reach your destination.

**Status: In Development**

## What is BeSafe?

BeSafe is a location-based Progressive Web App that automatically notifies loved ones when users safely reach their destination. Designed for daily commuters in high-accident areas, it eliminates the mental burden of remembering to send "I reached safely" messages.

Using intelligent geofencing technology, the app detects when you leave a starting location (e.g., Home) and automatically sends confirmation notifications to designated contacts when you arrive at your destination (e.g., Office) — completely hands-free.

## Key Features

- **Smart Detection** — Geofencing auto-detects departure and arrival
- **Battery Efficient** — Event-driven tracking, not constant GPS (<5% per hour)
- **Privacy First** — Only tracks during defined journeys, never 24/7
- **Delay Alerts** — Emergency contacts notified if you don't arrive on time
- **Multiple Routes** — Home to Office, Office to Home, or any custom route
- **SMS Notifications** — Contacts get instant SMS — no app needed on their end

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + Material You Design System |
| UI Components | shadcn/ui (customized for M3) |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Maps | Mapbox GL JS |
| SMS | Plivo API |
| State | Zustand + TanStack Query |
| Deployment | Vercel |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/BeSafe.git
cd BeSafe/web-app

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase, Mapbox, and Plivo credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL JS access token |
| `PLIVO_AUTH_ID` | Plivo Auth ID (server-only) |
| `PLIVO_AUTH_TOKEN` | Plivo Auth Token (server-only) |
| `PLIVO_PHONE_NUMBER` | Plivo sender phone number |

## Project Structure

```
web-app/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── auth/              # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui base components (M3 styled)
│   ├── landing/           # Landing page sections
│   ├── map/               # Mapbox components
│   ├── journey/           # Journey tracking components
│   └── contacts/          # Contact management components
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── stores/            # Zustand stores
│   ├── geo/               # Geofencing & location logic
│   ├── services/          # External API integrations
│   ├── validations/       # Zod schemas
│   ├── motion.ts          # Framer Motion variants
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/                # Static assets & PWA config
```

## License

MIT
