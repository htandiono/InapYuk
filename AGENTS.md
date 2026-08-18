# InapYuk — instructions for humans and AI coding agents

This file is the project contract. Cursor, Copilot, Claude Code, Windsurf, Codex, and similar tools should read it before editing anything.

You are working on a two-person Purwadhika final project. Do not rebuild the stack, do not redesign the database, and do not take files that belong to the other person.

## People

| Person | GitHub | Owns |
| --- | --- | --- |
| Hendrik | `htandiono` | Feature 2 — bookings, payments, reviews, reports |
| Awan | `awanstywn` | Feature 1 — landing, auth, profiles, property management |

If the current user / git identity is `awanstywn`, you are on Feature 1. Read [docs/HANDOFF-FEATURE-1.md](docs/HANDOFF-FEATURE-1.md) next.

## Do not touch (unless the task is explicitly shared)

Feature 1 must not edit Feature 2 paths, and the other way around.

**Feature 2 (htandiono)**

- `apps/api/src/modules/bookings/`
- `apps/api/src/modules/reviews/`
- `apps/api/src/modules/reports/`
- `apps/api/src/modules/notifications/`
- `apps/api/src/jobs/`
- `apps/web/src/app/(user)/`
- `apps/web/src/app/checkout/`
- `apps/web/src/app/tenant/transactions/`
- `apps/web/src/app/tenant/reports/`
- `apps/web/src/components/booking/`

**Shared — propose a change, do not silently rewrite**

- `apps/api/prisma/schema.prisma` and seed files
- `apps/api/src/services/pricing.service.ts` (exported signatures)
- `apps/api/src/libs/`, `middlewares/`, `utils/`, `config/`
- `packages/types/`
- root `package.json`, CI, Tailwind tokens in `apps/web/src/app/globals.css`

Schema rule: **additive only**. Do not drop or rename columns, enums, or relations that already exist. Feature 2 already codes against this schema and the seed.

## Stack (already chosen)

npm workspaces: Next.js 16 App Router (`apps/web`) + Express 5 (`apps/api`) + Prisma 7 + PostgreSQL. Shared DTOs live in `packages/types`. Do not introduce Nest, tRPC, Redux, another CSS framework, or a second database.

## UI

Follow [docs/UI.md](docs/UI.md). Short version:

- Cream background, teal primary, warm coral accent. Not default shadcn zinc.
- Body: Figtree. Headings / wordmark: Fraunces (`font-heading`).
- Copy is Indonesian, casual, specific. No generic SaaS English. No purple-on-white AI look.
- Mobile-first. Reuse `apps/web/src/components/ui/*`. Use `src/lib/api-client.ts` for API calls.

## API conventions

- Envelope: `{ success, message, data }` via `sendSuccess` / `sendError`.
- Lists: server-side pagination, filter, sort. Use `toPrismaPageArgs`.
- Validate with Zod + `validateBody` / `validateQuery`.
- Guard routes with `authenticate`, `requireRole`, `requireVerified`, `requireTenant`.
- File uploads: profile `.jpg .jpeg .png .gif`; payment proof `.jpg .png`; max 1MB.
- Keep files under 200 lines and functions under 15 lines (graded).

## Data you can rely on

`npm run db:seed` creates verified users, tenants, properties, rooms, 90 days of availability, peak season rates, and a booking in every status. Password for every seeded account: `Inapyuk123!`.

Do not delete seed emails. Feature 2 demos against them.

## Git

- Branch from `develop`: `feature/awan-<scope>` or `feature/handi-<scope>`.
- PR into `develop`, not `main`.
- Conventional Commits: `feat(auth): ...`, `fix(property): ...`.
- Do not force-push `main` or `develop`.

## Before you call a task done

```bash
npm run typecheck
npm run lint
```

Read the issue's acceptance criteria on the GitHub Project board.
