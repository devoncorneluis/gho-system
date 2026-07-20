# UAT Demo Seed

This folder contains deterministic seed SQL for the Gate 2 UAT and demo environment.

## Dataset

| Area | Count / Value |
| --- | --- |
| Company | Acme Manufacturing |
| Platform | Cape Town Operations |
| Platform Admin | Operations Manager |
| Drivers | 8 |
| Vehicles | 8 |
| Agents | 100 |
| Route Groups | 10 |
| Today's Trips | 15 |
| Completed Trips | 20 |
| Future Trips | 10 |
| Trip Passengers | 100 |
| Active Emergencies | 1 |

## Execution

Run the reusable seed runner:

```bash
node --experimental-strip-types scripts/seed-uat.ts
```

Reset and reseed from a known state:

```bash
node --experimental-strip-types scripts/reset-uat.ts
```

## Required Environment

1. `DATABASE_URL` or `SUPABASE_DB_URL` for SQL execution with `psql`.
2. `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`.
3. `SUPABASE_SERVICE_ROLE_KEY`.

## Notes

1. Seed rows use fixed UUIDs and the `uat_demo` marker where the destination schema has a matching column.
2. The SQL helper filters unknown columns so the seed can tolerate schema variants.
3. Supabase Auth users are created by `scripts/seed-uat.ts`, not by SQL.
4. `client@gho.demo` and `executive@gho.demo` are seeded as active login accounts, but the current application role router maps unsupported profile roles to `admin` until dedicated auth routing exists.

## Status Artifact

After a successful run, the seed runner writes `.uat-seed-status.json` for the Release Dashboard.

```json
{
  "schemaVersion": "1.0",
  "seedVersion": "1.0.0",
  "generatedAt": "2026-07-06T00:00:00.000Z",
  "build": "v1.0.0-rc1",
  "platform": "Cape Town Operations",
  "drivers": 8,
  "vehicles": 8,
  "agents": 100,
  "trips": 15,
  "passengers": 100,
  "emergencies": 1
}
```
