# Deployment Guide - Vercel + Supabase Beta

## Decision

The beta deployment architecture is:

- Vercel hosts the Next.js app.
- Supabase provides managed PostgreSQL.
- Vercel stores deployment environment variables.
- Supabase Auth, Storage, Edge Functions, and scheduled jobs are reserved for later.

This guide prepares the project for deployment. Do not deploy until local testing is complete.

## Current State

The app now uses PostgreSQL through Prisma.

For beta, use Supabase PostgreSQL:

```text
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require"
```

Do not commit real Supabase URLs or passwords.

## Step 1 - Create A Supabase Project

In Supabase:

1. Create a new project.
2. Choose a region close to the owner or your expected users.
3. Save the database password securely.
4. Wait for the project to finish provisioning.

## Step 2 - Get Supabase Database URLs

In the Supabase project dashboard:

1. Open the project.
2. Click **Connect**.
3. Find the PostgreSQL connection strings.

For Vercel serverless runtime, use the transaction pooler for `DATABASE_URL`.

Example shape:

```text
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

For Prisma migrations, use the session/direct-style connection for `DIRECT_URL`.
Prisma 7 does not keep `DIRECT_URL` inside `schema.prisma`, so this repo uses
`DIRECT_URL` through the migration helper script instead.

Example shape:

```text
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require"
```

## Step 3 - Local Environment Variables

Create `.env` locally and add:

```text
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
OWNER_PASSWORD="your-private-owner-password"
AUTH_SECRET="your-long-random-secret"
```

Optional future Supabase variables:

```text
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

Do not add `SUPABASE_SERVICE_ROLE_KEY` unless a future server-only feature needs it.

## Step 4 - Vercel Environment Variables

In Vercel:

1. Create/import the project from GitHub.
2. Open Project Settings.
3. Open Environment Variables.
4. Add these values for Preview and Production:

```text
DATABASE_URL
DIRECT_URL
OWNER_PASSWORD
AUTH_SECRET
```

Only add these later if a Supabase browser feature is implemented:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Do not expose private database URLs or service role keys in browser code.

## Step 5 - Prisma Migration

```bash
npm run db:migrate:supabase
```

Expected result:

- Prisma connects to Supabase using `DIRECT_URL`
- tables are created in the Supabase PostgreSQL database
- no destructive reset is required for a fresh beta database

Validation command:

```bash
npm run db:postgres:validate
```

## Step 6 - Deploy To Vercel

1. Push the latest code to GitHub.
2. Import the repo in Vercel.
3. Add environment variables.
4. Deploy.
5. Open the generated Vercel URL.
6. Log in with `OWNER_PASSWORD`.
7. Run the MVP workflow checklist.

## Verification

Before deployment:

```bash
npm run verify
npm run db:postgres:validate
```

After deployment:

```bash
npm run test:mvp
```

Set `MVP_TEST_BASE_URL` to the deployed Vercel URL when running the smoke test against beta.

## References

- Vercel environment variables: https://vercel.com/docs/projects/environment-variables
- Vercel environments: https://vercel.com/docs/deployments/environments
- Supabase Prisma guide: https://supabase.com/docs/guides/database/prisma
- Supabase connection strings: https://supabase.com/docs/reference/postgres/connection-strings
- Prisma schema datasource docs: https://www.prisma.io/docs/orm/prisma-schema/overview
