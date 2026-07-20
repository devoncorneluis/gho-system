export type RecoveryStatus = "pending" | "pass" | "warn" | "fail";

export interface RecoveryTargets {
  rtoMinutes: number;
  rpoMinutes: number;
}

export interface BackupArtifact {
  id: string;
  createdAt: string;
  verifiedAt?: string;
  integrityCheckPassed?: boolean;
  sizeBytes?: number;
  storageLocation?: string;
}

export interface RestoreDrillEvidence {
  startedAt: string;
  completedAt?: string;
  backupCreatedAt?: string;
  verificationPassed?: boolean;
  rollbackValidated?: boolean;
  evidenceReference?: string;
  deviations?: string[];
}

export interface RecoveryEvaluation {
  status: RecoveryStatus;
  statusLabel: string;
  rtoMinutesActual: number | null;
  rpoMinutesActual: number | null;
  rtoTargetMinutes: number;
  rpoTargetMinutes: number;
  backupStatus: RecoveryStatus;
  restoreStatus: RecoveryStatus;
  verificationStatus: RecoveryStatus;
  rollbackStatus: RecoveryStatus;
  deviations: string[];
}

export const DEFAULT_RECOVERY_TARGETS: RecoveryTargets = {
  rtoMinutes: 240,
  rpoMinutes: 15,
};

const STATUS_LABELS: Record<RecoveryStatus, string> = {
  pending: "Pending Drill",
  pass: "Pass",
  warn: "At Risk",
  fail: "Fail",
};

function minutesBetween(startIso?: string, endIso?: string): number | null {
  if (!startIso || !endIso) {
    return null;
  }

  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }

  return Math.round((end - start) / 60000);
}

export function getRecoveryStatusLabel(status: RecoveryStatus): string {
  return STATUS_LABELS[status];
}

export function evaluateBackupArtifact(backup?: BackupArtifact): RecoveryStatus {
  if (!backup) {
    return "pending";
  }

  if (backup.integrityCheckPassed === false) {
    return "fail";
  }

  if (!backup.verifiedAt || backup.integrityCheckPassed !== true) {
    return "warn";
  }

  return "pass";
}

export function evaluateRestoreDrill(
  evidence?: RestoreDrillEvidence,
  targets: RecoveryTargets = DEFAULT_RECOVERY_TARGETS
): RecoveryEvaluation {
  const rtoMinutesActual = minutesBetween(evidence?.startedAt, evidence?.completedAt);
  const rpoMinutesActual = minutesBetween(evidence?.backupCreatedAt, evidence?.startedAt);
  const backupStatus: RecoveryStatus = evidence?.backupCreatedAt ? "pass" : "pending";

  const restoreStatus: RecoveryStatus =
    rtoMinutesActual === null
      ? "pending"
      : rtoMinutesActual > targets.rtoMinutes
        ? "fail"
        : rtoMinutesActual > targets.rtoMinutes * 0.8
          ? "warn"
          : "pass";

  const verificationStatus: RecoveryStatus =
    evidence?.verificationPassed === undefined
      ? "pending"
      : evidence.verificationPassed
        ? "pass"
        : "fail";

  const rollbackStatus: RecoveryStatus =
    evidence?.rollbackValidated === undefined
      ? "pending"
      : evidence.rollbackValidated
        ? "pass"
        : "fail";

  const rpoStatus: RecoveryStatus =
    rpoMinutesActual === null
      ? "pending"
      : rpoMinutesActual > targets.rpoMinutes
        ? "fail"
        : rpoMinutesActual > targets.rpoMinutes * 0.8
          ? "warn"
          : "pass";

  const statuses = [backupStatus, restoreStatus, verificationStatus, rollbackStatus, rpoStatus];
  const status = summarizeRecoveryStatus(statuses);

  return {
    status,
    statusLabel: getRecoveryStatusLabel(status),
    rtoMinutesActual,
    rpoMinutesActual,
    rtoTargetMinutes: targets.rtoMinutes,
    rpoTargetMinutes: targets.rpoMinutes,
    backupStatus,
    restoreStatus,
    verificationStatus,
    rollbackStatus,
    deviations: evidence?.deviations || [],
  };
}

export function summarizeRecoveryStatus(statuses: RecoveryStatus[]): RecoveryStatus {
  if (statuses.includes("fail")) {
    return "fail";
  }

  if (statuses.includes("warn")) {
    return "warn";
  }

  if (statuses.includes("pending")) {
    return "pending";
  }

  return "pass";
}

export function buildRecoveryEvidenceRecord(input: {
  tester: string;
  environment: string;
  evidenceReference: string;
  backup?: BackupArtifact;
  drill?: RestoreDrillEvidence;
  targets?: RecoveryTargets;
}) {
  const evaluation = evaluateRestoreDrill(input.drill, input.targets || DEFAULT_RECOVERY_TARGETS);

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    tester: input.tester,
    environment: input.environment,
    evidenceReference: input.evidenceReference,
    backup: input.backup || null,
    drill: input.drill || null,
    evaluation,
  };
}
