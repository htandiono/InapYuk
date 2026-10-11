# Backfill property coordinates

The customer detail page shows a map only when a property has `latitude` and
`longitude`. Seed data has no coordinates, and local, staging and production hold
different data, so every database needs this once. `npm run db:backfill-geo` fills the
missing ones.

What it does, in order of preference per property: geocodes the street address, then
the city, then the province (OpenStreetMap Nominatim, about one request per second).

Guarantees:

- Dry run by default. Nothing is written without `--apply`.
- Only touches rows where a coordinate is `NULL`. An existing pin is never overwritten.
- Safe to re-run. A second run reports `0 propert(ies) without coordinates`.
- Needs only `DATABASE_URL`. No Vercel access, JWT secrets or SMTP settings.

City-level results are approximate. Fix the important ones afterwards in the tenant
edit form (open the property, drag the pin, save).

## Procedure

Run from `apps/api`. The script prints the database it is about to use. Read that
line before adding `--apply`.

1. Pick the database.
   - Local: nothing to do, it reads `apps/api/.env`.
   - Production or staging: copy the Neon connection string (Neon Console > the
     project > Connection details; the pooled and the direct string both work) and
     pass it for this one command only, so it is never written to disk:
     `DATABASE_URL="postgresql://..." npm run db:backfill-geo`
2. Back up first when the target is shared data. In Neon: Branches > Create branch.
   Or `pg_dump "<url>" -Fc -f before-geo.dump`.
3. Dry run and read the output.

   ```
   Database: ep-xxxx.neon.tech/inapyuk
   Mode: DRY RUN
   8 propert(ies) without coordinates
     WOULD Bantul Sunset Homestay: -7.8982543, 110.3855534 (city)
   ```

   `(address)` is a street-level match, `(city)` and `(province)` are approximate.
   `SKIP` means nothing matched.
4. Apply: `DATABASE_URL="postgresql://..." npm run db:backfill-geo -- --apply`
5. Verify. Open a property detail page on the site and check that the **Lokasi**
   section shows the map. Re-run the command: it should report 0 properties.
6. Undo if needed (only for rows you want empty again):
   `UPDATE properties SET latitude = NULL, longitude = NULL WHERE slug = '<slug>';`

## Do not use for this

`npm run db:seed`, `prisma db push` and `prisma migrate reset` change or replace more
than coordinates. Do not run them against production to fix a missing map.

## Without database access

After the form fix is deployed, a tenant can open each property in
**Tenant > Properti > Edit**, wait for the pin, drag it if needed and press **Simpan**.
This works on any environment that serves the web app and needs no connection string.
