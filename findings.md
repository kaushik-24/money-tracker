# Findings — Money Tracker

## 2026-06-01 — Initial Discovery

### Environment
- Node.js v20.19.6 available
- npm 10.8.2 available
- No PostgreSQL client installed locally (will use Prisma)

### Constraints
- Cloud-hosted PostgreSQL (Supabase or RDS) — connection string required
- Application-level encryption (AES-256-GCM) preferred over pgcrypto for Next.js compatibility
- Manual entry only — no auto-fetching from external financial services
- Encryption key must be 64-char hex (32 bytes for AES-256)

### Tech Stack Decisions
- **Framework**: Next.js 16 (App Router) with TypeScript
- **ORM**: Prisma v7 with `@prisma/adapter-pg`
- **Auth**: NextAuth v4 (Credentials provider, JWT sessions)
- **Encryption**: Node.js `crypto` module, AES-256-GCM, app-level
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React (installed but not used yet)
- **CLI Tools**: prompts for interactive scripts, tsx for TypeScript execution

### Architectural Discoveries
- Prisma v7 requires `@prisma/adapter-pg` for PostgreSQL connections (no direct URL in schema)
- PrismaClient in v7 requires adapter option in constructor
- Next.js 16 deprecated middleware.ts in favor of `proxy.ts` — middleware removed for now
- NextAuth v4 with App Router uses `getServerSession(authOptions)` pattern
- Prisma v7 generates client to custom output directory (src/generated/prisma/)
- Build succeeded with all routes compiled (15 routes total)

### Open Questions
- Which cloud PostgreSQL provider? (Supabase free tier vs RDS)
- Registration flow — create first user how? (CLI script or initial setup?)
- Auth page protection without middleware — use client-side SessionProvider checks

### Removed Files
- middleware.ts — removed due to Next.js 16 deprecation (middleware-to-proxy)
- Template SVGs (next.svg, vercel.svg, etc.)
