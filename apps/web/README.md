# @portfolio/web

The Next.js app: public portfolio site, `/admin` CMS, and API routes. Part of the `portfolio-next` monorepo — see the [root README](../../README.md) for setup and the [root CLAUDE.md](../../CLAUDE.md) for architecture.

## App-specific commands

```bash
pnpm dev              # next dev (Turbopack)
pnpm build            # next build
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
pnpm seed             # tsx scripts/seed.ts — admin user + minimal home page
pnpm test:e2e         # playwright test
```

Run these from `apps/web/`, or from the repo root via `pnpm --filter @portfolio/web <script>`.

## Environment

Copy `.env.example` to `.env`:

```
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5432/portfolio?schema=public"
```

## Uploads in development

Media uploads are written to `public/uploads/` by the local-disk storage adapter (`lib/storage/local-disk.ts`). That adapter is dev-only — see its file comment before deploying anywhere with a read-only filesystem (e.g. Vercel serverless).
