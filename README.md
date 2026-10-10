# Portfolio + Admin CMS

A personal portfolio site with a full admin CMS behind it — draft/publish workflow with revision history, a page composer for the homepage's sections, Projects/Posts/Pages with SEO fields, a media library, role-based auth with timed invites, and a Playwright e2e suite.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19) — `apps/web`
- **Prisma 7** on Postgres, via `@prisma/adapter-pg` — `packages/db`
- **Zod**-driven section registry powering the homepage composer — `packages/sections`
- pnpm workspaces + Turborepo

## Getting started

Requires Node 22+, pnpm, and a running Postgres instance.

```bash
pnpm install

# apps/web/.env and packages/db/.env each need DATABASE_URL (see .env.example in both)
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env

pnpm db:migrate       # apply the Prisma schema
pnpm --filter @portfolio/web seed   # creates an admin user + a minimal home page, prints the credentials

pnpm dev              # http://localhost:3000, admin at /admin
```

## Commands

```bash
pnpm dev          # start the dev server
pnpm build        # production build
pnpm lint         # eslint across all packages
pnpm typecheck    # tsc --noEmit across all packages
pnpm db:generate  # regenerate the Prisma client after editing schema.prisma
pnpm db:migrate   # create + apply a new migration

pnpm test                               # unit tests (AI Blog Generator pipeline)
pnpm --filter @portfolio/web test:e2e   # Playwright e2e suite (needs the dev server + DB up)
pnpm --filter @portfolio/db studio      # Prisma Studio
```

## AI Blog Generator

Admin → **AI Blog Generator** discovers trending topics (Hacker News, dev.to, GitHub Trending, Reddit), researches each one from its source pages, and saves a reviewable **draft** post. Nothing is ever auto-published.

Set these server-side variables in `apps/web/.env` (see `.env.example`):

```
EXPLABS_API_KEY=...                                   # required
EXPLABS_BASE_URL=https://api.experientiallabs.ai/v1   # optional, OpenAI-compatible
EXPLABS_MODEL=claude-haiku-5.5                        # optional
```

`pnpm --filter @portfolio/web ai-blog:smoke` makes one real call and prints the response shape. Prompts live in `apps/web/lib/ai-blog/prompts.ts`, trend sources in `sources.config.ts`, and the style reference in `docs/blog-style-guide.md`.

## Project structure

```
apps/web/            Next.js app — public site, /admin CMS, API routes
  app/                routes (App Router)
  components/         sections/ (public), admin/ (CMS), ui/ (shadcn)
  lib/                auth, storage adapter, admin field configs
  e2e/                Playwright specs

packages/db/          Prisma schema + generated client + domain logic
  prisma/schema.prisma
  src/                auth, cms (revisions/publish), media, seo, tags, site-settings

packages/sections/    Zod schemas + registry for homepage section types
```

See [CLAUDE.md](./CLAUDE.md) for the architecture write-up (revision/publish pipeline, the section registry pattern, auth model, theming) — it's aimed at whoever (human or agent) is picking this codebase up next.
