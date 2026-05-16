# Riad Manager

Riad Manager is a simple internal management web app for a small Moroccan riad owner.

This repository is currently at the project setup stage. The app is scaffolded with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- shadcn/ui
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Local Environment

Create `.env` from `.env.example` and keep it private. This file is ignored by
Git because it contains the local database path and owner login secrets.

Required values:

- `DATABASE_URL`: local Prisma SQLite database path.
- `OWNER_PASSWORD`: private password used on the `/login` page.
- `AUTH_SECRET`: long random value used to sign the owner session cookie.

Generate an auth secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Database

This project uses Prisma with a local SQLite database for development.

Create and update the local database:

```bash
npm run db:migrate
```

Load sample data:

```bash
npm run db:seed
```

Open Prisma Studio:

```bash
npm run db:studio
```

## Deployment

Deployment notes live in `docs/DEPLOYMENT.md`.

Before deploying, run:

```bash
npm run verify
```

## Documentation

Project planning documents live in `docs/`:

- `docs/BRD.md`
- `docs/PRD.md`
- `docs/MVP_SCOPE.md`
- `docs/SAMPLE_DATA.md`
- `docs/CODEX_PROMPTS.md`
- `docs/DEPLOYMENT.md`
- `docs/PRODUCTION_MVP_CHECKLIST.md`
