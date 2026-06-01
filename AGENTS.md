# AGENTS.md — Money Tracker

## Project Overview
Personal financial dashboard built with Next.js 16 + TypeScript + Prisma v7 + PostgreSQL.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **ORM**: Prisma v7 (with @prisma/adapter-pg)
- **Database**: PostgreSQL (Supabase/RDS)
- **Auth**: NextAuth v4 (Credentials provider)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React

## Key Commands
- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run lint` — Run ESLint
- `npm run db:setup` — Initialize database
- `npm run db:seed` — Seed categories
- `npm run keygen` — Generate encryption key

## Project Structure
- `constitution.md` — Data schemas, rules, invariants
- `architecture/` — Architecture SOPs (design docs)
- `tools/` — Atomic CLI scripts (runnable via `npx tsx`)
- `src/` — Next.js application
- `src/lib/` — Shared utilities (encryption, prisma, auth)

## Architectural Invariants
1. Sensitive fields encrypted with AES-256-GCM before DB write
2. Manual entry only — no external API integrations
3. Soft archive for accounts (isArchived flag)
4. All secrets via .env only
5. SOP before code — update architecture/ docs before changing logic
