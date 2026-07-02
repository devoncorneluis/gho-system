# UAT Data Seed

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

## Objective

Create a deterministic Gate 2 dataset with a dedicated UAT tenant and role accounts.

## Seed Artifact

1. Script: [../../scripts/seed_uat_dataset.js](../../scripts/seed_uat_dataset.js)
2. Scope: tenant, role users, agents, drivers, vehicles, trips, trip passengers, emergency alert
3. Behavior: idempotent upsert where table id is present

## Required Environment Variables

1. SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
2. SUPABASE_SERVICE_ROLE_KEY

## Execution

```bash
node scripts/seed_uat_dataset.js
```

## Seeded UAT Accounts

1. super_admin: [uat.superadmin@gho.example](mailto:uat.superadmin@gho.example)
2. admin: [uat.platformadmin@gho.example](mailto:uat.platformadmin@gho.example)
3. dispatcher: [uat.dispatcher@gho.example](mailto:uat.dispatcher@gho.example)
4. driver: [uat.driver@gho.example](mailto:uat.driver@gho.example)
5. client: [uat.client@gho.example](mailto:uat.client@gho.example)
6. executive: [uat.executive@gho.example](mailto:uat.executive@gho.example)

## Seeded UAT Dataset

1. Platform: GHO UAT Tenant
2. Agents: 2
3. Drivers: 2
4. Vehicles: 2
5. Trips: 2
6. Trip passengers: 2
7. Emergency alerts: 1

## Notes

1. The script retries upserts by removing unknown columns detected from schema-cache errors.
2. The script strips unknown columns and retries when schema variants are encountered.
3. The current user_profiles role constraint does not include dispatcher, client, or executive values; these accounts are mapped to admin at profile level for seed compatibility.
4. If a table is not present, the script skips it and logs a warning.
5. This artifact supports repeatable UAT runs, regression checks, and release-candidate validation.
