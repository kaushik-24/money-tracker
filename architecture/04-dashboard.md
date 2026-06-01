# Dashboard SOP — UI Pages & Data Flow

## Page Structure

```
/                           → Dashboard (overview, charts, summary)
/accounts                   → Account list & balances
/accounts/[id]              → Account detail with transactions
/transactions               → Transaction list (filterable)
/transactions/new           → Add transaction form
/categories                 → Category management
/budgets                    → Budget list & progress
/investments                → Investment portfolio
/investments/new            → Add investment form
/settings                   → User settings & profile
/api/auth/*                 → NextAuth.js routes
/api/accounts/*             → Account CRUD
/api/transactions/*         → Transaction CRUD
/api/categories/*           → Category CRUD
/api/budgets/*              → Budget CRUD
/api/investments/*          → Investment CRUD
```

## Dashboard Overview Metrics

1. **Total Balance** — Sum of all non-archived account balances (decrypted)
2. **Monthly Income** — Sum of income transactions this month
3. **Monthly Expenses** — Sum of expense transactions this month
4. **Net Worth** — Total assets minus liabilities
5. **Budget Progress** — Per-category spending vs budget (%)

## Data Flow Pattern

```
User Action (form submit)
  → Server Action or API Route
    → Decrypt incoming sensitive data? No — data is plaintext in request body
    → Encrypt sensitive fields via src/lib/encryption.ts
    → Write to PostgreSQL via Prisma
    → Return response
```

## Read Flow Pattern

```
Page Load
  → Server Component or API Route
    → Read from PostgreSQL via Prisma
    → Decrypt sensitive fields via src/lib/encryption.ts
    → Return to client (decrypted in-memory only)
```

## Authentication

- **Provider**: Credentials (email + password)
- **Library**: NextAuth.js v5
- **Session**: JWT-based (no DB sessions needed for single-user)
- **Protection**: All `/api/*` and pages except `/api/auth/*` and `/login` require authentication

## Charting

- **Library**: Recharts
- **Charts needed**:
  1. Monthly income vs expenses (bar chart)
  2. Spending by category (pie/donut chart)
  3. Net worth over time (line chart)
  4. Budget progress (horizontal bar chart)
