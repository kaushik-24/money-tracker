# Architecture Overview — Money Tracker

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────┐
│           Next.js (App Router)                   │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │  React UI   │  │  API Routes (/api/*)     │  │
│  │  (Tailwind) │  │  Server Actions          │  │
│  └─────────────┘  └──────────┬───────────────┘  │
│                               │                  │
│  ┌────────────────────────────▼────────────────┐ │
│  │  Encryption Layer (tools/encryption.ts)     │ │
│  │  AES-256-GCM encode/decode on read/write    │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼──────────────────────────────┐
│         Cloud PostgreSQL (Supabase/RDS)          │
│  Encrypted columns stored as hex strings         │
│  Non-sensitive columns in plaintext              │
└─────────────────────────────────────────────────┘
```

## 3-Layer Architecture

| Layer | Location | Purpose |
|-------|----------|---------|
| 1: Architecture | architecture/*.md | SOPs for every system operation |
| 2: Navigation | src/app/* | Next.js App Router — pages and API routes |
| 3: Tools | tools/*.ts | Atomic, independently-testable scripts |

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (via Supabase or RDS)
- **ORM**: Prisma v7
- **Auth**: NextAuth.js v5 (Credentials provider)
- **Encryption**: Node.js crypto (AES-256-GCM)
- **Charts**: Recharts (React charting library)
- **Icons**: Lucide React

## Key Design Decisions

1. **Application-level encryption** — AES-256-GCM encrypts sensitive fields before they reach PostgreSQL. Encryption key in `.env`.
2. **Manual entry only** — No external API integrations. All data entered via UI forms.
3. **Soft delete** — Accounts use `isArchived` flag. Transactions are never deleted.
4. **Prisma ORM** — Type-safe database access. Migration-based schema management.

## File Structure

```
money-tracker/
├── constitution.md              # Project law & data schemas
├── .env                         # Secrets (never committed)
├── architecture/                # Layer 1: SOPs
│   ├── 01-overview.md           # This file
│   ├── 02-database.md           # Schema & migrations
│   ├── 03-encryption.md         # Encrypt/decrypt procedures
│   └── 04-dashboard.md          # UI pages & data flow
├── tools/                       # Layer 3: Atomic scripts
│   ├── encrypt-keygen.ts        # Generate ENCRYPTION_KEY
│   ├── setup-db.ts              # Run migrations
│   ├── seed-categories.ts       # Seed default categories
│   ├── add-account.ts           # CLI account creation
│   └── add-transaction.ts       # CLI transaction entry
├── src/                         # Layer 2: Next.js app
│   ├── app/                     # App Router pages
│   ├── components/              # Shared React components
│   └── lib/                     # Shared utilities
├── prisma/
│   └── schema.prisma            # Database schema
└── .tmp/                        # Ephemeral working files
```
