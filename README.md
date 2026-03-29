# Pattern Miner

Pattern Miner is a light, premium research workspace for designers who need to turn chaotic batches of UI screenshots into structured pattern clusters, side-by-side comparisons, and curated shortlists.

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Supabase for auth, database, and storage

## MVP Scope

- Sign in / entry
- Dashboard
- Create project
- Upload
- Library
- Clusters
- Cluster detail
- Compare
- Shortlist

## Current Status

The MVP flow is implemented end to end:

- Magic-link entry with Supabase-ready auth and demo-mode fallback
- Dashboard with project cards, empty state, and quick-start guidance
- Create project form with validation and redirect into upload
- Upload flow with dropzone, validation, queue, progress, and storage-ready service layer
- Library with search, filters, sort, selection, compare CTA, and shortlist add
- Clusters overview with rename, merge selection, split, and preview stacks
- Cluster detail with notes, tags, move and ungroup actions, compare, and shortlist add
- Compare view for 2 to 4 screens
- Shortlist board with regroup, reorder, and remove actions

## Getting Started

1. Use Node 22+
2. Install dependencies:

```bash
npm install
```

3. Create env file from the example:

```bash
cp .env.example .env
```

4. Start the dev server:

```bash
npm run dev
```

## Environment Variables

```bash
VITE_APP_URL=http://localhost:5173
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

If Supabase env vars are missing, the app falls back to a demo-mode auth/data flow so the product UI can still be explored locally.

## Demo Mode

Demo mode exists only to make local UI exploration possible before Supabase is configured. The real app architecture still points at Supabase for auth, database, and storage.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Supabase Notes

- SQL schema lives in [supabase/migrations/0001_init.sql](/Users/nix/Documents/pattern-miner/supabase/migrations/0001_init.sql)
- The first migration creates the core MVP tables, storage bucket, and RLS policies
- Client setup lives in [src/lib/supabase/client.ts](/Users/nix/Documents/pattern-miner/src/lib/supabase/client.ts)
- The app data abstraction lives in [src/lib/data/app-client.ts](/Users/nix/Documents/pattern-miner/src/lib/data/app-client.ts)

## What Comes Next

- Replace placeholder cluster generation with a smarter grouping service
- Add richer metadata extraction, dedupe hints, and better merge and split ergonomics
- Add tests around the main product flow and repository adapters
- Prepare deployment config and Supabase project setup for Vercel
