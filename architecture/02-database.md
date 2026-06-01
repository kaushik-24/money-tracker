# Database SOP — Schema & Migrations

## Connection

- **Provider**: PostgreSQL (cloud-hosted — Supabase or RDS)
- **URL**: `DATABASE_URL` in `.env`
- **ORM**: Prisma v7

## Schema Location

`prisma/schema.prisma` — Single source of truth for all models.

## Models

| Model | Table | Key Fields | Encrypted |
|-------|-------|-----------|-----------|
| User | User | id, email, passwordHash | No |
| Account | Account | id, name, type, balance | balance |
| Transaction | Transaction | id, accountId, categoryId, amount, date, description | amount, description |
| Category | Category | id, name, type, icon, color | No |
| Budget | Budget | id, categoryId, amount, period | No |
| Investment | Investment | id, accountId, name, shares, purchasePrice, currentPrice | purchasePrice, currentPrice |

## Migration Workflow

### Create a migration
```bash
npx prisma migrate dev --name <description>
```

### Apply to production
```bash
npx prisma migrate deploy
```

### Reset local DB
```bash
npx prisma migrate reset
```

## Seeding

Run seed via `tools/seed-categories.ts`:
```bash
npx tsx tools/seed-categories.ts
```

## Important Notes

- Encrypted fields are stored as hex strings (not native numeric types).
- All IDs are UUIDv4 stored as `@db.Uuid`.
- `DateTime` fields use PostgreSQL's native `timestamptz`.
- The `DATABASE_URL` in `prisma.config.ts` is read from `process.env`.
