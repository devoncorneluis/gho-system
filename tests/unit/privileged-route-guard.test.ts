import { describe, expect, it } from "vitest";
import {
  isPlatformAssignmentAllowed,
  isRoleAllowed,
} from "../../lib/security/privilegedRouteGuard";

describe("privileged route guard", () => {
  it("allows only configured roles", () => {
    expect(isRoleAllowed("super_admin", ["super_admin"])).toBe(true);
    expect(isRoleAllowed("admin", ["super_admin"])).toBe(false);
  });

  it("allows super admin to assign any platform", () => {
    expect(
      isPlatformAssignmentAllowed({
        callerRole: "super_admin",
        callerPlatformId: "platform-a",
        targetPlatformId: "platform-b",
      })
    ).toBe(true);
  });

  it("requires admin assignment to stay within caller platform", () => {
    expect(
      isPlatformAssignmentAllowed({
        callerRole: "admin",
        callerPlatformId: "platform-a",
        targetPlatformId: "platform-a",
      })
    ).toBe(true);

    expect(
      isPlatformAssignmentAllowed({
        callerRole: "admin",
        callerPlatformId: "platform-a",
        targetPlatformId: "platform-b",
      })
    ).toBe(false);
  });

  it("blocks non-super-admin assignment when platform is missing", () => {
    expect(
      isPlatformAssignmentAllowed({
        callerRole: "admin",
        callerPlatformId: null,
        targetPlatformId: "platform-a",
      })
    ).toBe(false);

    expect(
      isPlatformAssignmentAllowed({
        callerRole: "admin",
        callerPlatformId: "platform-a",
        targetPlatformId: null,
      })
    ).toBe(false);
  });
});
