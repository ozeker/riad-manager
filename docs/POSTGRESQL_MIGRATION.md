# PostgreSQL Cutover Notes

## Current State

Riad Manager now uses PostgreSQL through Prisma.

For beta, PostgreSQL is expected to be hosted by Supabase and the Next.js app is
expected to be hosted by Vercel.

The previous SQLite setup was for temporary local MVP development only. The
temporary local data is not part of the beta migration.

## Runtime Connections

Use two Supabase database URLs:

- `DATABASE_URL` for the app runtime connection
- `DIRECT_URL` for Prisma migrations

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

## Migration Command

After adding real Supabase values to `.env`, run:

```bash
npm run db:migrate:supabase
```

Expected result:

- Prisma connects using `DIRECT_URL`
- the initial PostgreSQL migration is applied
- the Supabase database gets the app tables

## Optional Seed Command

To load sample data into the connected PostgreSQL database:

```bash
npm run db:seed
```

Only run this if you want demo data in the beta database.

## Verification Commands

Run:

```bash
npm run db:postgres:validate
npm run db:generate
npm run build
```

Expected result:

- Prisma schema validates
- Prisma client is generated
- Next.js production build passes

## Data Strategy

The current local data is disposable.

For real beta data:

1. Create the Supabase database.
2. Apply migrations.
3. Add the owner's real property, rooms, and iCal feed URLs.
4. Import iCal reservations when the owner provides the links.
5. Use CSV exports as the first manual backup mechanism.
