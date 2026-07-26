# Security & Design Review — portfolio-next

Review date: 2026-07-26
Scope: Prisma schema (`packages/db/prisma/schema.prisma`), DB domain logic (`packages/db/src/*.ts`), and the auth flow / API routes / storage layer in `apps/web`.

---

## Critical / High

### 1. Stored XSS via upload extension smuggling
**File:** `apps/web/lib/storage/local-disk.ts:27`, `apps/web/app/admin/(protected)/media/actions.ts:33`

`local-disk.ts` derives the on-disk file extension from the client-supplied `filename` before falling back to the validated MIME type. `media/actions.ts` only validates `file.type` (client-supplied, spoofable) against an allowlist — there is no magic-byte/content sniffing.

An editor (or anyone who compromises an editor session) can upload a file with `contentType: "image/png"` (passes the allowlist) but `filename: "x.svg"` containing raw SVG + `<script>` markup. It gets written to disk as `.svg` and served statically from `/uploads/`, executing attacker JS in the site's origin.

**Fix:** derive the extension only from a fixed map keyed off the *validated* content-type, never from the caller-supplied filename. Consider also sniffing magic bytes server-side before accepting the upload.

### 2. Preview/invite tokens use `cuid()`, not a CSPRNG
**File:** `packages/db/prisma/schema.prisma:66,126` (vs. `packages/db/src/auth.ts:47`)

`PreviewToken.token` and `InviteToken.token` default to Prisma's `cuid()`. Session tokens correctly use `randomBytes(32)`. `cuid()` v1 is timestamp + per-process counter + host fingerprint + a short random suffix (~41 bits) — built for uniqueness/sortability, not unguessability. There is no rate limiting anywhere on the `/preview/[token]` resolve path or invite acceptance.

Preview tokens expose **unpublished** content for up to an hour with no login; invite tokens grant account creation with an assigned role. Both are also stored **unhashed** as the primary key (unlike `Session.tokenHash`), so a DB read (backup or log leak) hands out directly usable secrets.

**Fix:** switch both to `randomBytes(32)`-derived tokens; consider hashing at rest like sessions; add throttling on the resolve/accept paths.

### 3. `Seo` rows have no exclusivity or cascade
**File:** `packages/db/prisma/schema.prisma:137-151, 226-227, 267-268, 291-292`

`Page.seoId`, `Project.seoId`, `Post.seoId` are three independent unique FKs pointing into a shared `Seo` table with no back-pointer or type discriminator. Nothing stops the same `seoId` being assigned to two different entities (editing one silently changes the other's meta tags). Deleting a `Page`/`Project`/`Post` leaves its `Seo` row orphaned permanently — the only `onDelete` runs in the other direction (Seo → Page: `SetNull`).

---

## Medium

### 4. Polymorphic `Revision` / `PreviewToken` have no FK integrity
**File:** `packages/db/prisma/schema.prisma:110-135`

`entityType`/`entityId` are free-text strings, not real foreign keys (an accepted tradeoff — Prisma can't do polymorphic FKs across three tables). Deleting an entity orphans its entire revision history and any live preview tokens pointing at it; a typo'd `entityType` (`"project"` vs `"Project"`) silently creates unreachable rows. `PreviewToken` also duplicates `entityType`/`entityId` independently from its own `revision` relation, with nothing enforcing they stay in sync.

### 5. `UserRoleAssignment` has no DB-level invariant guard
**File:** `packages/db/prisma/schema.prisma:21-34`

Nothing prevents two overlapping active rows for the same user (ambiguous "current role"), no `CHECK (expiresAt > startsAt)`, and the rule "`isPermanent` ⇒ `expiresAt IS NULL`" lives only in `packages/db/src/auth.ts` app code, not the schema. Every current write path (`assignRole`, `bootstrap.ts:289-291`) respects it correctly today, but it's enforced by convention, not by the database — a direct insert or future migration bug could violate it silently.

### 6. `cms.ts` / `revisions.ts` perform no authorization checks of their own
**File:** `packages/db/src/cms.ts`, `packages/db/src/revisions.ts`

`saveDraft`, `publishRevision`, `unpublishEntity`, `restoreRevision`, `createPreviewToken` all take a `userId` purely for audit logging — they trust the caller entirely. Today `requireAdmin()` in `apps/web/app/admin/(protected)/layout.tsx` covers every real call site, and `publishRevision`/`restoreRevision` do correctly cross-check `revision.entityType`/`entityId` against the target entity (closing the obvious IDOR). But there's no defense-in-depth if a future `app/api/*` route or webhook ever calls these functions directly and forgets the layout-level gate.

### 7. `acceptInvite` TOCTOU race
**File:** `packages/db/src/auth.ts:140-168`

The `!invite.acceptedAt` / expiry check happens in a plain read *before* the transaction, rather than an atomic `updateMany({ where: { token, acceptedAt: null } })` with a result-count check. Two concurrent accept requests for the same token could both pass the check; today this is only saved from producing duplicate accounts by `User.email`'s unique constraint erroring out the loser.

**Fix:** gate the claim update with `acceptedAt: null` in the `WHERE` clause and verify the returned row count.

---

## Low

- **`SectionInstance`** — no `@@unique([pageId, order])`; duplicate `order` values per page make section ordering nondeterministic on ties.
- **`TechStackItem`** (new/uncommitted model) breaks conventions its siblings follow: no `locale` (every other CRUD list — Experience, Skill, Service, Testimonial, etc. — has one), no `createdAt`/`updatedAt`, `imageUrl` is a raw string instead of a `Media` FK, and `name` isn't unique.
- **`NavigationItem`** self-relation has no depth/cycle constraint, despite being documented as "one level of nesting" — the schema can't stop `parentId` pointing at a descendant.
- **CSRF posture** relies entirely on `sameSite: "lax"` on the session cookie plus Next's built-in Server Action origin check — no explicit CSRF token as a second layer. Adequate today, but a single point of failure if `sameSite` is ever changed or a route reads auth from a header/query param instead of the cookie.
- **`AuditLog.userId`** is `RESTRICT` on delete while `Session`/`UserRoleAssignment` cascade — inconsistent user-deletion semantics.
- `ContentStatus.SCHEDULED` is a dead enum value — no `scheduledAt`/`publishAt` column exists to back a scheduled-publish feature.
- `Skill.level` is an unconstrained `Int` (no range check).
- `Tag`/`Author` have no `locale` despite `Project`/`Post` being locale-split via `translationGroupId` — one tag/author row is shared across all translations.

---

## What's solid (no action needed)

- **No raw SQL anywhere** in `packages/db` (`$queryRaw`/`$executeRaw`/`Prisma.sql`) — no SQL injection surface.
- **Password handling** is well implemented: scrypt + random salt + `timingSafeEqual` + a constant-time dummy-hash decoy for unknown emails (prevents user enumeration via timing). Login is rate-limited.
- **No mass-assignment** — every write path (`cms.ts`, `seo.ts`, `site-settings.ts`, etc.) uses explicit typed field lists rather than spreading raw caller input into Prisma calls.
- **Every admin server action** (including the new `tech-stack` actions) calls `requireEditor`/`requireAdminRole` itself, not just relying on layout-level protection; the one API route that needs its own check (`api/admin/invites`) has it too.
- **`proxy.ts`'s presence-only cookie check** is intentional (edge runtime can't hit Postgres) and is correctly backstopped by the DB-verified `requireAdmin()` in the admin layout — fails closed overall.
- **No hardcoded secrets/keys** found anywhere in `apps/web`.

---

## Suggested priority order for fixes

1. Upload extension smuggling (#1) — concrete, exploitable stored XSS.
2. Preview/invite token entropy (#2) — switch to `randomBytes(32)`.
3. `Seo` row exclusivity/orphan cleanup (#3).
4. `acceptInvite` TOCTOU fix (#7) — small, mechanical change.
5. Everything else is either a convention-enforced invariant worth hardening at the DB level, or a low-severity cleanup.
