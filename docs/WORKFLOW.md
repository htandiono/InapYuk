# Git workflow and ownership

## Branches

| Branch      | Purpose                                                                    |
| ----------- | -------------------------------------------------------------------------- |
| `main`      | Release branch. Protected, pull requests only, no direct pushes.            |
| `develop`   | Integration branch. Both of us open pull requests into it.                  |
| `feature/*` | One branch per task, cut from `develop` and merged back through a PR.       |

Branch naming: `feature/<owner>-<scope>`, for example `feature/awan-auth-core` or
`feature/handi-booking-domain`. Use `fix/<owner>-<scope>` for bug fixes during review week.

```
main
 └── develop
      ├── feature/awan-auth-core          (Feature 1)
      └── feature/handi-booking-domain    (Feature 2)
```

## Daily loop

```bash
git checkout develop
git pull origin develop
git checkout -b feature/handi-payment-proof

# ... work, commit ...

git push -u origin feature/handi-payment-proof
gh pr create --base develop --fill
```

Rebase on `develop` before asking for review so the PR stays conflict free:

```bash
git fetch origin
git rebase origin/develop
```

## Commit messages

Conventional Commits, so the history reads as a changelog:

```
feat(booking): create reservation with per-night price snapshot
fix(auth): reject verification tokens that were already used
chore(ci): run typecheck on pull requests
docs(readme): document the seeded accounts
```

## File ownership

Sticking to these paths keeps merge conflicts close to zero. Anything in the shared list
needs a pull request that the other person approves.

### awanstywn - Feature 1

```
apps/api/src/modules/auth/
apps/api/src/modules/users/
apps/api/src/modules/properties/
apps/api/src/modules/categories/
apps/api/src/modules/rooms/
apps/web/src/app/(auth)/
apps/web/src/app/(public)/
apps/web/src/app/tenant/properties/
apps/web/src/components/property/
```

### htandiono - Feature 2

```
apps/api/src/modules/bookings/
apps/api/src/modules/reviews/
apps/api/src/modules/reports/
apps/api/src/modules/notifications/
apps/api/src/jobs/
apps/web/src/app/(user)/orders/
apps/web/src/app/checkout/
apps/web/src/app/tenant/transactions/
apps/web/src/app/tenant/reports/
apps/web/src/components/booking/
```

### Shared - PR reviewed by both

```
apps/api/prisma/schema.prisma
apps/api/prisma/seed*
apps/api/src/config/
apps/api/src/libs/
apps/api/src/middlewares/
apps/api/src/utils/
apps/api/src/services/pricing.service.ts
packages/types/
package.json, tsconfig, lint and CI config
```

## The one shared contract

`apps/api/src/services/pricing.service.ts` resolves a room's nightly price and remaining
capacity for a date range. Feature 1 owns the tenant screens that write `PeakSeasonRate` and
`RoomAvailability`; Feature 2 reads the resolver to quote a stay and to snapshot
`BookingNight` rows at booking time.

Because both features depend on it, changing an exported signature there needs both of us to
approve the PR.

## Why the initial commit already has a database

Feature 2 sits downstream of Feature 1 - bookings need accounts, properties, rooms,
availability and peak season pricing before a single transaction can be tested. Designing the
database is a preparation-phase deliverable, so the schema and a realistic seed dataset were
built jointly before the split. Feature 2 can therefore develop against verified users and
real inventory from day one instead of waiting for Feature 1 to finish.
