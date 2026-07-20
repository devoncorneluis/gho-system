import { describe, expect, it } from "vitest";
import {
  evaluateBackupArtifact,
  evaluateRestoreDrill,
  summarizeRecoveryStatus,
} from "../../lib/recovery";

describe("backup recovery engine", () => {
  it("keeps recovery pending when drill evidence is missing", () => {
    const evaluation = evaluateRestoreDrill();

    expect(evaluation.status).toBe("pending");
    expect(evaluation.rtoMinutesActual).toBeNull();
    expect(evaluation.rpoMinutesActual).toBeNull();
  });

  it("passes backup artifacts only after integrity verification", () => {
    expect(evaluateBackupArtifact()).toBe("pending");
    expect(
      evaluateBackupArtifact({
        id: "backup-1",
        createdAt: "2026-07-06T08:00:00.000Z",
      })
    ).toBe("warn");
    expect(
      evaluateBackupArtifact({
        id: "backup-1",
        createdAt: "2026-07-06T08:00:00.000Z",
        verifiedAt: "2026-07-06T08:05:00.000Z",
        integrityCheckPassed: true,
      })
    ).toBe("pass");
  });

  it("evaluates RTO and RPO against targets", () => {
    const evaluation = evaluateRestoreDrill({
      backupCreatedAt: "2026-07-06T07:50:00.000Z",
      startedAt: "2026-07-06T08:00:00.000Z",
      completedAt: "2026-07-06T09:00:00.000Z",
      verificationPassed: true,
      rollbackValidated: true,
    });

    expect(evaluation.status).toBe("pass");
    expect(evaluation.rtoMinutesActual).toBe(60);
    expect(evaluation.rpoMinutesActual).toBe(10);
  });

  it("fails when recovery timing exceeds targets", () => {
    const evaluation = evaluateRestoreDrill({
      backupCreatedAt: "2026-07-06T07:00:00.000Z",
      startedAt: "2026-07-06T08:00:00.000Z",
      completedAt: "2026-07-06T13:00:00.000Z",
      verificationPassed: true,
      rollbackValidated: true,
    });

    expect(evaluation.status).toBe("fail");
  });

  it("summarizes recovery status by severity", () => {
    expect(summarizeRecoveryStatus(["pass", "pass"])).toBe("pass");
    expect(summarizeRecoveryStatus(["pass", "pending"])).toBe("pending");
    expect(summarizeRecoveryStatus(["pass", "warn"])).toBe("warn");
    expect(summarizeRecoveryStatus(["pass", "fail"])).toBe("fail");
  });
});
