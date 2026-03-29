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

The repository baseline is in place:

- Vite + React + TypeScript + Tailwind setup
- App shell, routing, and shared design tokens
- Supabase client scaffolding and first SQL migration
- Demo-mode data layer for local UI exploration when env is not configured
- Initial page structure for the full MVP flow

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

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Supabase Notes

- SQL schema lives in [supabase/migrations/0001_init.sql](/Users/nix/Documents/pattern-miner/supabase/migrations/0001_init.sql)
- The first migration creates the core MVP tables, storage bucket, and RLS policies

## Next Build Steps

- Finish auth entry and callback flow
- Build dashboard and create-project experience
- Connect upload, library, cluster, compare, and shortlist flows end to end
- Polish states, docs, and deployment readiness for Vercel
