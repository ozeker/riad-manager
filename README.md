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

## Documentation

Project planning documents live in `docs/`:

- `docs/PRD.md`
- `docs/MVP_SCOPE.md`
- `docs/SAMPLE_DATA.md`
- `docs/CODEX_PROMPTS.md`
