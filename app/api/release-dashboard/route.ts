import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

type GateState = "blocked" | "in_progress" | "complete";
type ReleaseStage =
  | "Development"
  | "Feature Freeze"
  | "Validation"
  | "Release Candidate"
  | "Production";
type ReleaseRecommendation = "Go" | "No-Go";

type ReleaseDashboardData = {
  schemaVersion: "1.0";
  generatedAt: string;
  release: {
    targetVersion: string;
    currentStage: ReleaseStage;
    recommendation: ReleaseRecommendation;
    completedGates: number;
    totalGates: number;
  };
  gatesList: Array<{
    id: "security" | "testing" | "performance" | "deployment" | "launch";
    name: string;
    state: GateState;
  }>;
  findings: {
    blockedCritical: number;
    blockedHigh: number;
  };
  validation: {
    uatStatus: string;
    performanceStatus: string;
    disasterRecoveryStatus: string;
  };
  uat: {
    roles: Array<{
      id: "super_admin" | "platform_admin" | "dispatcher" | "driver" | "client" | "executive";
      name: string;
      status: string;
      state: "not_started" | "in_progress" | "complete" | "blocked";
    }>;
    startedCount: number;
    completeCount: number;
    totalRoles: number;
  };
  releaseReadiness: {
    architecture: string;
    security: string;
    performance: string;
    testing: string;
    monitoring: string;
    documentation: string;
    deployment: string;
  };
  metrics: {
    latestProductionBuild: string;
    testPassRate: string;
    openCriticalFindings: number;
    openHighFindings: number;
    uatProgress: string;
    performanceBaselineStatus: string;
    disasterRecoveryStatus: string;
    overallRecommendation: string;
  };
  gates: {
    security: GateState;
    testing: GateState;
    performance: GateState;
    deployment: GateState;
    launch: GateState;
  };
  sources: {
    readinessChecklist: string;
    securityFindings: string;
    validationEvidence: string;
    rc3Stabilization: string;
  };
};

const DOCS_ROOT = path.join(process.cwd(), "docs");

async function readDoc(relativePath: string): Promise<string> {
  try {
    return await fs.readFile(path.join(DOCS_ROOT, relativePath), "utf8");
  } catch {
    return "";
  }
}

function normalizeStatus(value: string): string {
  const lower = value.trim().toLowerCase();

  if (lower.includes("not applicable") || lower === "n/a") {
    return "Not Applicable";
  }

  if (lower.includes("at risk")) {
    return "At Risk";
  }

  if (lower.includes("not started") || lower.includes("pending") || lower.includes("planned") || lower === "tbd") {
    return "Not Started";
  }

  if (lower.includes("complete") || lower.includes("pass") || lower.includes("approved")) {
    return "Complete";
  }

  if (lower.includes("blocked") || lower.includes("hold") || lower.includes("fail") || lower.includes("no-go")) {
    return "Blocked";
  }

  if (lower.includes("in progress") || lower.includes("partial") || lower.includes("ongoing") || lower.includes("active")) {
    return "In Progress";
  }

  return value.trim() || "Unknown";
}

function extractReadinessArea(markdown: string, area: string): string {
  const escapedArea = area.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`\\|\\s*${escapedArea}\\s*\\|\\s*([^|]+)\\|`, "i"));
  if (!match) {
    return "Unknown";
  }

  return normalizeStatus(match[1]);
}

function extractMetric(markdown: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`-\\s*${escapedLabel}\\s*:\\s*([^\\n]+)`, "i");
  const match = markdown.match(pattern);
  return match?.[1]?.trim() || "Unknown";
}

function extractOverallRecommendation(markdown: string): string {
  const tableMatch = markdown.match(/\|\s*Current Recommendation\s*\|\s*([^|]+)\|/i);
  if (tableMatch?.[1]) {
    return tableMatch[1].trim();
  }

  const inlineMatch = markdown.match(/Current recommendation\s*:\s*([^\n.]+)/i);
  return inlineMatch?.[1]?.trim() || "Unknown";
}

function extractTestPassRate(validationMarkdown: string): string {
  const ratioMatch = validationMarkdown.match(/Pass\s*\((\d+)\s*\/\s*(\d+)\s*tests\)/i);
  if (!ratioMatch) {
    return "Unknown";
  }

  const passed = Number.parseInt(ratioMatch[1], 10);
  const total = Number.parseInt(ratioMatch[2], 10);

  if (!Number.isFinite(passed) || !Number.isFinite(total) || total === 0) {
    return "Unknown";
  }

  const pct = Math.round((passed / total) * 100);
  return `${pct}% (${passed}/${total})`;
}

function extractValidationResult(validationMarkdown: string, activityName: string): string {
  const escapedActivity = activityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rowPattern = new RegExp(`\\|\\s*${escapedActivity}\\s*\\|[^\\n]+\\|\\s*([^|]+)\\|\\s*$`, "im");
  const match = validationMarkdown.match(rowPattern);
  if (!match?.[1]) {
    return "Unknown";
  }

  return normalizeStatus(match[1]);
}

function mapUatState(status: string): "not_started" | "in_progress" | "complete" | "blocked" {
  const normalized = normalizeStatus(status);

  if (normalized === "Complete") {
    return "complete";
  }

  if (normalized === "Blocked") {
    return "blocked";
  }

  if (normalized === "In Progress" || normalized === "At Risk") {
    return "in_progress";
  }

  return "not_started";
}

function extractUatRoleStatus(uatMarkdown: string, roleName: string): string {
  const escapedRole = roleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rowPattern = new RegExp(
    `\\|\\s*${escapedRole}\\s*\\|[^\\n]+\\|\\s*([^|]+)\\|\\s*[^|]+\\|\\s*[^|]+\\|\\s*[^|]+\\|\\s*[^|]+\\|`,
    "im"
  );
  const match = uatMarkdown.match(rowPattern);

  if (!match?.[1]) {
    return "Not Started";
  }

  return normalizeStatus(match[1]);
}

function countFindings(securityFindings: string, severity: "Critical" | "High"): number {
  const lines = securityFindings.split("\n");
  let count = 0;

  for (const line of lines) {
    if (!line.startsWith("| SEC-")) {
      continue;
    }

    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

    if (cells.length < 5) {
      continue;
    }

    const rowSeverity = cells[1]?.toLowerCase();
    const rowStatus = normalizeStatus(cells[4] || "Unknown").toLowerCase();

    if (
      rowSeverity === severity.toLowerCase() &&
      (rowStatus === "blocked" ||
        rowStatus === "in progress" ||
        rowStatus === "not started" ||
        rowStatus === "at risk")
    ) {
      count += 1;
    }
  }

  return count;
}

function computeGateState(input: {
  securityStatus: string;
  performanceStatus: string;
  testingStatus: string;
  monitoringStatus: string;
  launchStatus: string;
  openCritical: number;
  openHigh: number;
  latestBuild: string;
  uatProgress: string;
  drStatus: string;
}): ReleaseDashboardData["gates"] {
  const security =
    input.openCritical > 0
      ? "blocked"
      : input.openHigh > 0
        ? "in_progress"
        : "complete";

  const testing =
    input.testingStatus === "Complete" && input.uatProgress === "Complete"
      ? "complete"
      : input.testingStatus === "Blocked" || input.uatProgress === "Blocked"
        ? "blocked"
        : "in_progress";

  const performance =
    input.performanceStatus === "Complete"
      ? "complete"
      : input.performanceStatus === "Blocked"
        ? "blocked"
        : "in_progress";

  const deployment =
    (input.latestBuild.toLowerCase().includes("pass") ||
      input.latestBuild.toLowerCase().includes("complete")) &&
    input.monitoringStatus === "Complete" &&
    input.drStatus === "Complete"
      ? "complete"
      : input.latestBuild.toLowerCase().includes("fail") || input.latestBuild.toLowerCase().includes("blocked")
        ? "blocked"
        : "in_progress";

  const launch =
    input.launchStatus.toLowerCase().includes("go") &&
    !input.launchStatus.toLowerCase().includes("no-go")
      ? "complete"
      : security === "blocked" || testing === "blocked" || performance === "blocked"
        ? "blocked"
        : "in_progress";

  return {
    security,
    testing,
    performance,
    deployment,
    launch,
  };
}

function deriveStage(readiness: ReleaseDashboardData["releaseReadiness"]): ReleaseStage {
  if (
    readiness.deployment === "Complete" &&
    readiness.testing === "Complete" &&
    readiness.security === "Complete"
  ) {
    return "Release Candidate";
  }

  if (
    readiness.security === "In Progress" ||
    readiness.security === "At Risk" ||
    readiness.performance === "In Progress" ||
    readiness.performance === "At Risk" ||
    readiness.testing === "In Progress" ||
    readiness.testing === "At Risk"
  ) {
    return "Validation";
  }

  if (readiness.architecture === "Complete" && readiness.documentation === "Complete") {
    return "Feature Freeze";
  }

  return "Development";
}

function deriveRecommendation(value: string): ReleaseRecommendation {
  const lower = value.toLowerCase();
  if (lower.includes("go") && !lower.includes("no-go")) {
    return "Go";
  }

  return "No-Go";
}

export async function GET() {
  const readinessChecklist = await readDoc("ReadinessChecklist.md");
  const securityFindings = await readDoc("security/SecurityFindings.md");
  const validationEvidence = await readDoc("validation/ValidationEvidence.md");
  const userAcceptanceTesting = await readDoc("validation/UserAcceptanceTesting.md");
  const rc3Stabilization = await readDoc("releases/RC3-Stabilization.md");

  const architecture = extractReadinessArea(readinessChecklist, "Architecture");
  const security = extractReadinessArea(readinessChecklist, "Security");
  const performance = extractReadinessArea(readinessChecklist, "Performance");
  const testing = extractReadinessArea(readinessChecklist, "Testing");
  const monitoring = extractReadinessArea(readinessChecklist, "Monitoring");
  const documentation = extractReadinessArea(readinessChecklist, "Documentation");
  const deployment = extractReadinessArea(readinessChecklist, "Launch Sign-off");

  const latestProductionBuild = extractMetric(rc3Stabilization, "Latest production build");
  const overallRecommendation = extractOverallRecommendation(rc3Stabilization);

  const openCriticalFindings = countFindings(securityFindings, "Critical");
  const openHighFindings = countFindings(securityFindings, "High");

  const uatProgress = extractValidationResult(validationEvidence, "UAT execution summary");
  const performanceBaselineStatus = extractValidationResult(validationEvidence, "Performance baseline capture");
  const disasterRecoveryStatus = extractValidationResult(validationEvidence, "Disaster recovery drill report");
  const testPassRate = extractTestPassRate(validationEvidence);

  const uatRoles = [
    { id: "super_admin", name: "Super Admin", status: extractUatRoleStatus(userAcceptanceTesting, "Super Admin"), state: "not_started" },
    { id: "platform_admin", name: "Platform Admin", status: extractUatRoleStatus(userAcceptanceTesting, "Platform Admin"), state: "not_started" },
    { id: "dispatcher", name: "Dispatcher", status: extractUatRoleStatus(userAcceptanceTesting, "Dispatcher"), state: "not_started" },
    { id: "driver", name: "Driver", status: extractUatRoleStatus(userAcceptanceTesting, "Driver"), state: "not_started" },
    { id: "client", name: "Client", status: extractUatRoleStatus(userAcceptanceTesting, "Client"), state: "not_started" },
    { id: "executive", name: "Executive", status: extractUatRoleStatus(userAcceptanceTesting, "Executive"), state: "not_started" },
  ] as const;

  const normalizedUatRoles: ReleaseDashboardData["uat"]["roles"] = uatRoles.map((role) => ({
    ...role,
    state: mapUatState(role.status),
  }));

  const startedCount = normalizedUatRoles.filter(
    (role) => role.state === "in_progress" || role.state === "complete"
  ).length;
  const completeCount = normalizedUatRoles.filter((role) => role.state === "complete").length;

  const gates = computeGateState({
    securityStatus: security,
    performanceStatus: performanceBaselineStatus,
    testingStatus: testing,
    monitoringStatus: monitoring,
    launchStatus: overallRecommendation,
    openCritical: openCriticalFindings,
    openHigh: openHighFindings,
    latestBuild: latestProductionBuild,
    uatProgress,
    drStatus: disasterRecoveryStatus,
  });

  const derivedSecurityReadiness =
    gates.security === "complete"
      ? "Complete"
      : gates.security === "blocked"
        ? "Blocked"
        : security;

  const gatesList: ReleaseDashboardData["gatesList"] = [
    { id: "security", name: "Gate 1 Security", state: gates.security },
    { id: "testing", name: "Gate 2 Testing", state: gates.testing },
    { id: "performance", name: "Gate 3 Performance", state: gates.performance },
    { id: "deployment", name: "Gate 4 Deployment", state: gates.deployment },
    { id: "launch", name: "Gate 5 Launch", state: gates.launch },
  ];

  const completedGates = gatesList.filter((gate) => gate.state === "complete").length;

  const payload: ReleaseDashboardData = {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    release: {
      targetVersion: "v1.0.0",
      currentStage: deriveStage({
        architecture,
        security,
        performance,
        testing,
        monitoring,
        documentation,
        deployment,
      }),
      recommendation: deriveRecommendation(overallRecommendation),
      completedGates,
      totalGates: gatesList.length,
    },
    gatesList,
    findings: {
      blockedCritical: openCriticalFindings,
      blockedHigh: openHighFindings,
    },
    validation: {
      uatStatus: uatProgress,
      performanceStatus: performanceBaselineStatus,
      disasterRecoveryStatus,
    },
    uat: {
      roles: normalizedUatRoles,
      startedCount,
      completeCount,
      totalRoles: normalizedUatRoles.length,
    },
    releaseReadiness: {
      architecture,
      security: derivedSecurityReadiness,
      performance,
      testing,
      monitoring,
      documentation,
      deployment,
    },
    metrics: {
      latestProductionBuild,
      testPassRate,
      openCriticalFindings,
      openHighFindings,
      uatProgress,
      performanceBaselineStatus,
      disasterRecoveryStatus,
      overallRecommendation,
    },
    gates,
    sources: {
      readinessChecklist: "docs/ReadinessChecklist.md",
      securityFindings: "docs/security/SecurityFindings.md",
      validationEvidence: "docs/validation/ValidationEvidence.md",
      rc3Stabilization: "docs/releases/RC3-Stabilization.md",
    },
  };

  return NextResponse.json(payload);
}
