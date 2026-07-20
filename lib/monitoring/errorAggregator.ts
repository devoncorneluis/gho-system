export interface CapturedError {
  id: string;
  source: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
}

export function captureError(source: string, message: string, severity: CapturedError["severity"] = "medium"): CapturedError {
  return {
    id: `err-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`,
    source,
    message,
    severity,
    createdAt: new Date().toISOString(),
  };
}

export function aggregateErrors(errors: CapturedError[]) {
  const bySeverity = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const error of errors) {
    bySeverity[error.severity] += 1;
  }

  return {
    total: errors.length,
    bySeverity,
  };
}
