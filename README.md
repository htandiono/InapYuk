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
scripts/      Backlog-as-code that provisions GitHub issues and the project board
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

## Scheduled jobs

Booking auto-cancellation and check-in reminders are plain functions in
`apps/api/src/jobs`, exposed at `POST /api/cron/:job` behind `CRON_SECRET`. Locally an
in-process `node-cron` runner triggers them; on Vercel the schedule in
`apps/api/vercel.json` does. Serverless functions cannot hold a long-lived timer, so the
job logic never depends on one.
