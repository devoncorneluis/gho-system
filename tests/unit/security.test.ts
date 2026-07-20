import { describe, expect, it } from "vitest";
import { authorizeCapability } from "../../lib/security/permissionEngine";
import { createValidatedAuditEvent, validateAuditCoverage, validateAuditEvent } from "../../lib/security/auditValidator";
import {
  createInMemorySessionStore,
  SessionManager,
  type SessionStore,
} from "../../lib/security/sessionManager";

describe("security", () => {
  it("enforces platform isolation in authorization", () => {
    const decision = authorizeCapability(
      {
        userId: "user-1",
        platformId: "platform-a",
        tenantId: "tenant-a",
        roles: ["dispatcher"],
      },
      "dispatch.write",
      "platform-b"
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("Platform isolation");
  });

  it("validates audit events and coverage", () => {
    const { event, validation } = createValidatedAuditEvent({
      userId: "user-1",
      platformId: "platform-a",
      action: "dispatch.update",
      success: true,
    });

    expect(validation.valid).toBe(true);

    const result = validateAuditEvent(event);
    expect(result.valid).toBe(true);

    const coverage = validateAuditCoverage([event], 1);
    expect(coverage.valid).toBe(true);
  });

  it("issues and validates sessions", async () => {
    const store: SessionStore = createInMemorySessionStore();

    const manager = new SessionManager(store);
    const session = await manager.issue(
      {
        userId: "user-2",
        platformId: "platform-a",
        tenantId: "tenant-a",
        roles: ["platform_admin"],
      },
      30
    );

    const validation = await manager.validate(session.id);
    expect(validation.valid).toBe(true);
  });
});
