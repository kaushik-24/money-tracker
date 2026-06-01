# Project Constitution — Money Tracker

## Meta
- **Version**: 1.0.0
- **Last Updated**: 2026-06-01
- **Architect**: Code Architect (O.P.U.S. Protocol)

## Data Schemas

### Account
```typescript
interface Account {
  id: string            // UUID v4
  name: string          // e.g., "Chase Checking"
  type: AccountType     // checking | savings | credit | investment | cash
  balance: number       // Encrypted at rest (app-level)
  currency: string      // ISO 4217, default "USD"
  color: string         // Hex color for UI
  isArchived: boolean   // Soft delete
  createdAt: string     // ISO 8601
  updatedAt: string     // ISO 8601
}

enum AccountType {
  checking | savings | credit | investment | cash
}
```

### Transaction
```typescript
interface Transaction {
  id: string            // UUID v4
  accountId: string     // FK -> Account
  categoryId: string    // FK -> Category
  amount: number        // Encrypted at rest. Positive = income, Negative = expense
  date: string          // ISO 8601 date
  description: string   // Encrypted at rest
  isReconciled: boolean // Matches bank statement
  createdAt: string     // ISO 8601
  updatedAt: string     // ISO 8601
}
```

### Category
```typescript
interface Category {
  id: string            // UUID v4
  name: string          // e.g., "Groceries", "Salary"
  type: CategoryType    // income | expense | transfer
  icon: string          // Emoji or icon name
  color: string         // Hex color for UI
  isBuiltIn: boolean    // System-seeded, cannot delete
  createdAt: string     // ISO 8601
}

enum CategoryType {
  income | expense | transfer
}
```

### Budget
```typescript
interface Budget {
  id: string            // UUID v4
  categoryId: string    // FK -> Category
  amount: number        // Not encrypted (used in calculations)
  period: BudgetPeriod  // monthly | yearly
  startDate: string     // ISO 8601 date
  endDate: string       // ISO 8601 date (nullable for ongoing)
  createdAt: string     // ISO 8601
  updatedAt: string     // ISO 8601
}

enum BudgetPeriod {
  monthly | yearly
}
```

### Investment
```typescript
interface Investment {
  id: string            // UUID v4
  accountId: string     // FK -> Account (type=investment)
  name: string          // e.g., "AAPL", "VTI"
  type: InvestmentType  // stock | crypto | etf | mutual_fund | bond
  shares: number        // Not encrypted
  purchasePrice: number // Encrypted at rest
  currentPrice: number  // Encrypted at rest — updated manually
  currency: string      // ISO 4217
  createdAt: string     // ISO 8601
  updatedAt: string     // ISO 8601
}

enum InvestmentType {
  stock | crypto | etf | mutual_fund | bond
}
```

### Encrypted Fields Summary
| Entity | Encrypted Fields | Encryption Scope |
|--------|-----------------|-----------------|
| Account | balance | App-level AES-256-GCM |
| Transaction | amount, description | App-level AES-256-GCM |
| Investment | purchasePrice, currentPrice | App-level AES-256-GCM |

## Behavioral Rules

1. **Manual Entry Only** — No auto-fetching from banks or external APIs. All transactions entered via UI forms.
2. **Encryption at Rest** — Sensitive fields (amount, balance, description) encrypted with AES-256-GCM before writing to PostgreSQL. Decrypted on read.
3. **No Deletion of Built-in Categories** — Categories with `isBuiltIn: true` cannot be deleted (e.g., "Other Income", "Other Expense").
4. **Soft Archive** — Accounts use `isArchived` flag. Transactions are never deleted from DB.
5. **Idempotent Seeding** — Seed scripts check for existing data before inserting.
6. **Encryption Key in .env** — `ENCRYPTION_KEY` as 64-char hex (32 bytes). Never hardcoded.

## Architectural Invariants

1. **3-Layer Architecture** — SOPs in `architecture/`, routing in Next.js, logic in `tools/`.
2. **SOP Before Code** — If logic changes, update the SOP in `architecture/` before updating code.
3. **Atomic Tools** — Each `tools/*.ts` script is independently runnable via `npx tsx`.
4. **No Secrets in Code** — All secrets via `.env`, loaded with `dotenv` or `process.env`.
5. **Data-First Rule** — Schema is defined here before any implementation begins.
6. **Self-Annealing** — Errors documented in `architecture/` SOPs to prevent recurrence.

## Maintenance Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-01 | Initial constitution | Code Architect |
