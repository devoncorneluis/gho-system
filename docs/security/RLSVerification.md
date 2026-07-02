# RLS Verification

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

## Objective

Verify Row Level Security coverage and policy evidence for tenant-protected tables.

## Reviewed SQL Artifacts

1. [supabase/sql/create_audit_logs.sql](../../supabase/sql/create_audit_logs.sql)
2. [supabase/sql/create_trip_events.sql](../../supabase/sql/create_trip_events.sql)
3. [supabase/sql/create_performance_indexes.sql](../../supabase/sql/create_performance_indexes.sql)
4. [supabase/sql/create_tenant_rls_policies.sql](../../supabase/sql/create_tenant_rls_policies.sql)
5. [tests/unit/rls-policy-artifacts.test.ts](../../tests/unit/rls-policy-artifacts.test.ts)

## Static Result

Static review confirms repository-local RLS artifacts are now present for required tenant tables:

1. ENABLE and FORCE RLS statements exist for each required table in [supabase/sql/create_tenant_rls_policies.sql](../../supabase/sql/create_tenant_rls_policies.sql).
2. CREATE POLICY statements exist for select, insert, update, and delete operations per table.
3. Tenant predicate enforces platform scoping through JWT-resolved platform_id.

## Table Verification Status

| Table | Expected RLS | Policy Evidence In Repo | Status |
| --- | --- | --- | --- |
| trips | Yes | Found (trips_tenant_select/insert/update/delete) | In Progress |
| drivers | Yes | Found (drivers_tenant_select/insert/update/delete) | In Progress |
| vehicles | Yes | Found (vehicles_tenant_select/insert/update/delete) | In Progress |
| user_profiles | Yes | Found (user_profiles_tenant_select/insert/update/delete) | In Progress |
| trip_events | Yes | Found (trip_events_tenant_select/insert/update/delete) | In Progress |
| audit_logs | Yes | Found (audit_logs_tenant_select/insert/update/delete) | In Progress |
| emergency_alerts | Yes | Found (emergency_alerts_tenant_select/insert/update/delete) | In Progress |
| trip_passengers | Yes | Found (trip_passengers_tenant_select/insert/update/delete) | In Progress |

## Interpretation

Repository-local policy evidence is now present. Independent verification in target Supabase environments is still required before moving SEC-003 to Complete.

## Required Evidence to Reach Complete

1. Exported policy definitions per table from target Supabase environments.
2. Mapping of policy names to table and operation (select, insert, update, delete).
3. Independent reviewer confirmation that deployed policies match repository artifacts.

## Verification Test Log

| Test | Expected | Actual | Result |
| --- | --- | --- | --- |
| SQL artifact scan for policy statements | RLS and policies present in repo migrations | RLS enable/force and policy statements found in create_tenant_rls_policies.sql | Complete |
| Policy coverage test for required tables | Every tenant table has CRUD policy evidence | tests/unit/rls-policy-artifacts.test.ts validates required table/action coverage | Complete |
| Standard pipeline validation | Test and production build pass with new SEC-003 artifacts | npm run test:run (29/29) and npm run build passed | Complete |
