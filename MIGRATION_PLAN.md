# badir-core-web — Platform Migration Plan

Migrating `badir-core-web` off Vercel/Supabase onto a portable, self-hosted container
pipeline modelled on `miqraa-core-api`.

**Status:** Phases 1–3 implemented (§4 Storage→S3, §5 Remove Vercel, §6 semantic-release).
Phases 4–7 (§7 husky/commitlint, §8 Docker, §9 CI, §10 Dependabot) not yet started.
**Reference project:** `../../miqraa/miqraa-core-api`

---

## 1. Objectives

| #   | Goal                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | Add semantic-release                                                        |
| 2   | Remove all Vercel + Supabase dependencies (including Vercel Analytics)      |
| 3   | Add the miqraa-style GitHub Actions CI workflow                             |
| 4   | Add a Dockerfile + docker-compose fitting this project                      |
| 5   | Replace the husky hook set: commit validation, lint, and other useful gates |
| 6   | Add Dependabot — with the two known commit-message failures fixed up front  |

### Agreed decisions

| Decision          | Choice                                                                              |
| ----------------- | ----------------------------------------------------------------------------------- |
| Storage backend   | S3-compatible — `@aws-sdk/client-s3`, MinIO locally, Cloudflare R2 per environment  |
| Git hook runner   | Keep **husky** as the runner, replace the hook scripts                              |
| Cron scheduling   | **Ofelia** (`mcuadros/ofelia`) sidecar in docker-compose                            |
| Delivery pipeline | Full parity with miqraa: GHCR, PR preview images, cleanup workflow                  |
| Env vars          | **Nothing baked into the image** — one image promoted across dev1 → staging1 → prod |

---

## 2. Current working-tree state (read before starting)

### 2.1 Changes I already made this session

These are live in the working tree right now. Say the word and I revert any of them.

| File                                 | Change                                                         | Why                                                                                                        |
| ------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `types/Initiatives.ts`               | Dropped `"icon"` from `Pick<InitiativeCategory, …>`            | `InitiativeCategory` has no `icon` column — this was a hard `tsc` error. Verified unused by any component. |
| `components/form-input/TelInput.tsx` | `onValueChange={(value) => value && onCountryChange?.(value)}` | base-ui `Select` yields `string \| null`; `onCountryChange` takes `string`. Hard `tsc` error.              |
| `package.json` + `pnpm-lock.yaml`    | Removed 6 packages (below)                                     | Objective 2                                                                                                |

Packages already removed: `@supabase/ssr`, `@supabase/supabase-js`, `@vercel/analytics`,
`@vercel/functions`, `@vercel/speed-insights`, `@netlify/plugin-nextjs`.

> The code still imports several of these, so the tree does **not** currently build.
> Phase 1 and Phase 2 close that gap.

**Why the two type fixes mattered:** `tsc --noEmit` reported exactly 2 errors, both
pre-existing and masked by `typescript: { ignoreBuildErrors: true }` in `next.config.ts`.
A CI type-check gate that fails on day one is worthless, so these had to go first.
After the fix: `tsc --noEmit` is clean, `eslint .` is clean (0 errors, 66 warnings).

### 2.2 Pre-existing untracked files (NOT written by me)

An earlier session left partial work in the tree. It is good work and the plan builds on it
rather than replacing it:

| File                      | Assessment                                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Dockerfile`              | Solid multi-stage pnpm/standalone build. **Needs edits:** still declares `NEXT_PUBLIC_SUPABASE_*` build args, and bakes `NEXT_PUBLIC_*`/`DATABASE_URL` at build — both contradict the "no env in the build" requirement. |
| `lib/background.ts`       | `runAfterResponse()` — an `after()`-based `waitUntil` replacement with an inline-await fallback. Correct and reusable as-is.                                                                                             |
| `app/api/health/route.ts` | Liveness probe, no DB touch. Correct; used by the Docker `HEALTHCHECK`.                                                                                                                                                  |

---

## 3. The env-var problem, and why it is solvable

**Constraint:** you run dev1, staging1 and prod with different values, so no configuration
may be compiled into the image.

Next.js inlines `NEXT_PUBLIC_*` into the client bundle at build time, which normally forces
one image per environment. An audit of every `NEXT_PUBLIC_*` read shows that is avoidable here:

| Usage                    | File                                                 | Context                   | Resolution                                                                  |
| ------------------------ | ---------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | `services/api.ts`                                    | **client** (3 components) | Only ever calls same-origin `/api` → use a relative `baseURL`, drop the var |
| `NEXT_PUBLIC_API_URL`    | `actions/submitRating.ts`                            | server action             | rename → `APP_URL`                                                          |
| `NEXT_PUBLIC_APP_URL`    | `app/api/cron/inactive-users`, `process-post-emails` | route handler             | rename → `APP_URL`                                                          |
| `NEXT_PUBLIC_APP_URL`    | `services/admin.ts`                                  | server service            | rename → `APP_URL`                                                          |
| `NEXT_PUBLIC_SUPABASE_*` | `lib/supabase/*`                                     | —                         | deleted in Phase 1                                                          |

**Result:** after Phase 1 + 2, zero `NEXT_PUBLIC_*` variables remain. Every value is read at
container start, so a single image is promoted unchanged across all three environments.

### 3.1 The one genuine blocker: build-time DB access

`app/organizations/page.tsx` sets `export const revalidate = 1800`, so Next prerenders it
during `next build` — which requires a reachable `DATABASE_URL` at build time, and bakes
whichever environment's org list was present into the image.

**Recommendation:** convert that page to render dynamically while keeping the 30-minute cache:

```ts
// app/organizations/page.tsx
export const dynamic = "force-dynamic";

const getOrganizations = unstable_cache(
  () =>
    OrganizationService.getMany(
      { status: OrganizationStatus.approved },
      { page: 1, limit: 12 },
    ),
  ["organizations:approved:p1"],
  { revalidate: 1800, tags: ["organizations"] },
);
```

This removes the database from the build entirely, keeps the same 30-minute revalidation at
runtime, and avoids the alternative's downside (an ephemeral build-time Postgres, which
would prerender an _empty_ org list that the first real visitor would see).

> **Decision needed** — I recommend the change above. The fallback is an ephemeral Postgres
> service in CI plus `DATABASE_URL` as a Docker build arg, which keeps the page code untouched
> but reintroduces build-time configuration.

---

## 4. Phase 1 — Replace Supabase Storage with S3

### Files deleted

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `services/supabase-storage.ts`

### File added: `services/storage.ts`

A drop-in replacement exposing the identical API, so the five consuming action files need
only an import-path change:

```ts
class StorageHelpers {
  uploadFile(bucket: BUCKETS, path: string, file: Buffer, type?: string): Promise<{ path: string }>
  getPublicUrl(bucket: BUCKETS, path: string): Promise<string>
  deleteFile(bucket: BUCKETS, path: string): Promise<void>
  downloadFile(bucket: BUCKETS, path: string): Promise<Blob>
  listFiles(bucket: BUCKETS, folder?: string): Promise<…>
}
export function extractStoragePath(url: string | null): string | null
```

**Design notes**

- **One bucket, prefix per logical bucket.** The three Supabase buckets (`avatars`,
  `documents`, `post-images`) become key prefixes inside a single S3 bucket:
  `avatars/<userId>/<file>`. One set of credentials, one public-access policy — this is
  what R2 wants, and it matches miqraa.
- **`extractStoragePath` must stay backward compatible.** Existing DB rows hold Supabase URLs
  (`/storage/v1/object/public/<bucket>/<path>`). The new implementation handles both that
  legacy shape and the new `${S3_PUBLIC_URL}/<bucket>/<path>`, stripping the origin _and_ the
  bucket segment, because every caller passes the bucket separately to `deleteFile`.
- Uses `@aws-sdk/client-s3` with `forcePathStyle: true` for MinIO.

### Consumers updated (import path only)

`actions/helpers-sf.ts`, `actions/initiatives.ts`, `actions/organization-profile.ts`,
`actions/posts.ts`, `actions/user-profile.ts`

> `actions/user-profile.ts` imports `StorageHelpers`/`extractStoragePath` but never uses
> them — the import gets removed rather than repointed.

### Also touched

- `next.config.ts` — `images.remotePatterns` moves off `*.supabase.co` to the S3/R2 host.
- `types/Statics.ts` — retitle the `======== Supabase Storage ========` section.
- `schemas/documentLinkSchema.ts` — `LEGACY_STORAGE_HOST_KEYWORDS = ["supabase"]` stays,
  since historical rows still point at Supabase; extended with the R2 host.

### ⚠️ Data migration is out of scope

Removing the dependency does not move the bytes. Existing files remain in Supabase Storage,
and old URLs keep resolving only while that project is alive. A one-off copy script
(Supabase → R2) plus a DB URL-rewrite is **a separate task** — flagging it explicitly so it
is not discovered in production.

---

## 5. Phase 2 — Remove Vercel

| Item                                          | Action                                                                                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vercel/analytics`, `@vercel/speed-insights` | Remove `<Analytics />` + `<SpeedInsights />` from `app/layout.tsx`                                                                                                                  |
| `@vercel/functions` `waitUntil`               | Replace with `runAfterResponse()` from the existing `lib/background.ts`, in `lib/auth.ts` (2 sites, incl. `advanced.backgroundTasks.handler`) and `actions/newsletter.ts` (2 sites) |
| `vercel.json`                                 | Delete — crons move to Ofelia (Phase 5)                                                                                                                                             |
| `.gitignore`                                  | Drop the `.vercel` entry; un-ignore `Dockerfile`, `docker-compose.yml`, `.dockerignore` (currently ignored!)                                                                        |
| Comments                                      | Scrub "Vercel Cron"/"Hobby plan" references in the 5 cron routes                                                                                                                    |
| `CRON_SECRET`                                 | Keep — it is the shared-secret guard, now checked against Ofelia's caller                                                                                                           |

No analytics replacement is being added, per your instruction. If you later want one,
self-hosted Umami/Plausible slots into `app/layout.tsx` at the same spot.

---

## 6. Phase 3 — semantic-release

### `.releaserc.json`

Mirrors miqraa, plus one addition: `@semantic-release/npm` with `npmPublish: false`, because
this repo's `package.json` version (`1.3.0`) is meaningful and should track releases. miqraa
omits it; here it is worth having.

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", { "npmPublish": false }],
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
}
```

**Starting point:** the repo has exactly one tag, `1.3.0`, matching `package.json`.
semantic-release continues from there — the next `fix:` yields `1.3.1`, the next `feat:`
yields `1.4.0`. No `CHANGELOG.md` exists yet; the first release creates it.

---

## 7. Phase 4 — Commit validation + husky hooks

### `commitlint.config.cjs` (new)

This is where **both** reported Dependabot failures get fixed.

```js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Dependabot and semantic-release both write bodies containing release notes,
    // changelog excerpts and compatibility tables. Those lines cannot be reflowed,
    // and the default 100-char cap rejects them outright.
    "body-max-line-length": [0, "always"],
    // Long `Signed-off-by:` / `[dependabot-skip]` / PR-link footers, same reason.
    "footer-max-line-length": [0, "always"],
  },
  // semantic-release's own release commit carries the full notes as its body.
  ignores: [(msg) => /^chore\(release\): /.test(msg)],
};
```

Header rules stay strict — the header is what semantic-release actually parses to compute
the version bump, so that is the part worth policing.

### Husky hooks (husky retained as runner)

| Hook         | Command                          | Purpose                                             |
| ------------ | -------------------------------- | --------------------------------------------------- |
| `commit-msg` | `pnpm exec commitlint --edit $1` | **5a** — same validation as the CI validation stage |
| `pre-commit` | `pnpm exec lint-staged`          | **5b** — prettier + `eslint --fix` on staged files  |
| `pre-push`   | `pnpm exec tsc --noEmit`         | **5c** — catches type breakage before it reaches CI |

`.husky/post-checkout` (`pnpm install` + `db:generate`) is **kept** — it is genuinely useful
and unrelated to the replacement.

**Why `pre-push` for type-check and not `pre-commit`:** `tsc` on this project takes long
enough to be irritating per-commit, but it is exactly the gate you want before code leaves
the machine. This mirrors the CI stage ordering.

### New devDependencies

`@commitlint/cli`, `@commitlint/config-conventional`

### New `package.json` script

`"type-check": "tsc --noEmit"` — consumed by the hook and by CI.

---

## 8. Phase 5 — Docker

### 8.1 `Dockerfile` (adapt the existing one)

Keep the existing 4-stage structure (`deps` → `builder` → `migrator` → `runner`); it is
well built. Changes required:

1. **Delete all `NEXT_PUBLIC_*` build args** — none survive Phase 2/3.
2. **Delete the `DATABASE_URL`/`DIRECT_URL` build args** — contingent on the
   `app/organizations/page.tsx` decision in §3.1.
3. **Add `ARG APP_VERSION`** → `ENV APP_VERSION`, surfaced by `/api/health`, matching how
   miqraa stamps its release into the image.
4. **Add a `HEALTHCHECK`** hitting `/api/health` (the route already exists).
5. `next.config.ts` needs `output: "standalone"` — the runner stage already assumes it, but
   the config does not currently set it. **Without this the image does not work.**

Retaining from the existing file: Debian-slim over Alpine (glibc builds for Prisma and
sharp), corepack/pnpm with a cache mount, non-root `nextjs` user, and the separate
`migrator` stage that replaces `vercel.json`'s `buildCommand` migration step.

### 8.2 `docker-compose.yml` (new)

| Service      | Image                   | Role                                                           |
| ------------ | ----------------------- | -------------------------------------------------------------- |
| `app`        | built from `Dockerfile` | Next.js standalone server                                      |
| `migrate`    | `migrator` target       | One-shot `prisma migrate deploy`, gates `app` via `depends_on` |
| `db`         | `postgres:18-alpine`    | Local Postgres, healthchecked with `pg_isready`                |
| `minio`      | `minio/minio`           | S3 API for local dev                                           |
| `minio-init` | `minio/mc`              | One-shot bucket create + public-read policy                    |
| `mailpit`    | `axllent/mailpit`       | Catches Resend/SMTP mail locally                               |
| `ofelia`     | `mcuadros/ofelia`       | Cron scheduler (below)                                         |

### 8.3 Ofelia cron schedules

Ofelia is configured by labels, running `job-local` HTTP calls against `app` on the compose
network, each carrying `Authorization: Bearer ${CRON_SECRET}` to satisfy the existing guard.
Schedules carried over verbatim from `vercel.json` (Ofelia uses 6-field cron, so a leading
`0` for seconds is prepended):

| Endpoint                        | Cron            | Was           |
| ------------------------------- | --------------- | ------------- |
| `/api/cron/process-webhooks`    | `0 0 8 * * *`   | `0 8 * * *`   |
| `/api/cron/process-post-emails` | `0 0 13 * * *`  | `0 13 * * *`  |
| `/api/cron/inactive-users`      | `0 0 9 * * 1`   | `0 9 * * 1`   |
| `/api/cron/keep-alive`          | `0 0 0 */6 * *` | `0 0 */6 * *` |
| `/api/cron/close-initiatives`   | `0 5 0 * * *`   | `5 0 * * *`   |

> `keep-alive` existed to stop Supabase's free tier idling the database. On self-hosted
> Postgres it is redundant — **I suggest deleting that route and its schedule.** Confirm.

### 8.4 `.dockerignore` (new)

Based on miqraa's, plus `.next`, `node_modules`, `.env*`, `prisma/migrations` kept in.

---

## 9. Phase 6 — CI workflow

`.github/workflows/ci.yml`, structurally identical to miqraa's, adapted from npm to **pnpm**
and from tsup to **Next.js**.

```
validation ──┬─→ pr-image      (PRs, same-repo, non-dependabot)
             └─→ release ──→ publish-image   (push to main)
```

| Job             | Steps                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validation`    | commitlint (PRs) → pnpm/action-setup + setup-node (`cache: pnpm`) → `pnpm install --frozen-lockfile` → `prisma generate` → `lint` → `type-check` → `next build` |
| `pr-image`      | Buildx → GHCR login → `metadata-action` (`type=ref,event=pr`) → push `pr-<n>`, unversioned                                                                      |
| `release`       | `cycjimmy/semantic-release-action@v4` with `@semantic-release/changelog` + `@semantic-release/git` extra plugins                                                |
| `publish-image` | Push `<version>` + `latest`, `APP_VERSION` build arg                                                                                                            |

Plus `.github/workflows/cleanup-pr-images.yml` — copied from miqraa essentially unchanged
(it is repo-agnostic, driven by `github.event.repository.name`).

**Deviations from miqraa, and why**

- **pnpm, not npm** — this repo has `pnpm-lock.yaml`, `pnpm-workspace.yaml` and a pnpm-specific
  `.npmrc`.
- **No test job** — the project has no test framework. Add `vitest` later and the step slots in.
- **`.nvmrc` to add** — miqraa's CI uses `node-version-file: .nvmrc`; this repo has none.
  Proposing `22`, matching the Dockerfile's `node:22-bookworm-slim`.
- **`typescript.ignoreBuildErrors: true` in `next.config.ts`** — recommend removing it now
  that `tsc` is clean, so the build cannot silently regress. The dedicated `type-check` step
  covers it either way.

---

## 10. Phase 7 — Dependabot, with both reported bugs fixed

### Bug 1 — double scope: `chore(ci)(deps): bump …`

**Root cause.** In miqraa's `.github/dependabot.yml`, the `github-actions` ecosystem sets
`prefix: "chore(ci)"` _and_ `include: "scope"`. When `include: "scope"` is set Dependabot
appends its own `(deps)` scope to whatever prefix you gave it, producing `chore(ci)(deps):`.
Conventional Commits allows exactly one scope, so commitlint rejects the header.

Same defect is present on the `docker` (`chore(docker)`) and `docker-compose`
(`chore(compose)`) ecosystems — they will fail identically the first time they fire.

**Fix.** Never combine a parenthesised prefix with `include: "scope"`. Pick one per ecosystem:

| Ecosystem        | Config                                       | Resulting message                       |
| ---------------- | -------------------------------------------- | --------------------------------------- |
| `npm`            | `prefix: "chore"` + `include: "scope"`       | `chore(deps): …` / `chore(deps-dev): …` |
| `github-actions` | `prefix: "chore(ci)"`, **no** `include`      | `chore(ci): …`                          |
| `docker`         | `prefix: "chore(docker)"`, **no** `include`  | `chore(docker): …`                      |
| `docker-compose` | `prefix: "chore(compose)"`, **no** `include` | `chore(compose): …`                     |

For npm the `include: "scope"` form is worth keeping — `chore(deps)` / `chore(deps-dev)` is
the conventional idiom and distinguishes prod from dev bumps.

### Bug 2 — `body's lines must not be longer than 100 characters [body-max-line-length]`

**Root cause.** `@commitlint/config-conventional` ships
`body-max-line-length: [2, "always", 100]`. Dependabot's commit body embeds upstream release
notes, changelog excerpts and compatibility-score tables, whose lines routinely exceed 100
characters and cannot be wrapped. This is a config problem, not a Dependabot problem —
the same rule would also reject semantic-release's own release commit.

**Fix.** Disable `body-max-line-length` and `footer-max-line-length` in
`commitlint.config.cjs` (§7). Because `wagoid/commitlint-github-action` reads the repo's own
config, this single change fixes the CI validation stage and the local `commit-msg` hook
together.

> **Apply these two fixes to `miqraa-core-api` as well** — that repo has the same latent bugs.
> Say the word and I will do it there in the same pass.

### `.github/dependabot.yml` for this repo

Adapted from miqraa: `npm`, `docker`, `docker-compose`, `github-actions` ecosystems, weekly
Monday 06:00 UTC, major updates ignored, with grouping retuned for this dependency tree:

| Group                                                  | Patterns                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `next`                                                 | `next`, `eslint-config-next`, `@next/*`                                          |
| `react`                                                | `react`, `react-dom`, `@types/react*`                                            |
| `tiptap`                                               | `@tiptap/*`, `reactjs-tiptap-editor`                                             |
| `prisma`                                               | `prisma`, `@prisma/*`                                                            |
| `eslint`                                               | `eslint`, `eslint-*`, `@typescript-eslint/*`                                     |
| `tailwind`                                             | `tailwindcss`, `@tailwindcss/*`, `prettier-plugin-tailwindcss`, `tw-animate-css` |
| `aws-sdk`                                              | `@aws-sdk/*`                                                                     |
| `types`                                                | `@types/*`                                                                       |
| `production-dependencies` / `development-dependencies` | minor + patch catch-alls                                                         |

⚠️ `react`/`react-dom` are pinned exactly (`19.1.1`) — grouping them keeps the pair in lockstep.

---

## 11. Environment variables

### Removed

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`

### Added

| Var                    | Local (MinIO)                 | Deployed (R2)                                |
| ---------------------- | ----------------------------- | -------------------------------------------- |
| `APP_URL`              | `http://localhost:3000`       | per environment                              |
| `S3_ENDPOINT`          | `http://minio:9000`           | `https://<account>.r2.cloudflarestorage.com` |
| `S3_REGION`            | `us-east-1`                   | `auto`                                       |
| `S3_ACCESS_KEY_ID`     | `minioadmin`                  | R2 token                                     |
| `S3_SECRET_ACCESS_KEY` | `minioadmin`                  | R2 token                                     |
| `S3_BUCKET`            | `badir`                       | `badir`                                      |
| `S3_PUBLIC_URL`        | `http://localhost:9000/badir` | CDN domain                                   |
| `S3_FORCE_PATH_STYLE`  | `true`                        | `false`                                      |

### Unchanged

`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_*`,
`CONTACT_EMAIL`, `MAILERLITE_*`, `CRON_SECRET`, `UPSTASH_REDIS_REST_*`

`.env.example` gets rewritten to match.

> `DIRECT_URL` is a Prisma concept, not a Supabase one — kept, pointing at the same
> Postgres as `DATABASE_URL` in non-pooled setups.

---

## 12. Full file manifest

**New:** `.releaserc.json`, `commitlint.config.cjs`, `.nvmrc`, `.dockerignore`,
`docker-compose.yml`, `services/storage.ts`, `.github/workflows/ci.yml`,
`.github/workflows/cleanup-pr-images.yml`, `.github/dependabot.yml`,
`.husky/commit-msg`, `.husky/pre-push`

**Modified:** `Dockerfile`, `package.json`, `next.config.ts`, `.gitignore`, `.env.example`,
`app/layout.tsx`, `lib/auth.ts`, `actions/newsletter.ts`, the 5 storage-consuming actions,
5 cron routes, `types/Statics.ts`, `schemas/documentLinkSchema.ts`, `services/api.ts`,
`.husky/pre-commit`, `app/organizations/page.tsx` _(pending §3.1)_

**Deleted:** `vercel.json`, `lib/supabase/client.ts`, `lib/supabase/server.ts`,
`services/supabase-storage.ts`, and _(pending §8.3)_ `app/api/cron/keep-alive/`

---

## 13. Open questions

1. **`app/organizations/page.tsx`** (§3.1) — apply the `force-dynamic` + `unstable_cache`
   change so the build never touches the DB? _Recommended._ Otherwise the image needs a
   build-time `DATABASE_URL`.
2. **`keep-alive` cron** (§8.3) — delete it? It existed only to stop Supabase's free tier
   idling.
3. **`typescript.ignoreBuildErrors: true`** (§9) — remove it now that `tsc` is clean?
   _Recommended._
4. **Storage data migration** (§4) — do you want the Supabase → R2 copy script in this
   pass, or tracked separately? Nothing here moves existing files.
5. **Fix the same two Dependabot bugs in `miqraa-core-api`** (§10) in this pass?

---

## 14. Suggested execution order

Each phase leaves the tree building, so it can be reviewed independently.

| Order | Phase                 | Rationale                                       |
| ----- | --------------------- | ----------------------------------------------- |
| 1     | §4 Storage → S3       | Largest blast radius; unblocks the build        |
| 2     | §5 Remove Vercel      | Completes the dependency removal                |
| 3     | §7 commitlint + husky | Needed before conventional commits are enforced |
| 4     | §6 semantic-release   | Config only                                     |
| 5     | §8 Docker + compose   | Needs `output: "standalone"` from §5            |
| 6     | §9 CI                 | Needs the Dockerfile to exist                   |
| 7     | §10 Dependabot        | Needs CI to exist to be meaningful              |
