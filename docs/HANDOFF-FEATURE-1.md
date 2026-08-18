# Feature 1 handoff — awanstywn

You own **Feature 1**: landing page, user/tenant auth and profiles, and property management (categories, properties, rooms, availability, peak season rates).

Hendrik (`htandiono`) owns Feature 2 (bookings, payments, reviews, reports) on a separate set of files. The schema, seed, and shared infra are already in the repo so both of you can start Sprint 1 without waiting on each other.

If you use Cursor, Copilot, Claude, Windsurf, or any other coding agent, point it at **`AGENTS.md`** in the repo root first, then this file. Paste the starter prompt at the bottom of this page.

## First 20 minutes

1. Accept the GitHub invite on https://github.com/htandiono/InapYuk
2. Clone **this repo**, not a fork (you are a collaborator):

```bash
git clone https://github.com/htandiono/InapYuk.git
cd InapYuk
git checkout develop
npm install
```

3. Copy env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

4. Point `DATABASE_URL` and `DIRECT_URL` in `apps/api/.env` at **your own** local Postgres (or your own Neon branch). Do not share one database with Hendrik while coding — `migrate reset` would wipe his test bookings.

5. Apply schema + seed:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Web: http://localhost:3000 — API: http://localhost:8000/api/health

Seeded logins (all verified, password `Inapyuk123!`):

| Role | Email |
| --- | --- |
| Tenant | `tenant.bali@inapyuk.space` |
| Tenant | `tenant.jogja@inapyuk.space` |
| User | `budi@inapyuk.space` |
| User | `siti@inapyuk.space` |

6. Open the board: https://github.com/users/htandiono/projects/1 — filter **Feature = Feature 1**, **Sprint = Sprint 1**.

## What you implement

Route stubs already exist. Fill them in; do not replace the folder layout.

| Area | API | Web |
| --- | --- | --- |
| Auth | `apps/api/src/modules/auth/` | `apps/web/src/app/(auth)/` |
| Profiles | `apps/api/src/modules/users/` | profile pages under `(auth)` / tenant |
| Catalog + landing | `apps/api/src/modules/properties/` | `apps/web/src/app/(public)/` and replace `src/app/page.tsx` |
| Categories | `apps/api/src/modules/categories/` | tenant category UI |
| Rooms, availability, peak season | `apps/api/src/modules/rooms/` | `apps/web/src/app/tenant/properties/` |

Reuse, do not reimplement:

- JWT + guards: `apps/api/src/libs/jwt.ts`, `apps/api/src/middlewares/auth.middleware.ts`
- Mailer templates: `email-verification.hbs`, `password-reset.hbs`
- Uploads: `uploadProfileImage` / Cloudinary helpers
- Pricing for the calendar: `apps/api/src/services/pricing.service.ts`
- DTOs: `@inapyuk/types` (`packages/types`)
- HTTP helpers: `sendSuccess`, `validateBody`, `toPrismaPageArgs`

## Do not break these

1. **Prisma schema** — additive changes only (new optional field, new index). Never drop/rename `User`, `TenantProfile`, `VerificationToken`, `Property`, `Room`, `RoomAvailability`, `PeakSeasonRate`, `Booking`, `BookingNight`, or their enums. Hendrik's Feature 2 already depends on them.
2. **Seed emails and password** — keep `Inapyuk123!` and the accounts above. Add more rows if you want; do not replace the dataset.
3. **`resolveRoomPricing` / `applyAdjustment` signatures** — Feature 2 quotes and snapshots nights through this. If a peak-season rule needs changing, open a PR and ask Hendrik to review.
4. **`packages/types` enums** — `BookingStatus`, `UserRole`, etc. must stay in sync with Prisma. If you add a type for a Feature 1 payload, add it; do not rewrite Feature 2 types.
5. **Feature 2 folders** listed in `AGENTS.md`. You will get merge conflicts and lose points for “his” work if an agent “helpfully” implements checkout.
6. **CSS tokens** in `apps/web/src/app/globals.css` — do not reset them to default shadcn zinc/slate. See [UI.md](UI.md).
7. **`main` / `develop`** — never push straight to them. Always `feature/awan-...` → PR → `develop`.

If an AI suggests `prisma migrate reset` on a shared cloud DB, say no. Reset is fine on **your** local database only.

## Sprint 1 (do this first)

Auth is the blocker for Hendrik's later screens. Land this before polishing the landing page.

1. Registration endpoints + pages (separate user and tenant)
2. Email verification + set password (token single-use, 1 hour, password hashed)
3. Login / refresh / JWT
4. Client session + route guards: unverified users get a banner and disabled booking actions, not a silent 404; tenants cannot open user routes and vice versa

Planned auth endpoints are listed in `apps/api/src/modules/auth/auth.routes.ts`. Spec details: email register does **not** take a password; password is set on the verification page.

Sprint-by-sprint map: [SPRINT-PLAN.md](SPRINT-PLAN.md). Schema pictures: [ERD.md](ERD.md). Git rules: [WORKFLOW.md](WORKFLOW.md).

## UI direction already in the repo

`apps/web/src/app/page.tsx` is a placeholder, not the final landing page. Keep the voice (Indonesian, slightly informal) and the cream/teal look when you replace it in Sprint 2. Full notes in [UI.md](UI.md).

## How to work with any AI

1. Open the repo root as the workspace (not `apps/web` alone).
2. Tell the tool to read `AGENTS.md` and this file before it writes code.
3. Paste **one GitHub issue** at a time. Do not ask it to “implement all of Feature 1”.
4. After it edits, run `npm run typecheck` yourself.

### Starter prompt (copy this)

```
You are helping me implement Feature 1 of InapYuk, a property-renting web app.

Read these files before writing any code:
- AGENTS.md
- docs/HANDOFF-FEATURE-1.md
- docs/UI.md
- docs/WORKFLOW.md

I am awanstywn. I only own Feature 1 paths. Do not edit Feature 2 folders, do not drop Prisma models, do not restyle globals.css to default shadcn.

Stack is already set: Next.js 16 App Router, Express, Prisma 7, packages/types. Fill in the existing module stubs. Reuse jwt, mailer, upload, pricing.service, and sendSuccess.

Work on this single issue only:
<paste the GitHub issue title + acceptance criteria>

When you are done, list the files you changed and how to verify them.
```

## Questions

Ping Hendrik before changing anything in the shared list. For Feature 1 implementation details (auth pages, property forms, calendar UI), you decide — that is your 90 points plus mentor score.
