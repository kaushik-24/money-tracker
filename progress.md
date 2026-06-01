# Progress — Money Tracker

## 2026-06-01

### Done
- Initialized project memory (constitution.md, task_plan.md, findings.md, progress.md)
- Confirmed tech stack and data schema with user
- Node.js v20, npm 10.8 available
- Scaffolded Next.js 16 project with TypeScript + Tailwind CSS v4
- Installed Prisma v7 with PostgreSQL adapter
- Installed all dependencies (next-auth, recharts, lucide-react, bcryptjs, prompts)
- Created Prisma schema matching constitution.md (6 models + 4 enums)
- Wrote 4 architecture SOPs in architecture/
- Created 5 atomic tools in tools/ (encrypt-keygen, setup-db, seed-categories, add-account, add-transaction)
- Built encryption module (AES-256-GCM) with round-trip verified
- Built authentication (NextAuth v4, Credentials provider)
- Built API routes for all entities (accounts, transactions, categories, budgets, investments)
- Built all UI pages (dashboard, accounts, transactions/new, categories, budgets, investments)
- Fixed TypeScript build errors — project compiles and builds successfully
- Removed deprecated middleware (Next.js 16) — will use client-side auth redirect

### Next Steps
- Set up actual PostgreSQL connection and test
- Create first user account via registration script
- Deploy to Vercel/Supabase
- Add auth protection to pages
- Add the login page redirect to the root layout
- Run lint and fix warnings

### Known Issues
- middleware.ts removed due to Next.js 16 deprecation — need alternative auth protection
- Prisma v7 adapter may need tweaks for different PostgreSQL providers
- Tools need DATABASE_URL and ENCRYPTION_KEY in .env to be runnable
