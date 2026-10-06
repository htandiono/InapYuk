# InapYuk

Property renting web app. Users compare accommodation prices across dates, tenants manage
properties, availability and seasonal pricing, and both sides handle the booking lifecycle
end to end.

Purwadhika final project by [@htandiono](https://github.com/htandiono) and
[@awanstywn](https://github.com/awanstywn).

## Stack

| Layer    | Choice                                                          |
| -------- | --------------------------------------------------------------- |
| Web      | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui   |
| API      | Express 5, TypeScript, Zod                                       |
| Database | PostgreSQL on Neon, Prisma 7 with the `@prisma/adapter-pg` driver |
| Media    | Cloudinary, with a local-disk fallback for development           |
| Email    | Nodemailer + Handlebars templates                                |
| Hosting  | Vercel - `inapyuk.space` (web) and `api.inapyuk.space` (API)      |

## Repository layout

```
apps/
  web/        Next.js front end
  api/        Express REST API, Prisma schema, seed and scheduled jobs
packages/
  types/      DTOs and enums shared by both apps
docs/         ERD, API contract, sprint plan, workflow guide
scripts/      Backlog-as-code that provisions the GitHub Project board
```

## Getting started

Requirements: Node.js 20.19+, npm 10+, and a Neon PostgreSQL database.

```bash
git clone https://github.com/htandiono/InapYuk.git
cd InapYuk
npm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# edit apps/api/.env and paste your Neon DATABASE_URL and DIRECT_URL

npm run db:migrate
npm run db:seed
npm run dev
```

`npm run dev` starts the API on <http://localhost:8000> and the web app on
<http://localhost:3000>. Health check: <http://localhost:8000/api/health>.

### Seeded accounts

Every seeded account is already verified. The shared password is `Inapyuk123!`.

| Role   | Email                        |
| ------ | ---------------------------- |
| Tenant | `tenant.bali@inapyuk.space`  |
| Tenant | `tenant.jogja@inapyuk.space` |
| User   | `budi@inapyuk.space`         |
| User   | `siti@inapyuk.space`         |

The seed also creates 8 properties, 14 rooms, 90 days of availability, peak season rates in
both nominal and percentage form, and one booking in every order status.

## Scripts

| Command               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Run the API and the web app together               |
| `npm run build`       | Build shared types, then the API, then the web app |
| `npm run typecheck`   | TypeScript across every workspace                  |
| `npm run lint`        | ESLint across every workspace                      |
| `npm run format`      | Prettier write                                     |
| `npm run db:migrate`  | Create and apply a Prisma migration                |
| `npm run db:seed`     | Populate the database (idempotent)                 |
| `npm run db:studio`   | Open Prisma Studio                                 |

## Feature ownership

| Feature                            | Points | Owner        |
| ---------------------------------- | ------ | ------------ |
| Landing page                       | 10     | `awanstywn`  |
| User / tenant auth and profiles    | 40     | `awanstywn`  |
| Property management                | 40     | `awanstywn`  |
| User transaction process           | 35     | `htandiono`  |
| Tenant transaction management      | 25     | `htandiono`  |
| Review                             | 15     | `htandiono`  |
| Report and analysis                | 15     | `htandiono`  |

See [docs/WORKFLOW.md](docs/WORKFLOW.md) for the branch model and the file ownership map,
[docs/ERD.md](docs/ERD.md) for the data model, and
[docs/SPRINT-PLAN.md](docs/SPRINT-PLAN.md) for the sprint breakdown.

Starting Feature 1? Read [docs/HANDOFF-FEATURE-1.md](docs/HANDOFF-FEATURE-1.md) and
[docs/UI.md](docs/UI.md). If you (or your AI tool) need a single rules file, that is
[AGENTS.md](AGENTS.md).

## Scheduled jobs

Booking auto-cancellation, the check-in reminder, and marking a stay finished live in
`apps/api/src/jobs`. The host calls `GET /api/cron/:job` with `CRON_SECRET`. `POST` still
works if you want to trigger one by hand. Locally a small timer runs the same functions.
On Vercel the schedule is `apps/api/vercel.json`, and each job runs once a day.

## Deploy

Two Vercel projects, both from this repo. Leave the install command empty so Vercel
installs the workspace from the repository root.

| App | Root directory | Domain              |
| --- | -------------- | ------------------- |
| Web | `apps/web`     | `inapyuk.space`     |
| API | `apps/api`     | `api.inapyuk.space` |

Web environment:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.inapyuk.space/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://inapyuk.space` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | the Google client id, or leave empty |

Set these before the first web build. Changing them later means deploy again.

API environment, from `apps/api/.env.example`:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection |
| `DIRECT_URL` | Neon direct connection |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://inapyuk.space` |
| `WEB_BASE_URL` | `https://inapyuk.space` |
| `JWT_ACCESS_SECRET` | a random string, at least 16 characters |
| `JWT_REFRESH_SECRET` | a different random string, at least 16 characters |
| `CRON_SECRET` | a random string, at least 8 characters |
| `ENABLE_LOCAL_CRON` | `false` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | required for photos and payment proofs. The server disk does not keep files. |

`WEB_BASE_URL` has to be `https://inapyuk.space`. The login cookie is shared with
`api.inapyuk.space` from that name, so the site can tell that someone is signed in.
Use that custom domain. A `*.vercel.app` host is a public suffix, so a cookie for
`.vercel.app` is not stored.

The saved migration only edits the users table, and a new database does not have that
table yet. After the API env is set, from `apps/api`:

```bash
npx prisma db push
npm run db:seed
```

`db push` does not record migration history. A later `migrate deploy` on that
database needs a baseline first.

Use the production `DATABASE_URL` and `DIRECT_URL` for those two commands. The seed
password for every demo account is `Inapyuk123!`.

The three jobs run once a day. A normal Vercel account only allows that. The unpaid
booking job is `0 2 * * *` in `apps/api/vercel.json` (09:00 Jakarta). A room is free
again as soon as `paymentDeadline` passes; that job only marks the booking cancelled.
If the plan allows a more frequent job, change that one line to `*/5 * * * *`.

`PAYMENT_DEADLINE_MINUTES` defaults to 60 when it is omitted. Set it only to change that.

Feature 2 demo notes: [docs/DEMO-FEATURE-2.md](docs/DEMO-FEATURE-2.md).
