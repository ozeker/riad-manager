# PostgreSQL Migration Prep

## Why This Matters

Riad Manager currently uses SQLite for local MVP testing.

SQLite is simple and works well on your machine, but PostgreSQL is the better
choice before sharing a hosted beta or production version because:

- hosted platforms support PostgreSQL more reliably
- database storage is persistent and managed
- backups are easier to automate
- future multi-user features will be safer

## Current State

The live app still uses:

```text
prisma/schema.prisma
```

That schema is configured for SQLite.

This repo now also includes:

```text
prisma/postgres.schema.prisma
```

That file is a PostgreSQL-ready schema candidate with the same models.

## Validation Command

Run:

```bash
npm run db:postgres:validate
```

Expected result:

- Prisma validates the PostgreSQL schema
- no database connection is required

## Supabase Connection URLs

For Vercel + Supabase:

- use `DATABASE_URL` for the app runtime connection
- use `DIRECT_URL` for Prisma migrations

Recommended beta values:

```text
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require"
```

`DATABASE_URL` uses Supabase's transaction pooler for serverless runtime.

`DIRECT_URL` uses the session/direct-style connection for migrations.

Prisma 7 does not keep `DIRECT_URL` inside the Prisma schema. This repo keeps
`DIRECT_URL` in environment variables and uses `npm run db:migrate:supabase` to
pass it to Prisma CLI safely during migration deploys.

Only use variables beginning with `NEXT_PUBLIC_` in browser code.

Do not expose database URLs or service role keys in browser code.

## Recommended Migration Order

1. Finish local owner acceptance testing with SQLite.
2. Create a Supabase project.
3. Copy Supabase connection strings.
4. Add production `DATABASE_URL` and `DIRECT_URL`.
5. Switch the main Prisma schema provider from SQLite to PostgreSQL.
6. Replace the SQLite Prisma adapter in `src/lib/prisma.ts`.
7. Generate a fresh initial PostgreSQL migration.
8. Run `npm run db:migrate:supabase`.
9. Seed or import starting data.
10. Run `npm run verify`.
11. Deploy the beta.
12. Run `npm run test:mvp` against the beta.

## Data Migration Strategy

For the beta, the safest beginner path is:

1. Export important local records as CSV.
2. Create the PostgreSQL database.
3. Run migrations on PostgreSQL.
4. Seed base sample data only if needed.
5. Re-enter or import the real owner data intentionally.

For later production data migration, build a dedicated migration script from
SQLite to PostgreSQL.

## Environment Variables

PostgreSQL `DATABASE_URL` should look like:

```text
postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

PostgreSQL `DIRECT_URL` should look like:

```text
postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require
```

For local SQLite testing, keep:

```text
DATABASE_URL="file:./prisma/dev.db"
```

For hosted beta, use PostgreSQL:

```text
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

## Important Rule

Do not switch the main app to PostgreSQL until local UI/functionality testing is
complete.

The current `postgres.schema.prisma` file is preparation only.
