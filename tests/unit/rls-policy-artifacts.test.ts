import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REQUIRED_TABLES = [
  "trips",
  "drivers",
  "vehicles",
  "user_profiles",
  "trip_events",
  "audit_logs",
  "emergency_alerts",
  "trip_passengers",
] as const;

const POLICY_ACTIONS = ["select", "insert", "update", "delete"] as const;
const TENANT_PREDICATE =
  "public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id()";

function loadPolicySql(): string {
  const filePath = path.resolve(process.cwd(), "supabase/sql/create_tenant_rls_policies.sql");
  return readFileSync(filePath, "utf8");
}

describe("SEC-003 RLS policy artifacts", () => {
  const sql = loadPolicySql();

  it("defines tenant id resolver for JWT-bound platform scope", () => {
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.current_platform_id()");
    expect(sql).toContain("auth.jwt() ->> 'platform_id'");
  });

  it("enables and forces RLS for each required tenant table", () => {
    for (const table of REQUIRED_TABLES) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
      expect(sql).toContain(`ALTER TABLE public.${table} FORCE ROW LEVEL SECURITY`);
    }
  });

  it("creates tenant-scoped CRUD policies for each required table", () => {
    for (const table of REQUIRED_TABLES) {
      for (const action of POLICY_ACTIONS) {
        expect(sql).toContain(`${table}_tenant_${action}`);
      }
    }
  });

  it("uses tenant predicate that denies cross-tenant access", () => {
    const predicateCount = sql.split(TENANT_PREDICATE).length - 1;
    expect(predicateCount).toBeGreaterThanOrEqual(REQUIRED_TABLES.length * POLICY_ACTIONS.length);
  });
});
