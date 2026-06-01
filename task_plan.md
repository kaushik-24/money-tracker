# Task Plan — Money Tracker

## Phase 0: Initialize
- [x] Create constitution.md with data schemas and rules
- [x] Create task_plan.md
- [x] Create findings.md
- [x] Create progress.md
- [x] Check available runtimes (Node.js, npm)

## Phase 2: Plan — Scaffolding
- [x] Create directory structure (architecture/, tools/, .tmp/)
- [x] Create .env.example with required vars
- [x] Initialize Next.js project
- [x] Install dependencies (Prisma, NextAuth, Recharts, etc.)
- [x] Verify Prisma client generation
- [x] Set up Prisma schema matching constitution.md

## Phase 3 Layer 1: Architecture SOPs
- [x] architecture/01-overview.md — System architecture
- [x] architecture/02-database.md — Schema & migrations
- [x] architecture/03-encryption.md — Encrypt/decrypt procedures
- [x] architecture/04-dashboard.md — UI pages & data flow

## Phase 3 Layer 3: Tools
- [x] tools/encrypt-keygen.ts — Generate encryption key
- [x] tools/setup-db.ts — Initialize database & run migrations
- [x] tools/seed-categories.ts — Seed default categories
- [x] tools/add-account.ts — CLI account creation
- [x] tools/add-transaction.ts — CLI transaction entry

## Phase 3 Layer 2: Next.js App
- [x] API routes for CRUD operations
  - [x] /api/accounts (GET, POST)
  - [x] /api/accounts/[id] (GET, PUT, DELETE)
  - [x] /api/transactions (GET, POST)
  - [x] /api/categories (GET, POST)
  - [x] /api/budgets (GET, POST)
  - [x] /api/investments (GET, POST)
- [x] UI Pages
  - [x] Dashboard (overview with charts)
  - [x] Accounts page
  - [x] Account detail page
  - [x] Transactions page
  - [x] New transaction form
  - [x] Categories page
  - [x] Budgets page
  - [x] Investments page
  - [x] Login page
- [x] Authentication (NextAuth.js v4, Credentials)
- [x] AGENTS.md with project documentation

## Phase 4: Ship
- [ ] Set up PostgreSQL connection and test
- [ ] Create user registration flow
- [ ] Add session-based page protection
- [ ] Run lint and fix warnings
- [ ] End-to-end testing
- [ ] Deployment configuration
- [ ] Final documentation
