# UI notes

Keep Feature 1 and Feature 2 looking like one product. Tokens live in
[`apps/web/src/app/globals.css`](../apps/web/src/app/globals.css). Do not re-init shadcn
with the default zinc theme.

## Look

| Token | Role | Feel |
| --- | --- | --- |
| `--background` | Page | Warm cream, not pure white |
| `--primary` | Buttons, wordmark, links | Teal / jungle green |
| `--accent` | Small highlights, eyebrow text | Coral / terracotta |
| `--foreground` | Body text | Warm dark brown-gray |
| Figtree | `--font-figtree` / `font-sans` | Body and UI |
| Fraunces | `--font-fraunces` / `font-heading` | Wordmark and page titles |

Radius stays modest (`--radius: 0.625rem`). Cards are cream on cream with a light border, not
heavy drop shadows. Buttons that matter can be pill-shaped (`rounded-full`) like the dummy
“Daftar” on the placeholder home.

## Voice

Indonesian, spoken, specific. Write like a friend who knows boarding houses, not like a
booking SaaS landing page.

Good: “Bandingkan harga nginap, baru deh pesan.”
Good: “Harga kamar bisa naik pas long weekend.”
Bad: “Unlock seamless hospitality experiences.”
Bad: “Welcome to your all-in-one property platform.”

`lang="id"` is already set on `<html>`. Keep it. Format money with `formatRupiah` in
`apps/web/src/lib/format.ts`. Status labels use `BOOKING_STATUS_LABEL` from `@inapyuk/types`
(“Menunggu Pembayaran”, not `WAITING_PAYMENT`).

## Layout habits

- Mobile first. Check 360px before 1280px.
- Reuse `src/components/ui/*`. Do not add another component library.
- Call the API through `src/lib/api-client.ts` so errors stay consistent.
- Placeholder home (`src/app/page.tsx`) is a direction, not a finished landing page. When
  Feature 1 replaces it, keep the wordmark, teal, and Indonesian tone.

## What to avoid

- Purple gradients, Inter-only pages, three stacked feature cards with identical icons
- English-only chrome on Indonesian content
- Dark mode as a Sprint 1 task (tokens exist; do not spend time theming it yet)
