# Deployment Prep

## Current MVP Deployment Shape

Riad Manager currently uses SQLite through Prisma.

That is suitable for:

- local development
- a small single-owner MVP
- a VPS or server with persistent disk storage

It is not yet ideal for serverless hosting where the filesystem is temporary.

## Required Production Environment Variables

Use `production.env.example` as the checklist.

Required values:

- `DATABASE_URL`
- `OWNER_PASSWORD`
- `AUTH_SECRET`

Do not commit real production secrets.

## Pre-Deployment Checks

Run:

```bash
npm run verify
```

Expected result:

- ESLint passes
- Next.js production build passes

Run database migrations:

```bash
npm run db:migrate:deploy
```

Expected result:

- Prisma applies pending migrations
- no migration errors are shown

## Recommended MVP Hosting Path

For the current SQLite MVP:

1. Use a VPS or small persistent server.
2. Store the SQLite database on a persistent disk path.
3. Set `DATABASE_URL` to that disk path.
4. Set a private `OWNER_PASSWORD`.
5. Set a long random `AUTH_SECRET`.
6. Run `npm install`.
7. Run `npm run db:migrate:deploy`.
8. Run `npm run build`.
9. Start with `npm run start`.

## Future Production Upgrade

Before a wider production launch, migrate from SQLite to PostgreSQL.

That will make deployment easier on managed platforms and reduce the risk of
filesystem persistence problems.
