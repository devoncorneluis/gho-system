import { describe, expect, it } from "vitest";
import { applyTripMutationScope, assertPlatformScope } from "../../lib/security/tenantScope";

describe("dispatch tenant scope guards", () => {
  it("requires platform scope for tenant-scoped mutations", () => {
    expect(() => assertPlatformScope(undefined)).toThrowError(
      /platformId is required/
    );
    expect(() => assertPlatformScope("  ")).toThrowError(
      /platformId is required/
    );
    expect(assertPlatformScope("platform-a")).toBe("platform-a");
  });

  it("applies id and platform filters to trip mutations", () => {
    const calls: Array<{ column: string; value: string }> = [];

    const query = {
      eq(column: string, value: string) {
        calls.push({ column, value });
        return this;
      },
    };

    applyTripMutationScope(query, "trip-1", "platform-a");

    expect(calls).toEqual([
      { column: "id", value: "trip-1" },
      { column: "platform_id", value: "platform-a" },
    ]);
  });
});
