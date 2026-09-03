"use client";
import OperationsTimelinePanel from "./OperationsTimelinePanel";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ActionGuardrailTelemetry,
  ControlTowerAction,
  ControlTowerSnapshot,
} from "../../lib/automation/automationFacade";
import { evaluateControlTower } from "../../lib/automation/automationFacade";
import { resolvePollingInterval } from "../../lib/performance/pollingEngine";
import ActivityFeedPanel from "./ActivityFeedPanel";
import ActionCenterPanel from "./ActionCenterPanel";
import AutomationStatusPanel from "./AutomationStatusPanel";
import EnterpriseIntelligencePanel from "./EnterpriseIntelligencePanel";
import EscalationQueuePanel from "./EscalationQueuePanel";
import NotificationsPanel from "./NotificationsPanel";
import OperationsMap from "./OperationsMap";
import RecommendationDrawer from "./RecommendationDrawer";
import RecommendationPanel from "./RecommendationPanel";
import WorkflowQueuePanel from "./WorkflowQueuePanel";
import LiveFleetStatusPanel from "./LiveFleetStatusPanel";
import LiveDispatchQueuePanel from "./LiveDispatchQueuePanel";
type SummaryCard = {
  key: keyof ControlTowerSnapshot["summaryCards"];
  label: string;
  icon: string;
};

const SUMMARY_CARDS: SummaryCard[] = [
  { key: "fleet", label: "Fleet", icon: "🚐" },
  { key: "dispatch", label: "Dispatch", icon: "📡" },
  { key: "sla", label: "SLA", icon: "🧭" },
  { key: "delay", label: "Delay", icon: "⏱" },
  { key: "risk", label: "Risk", icon: "🛡" },
  { key: "emergencies", label: "Emergencies", icon: "🚨" },
  { key: "automation", label: "Automation", icon: "🤖" },
];

const EMPTY_SNAPSHOT: ControlTowerSnapshot = {
  recommendation: undefined,
  recommendationDetails: undefined,

  fleetStatus: [],
  timeline: [],

  escalations: [],

  workflows: {
    running: 0,
    waiting: 0,
    completed: 0,
    failed: 0,
    paused: 0,
  },

  automationStatus: {
    rulesLoaded: 0,
    recommendationsToday: 0,
    escalationsToday: 0,
    workflowsRunning: 0,
    automationHealth: "Healthy",
    lastEvaluation: new Date().toISOString(),
  },

  monitoring: {
    overallStatus: "healthy",
    checks: [],
    errorCountLastHour: 0,
    queueDepth: 0,
    realtimeConnected: true,
    capturedAt: new Date().toISOString(),
  },

  summaryCards: {
    fleet: 0,
    dispatch: 0,
    sla: 0,
    delay: 0,
    risk: 0,
    emergencies: 0,
    automation: 0,
  },

  auditTrail: [],
};

export default function OperationsGrid() {
  const [snapshot, setSnapshot] = useState<ControlTowerSnapshot>(EMPTY_SNAPSHOT);
  const [loadingAction, setLoadingAction] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastInteractionAt, setLastInteractionAt] = useState<string>(new Date().toISOString());

  const refresh = useCallback(async (action?: ControlTowerAction) => {
    setLoadingAction(Boolean(action));
    const next = await evaluateControlTower(action);
    setSnapshot(next);
    setLoadingAction(false);
  }, []);

  const logGuardrailEvent = useCallback(async (event: ActionGuardrailTelemetry) => {
    const next = await evaluateControlTower(undefined, event);
    setSnapshot(next);
  }, []);

  const registerInteraction = useCallback(() => {
    setLastInteractionAt(new Date().toISOString());
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsVisible(!document.hidden);
    }

    function handleInteraction() {
      registerInteraction();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleInteraction);
    window.addEventListener("pointerdown", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [registerInteraction]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [refresh]);

  useEffect(() => {
    const interactionAgeMs = Date.now() - new Date(lastInteractionAt).getTime();
    const hasRecentInteraction = Number.isFinite(interactionAgeMs) && interactionAgeMs < 45_000;
    const intervalMs = resolvePollingInterval(isVisible, hasRecentInteraction);

    const timer = setInterval(() => {
      refresh();
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [isVisible, lastInteractionAt, refresh]);

  const cards = useMemo(
    () =>
      SUMMARY_CARDS.map((card) => ({
        ...card,
        value: snapshot.summaryCards[card.key],
      })),
    [snapshot.summaryCards]
  );

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {cards.map((card) => (
          <div key={card.key} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">{card.label}</p>
              <span>{card.icon}</span>
            </div>
            <p className="mt-3 text-2xl font-black text-[#061B33]">{card.value}</p>
          </div>
        ))}
      </div>

<div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
  <OperationsMap />
</div>

<LiveDispatchQueuePanel />
<EnterpriseIntelligencePanel />

<div className="grid gap-6 xl:grid-cols-2">
  <RecommendationPanel
    recommendation={snapshot.recommendation}
    details={snapshot.recommendationDetails}
    onApprove={() => refresh("approve_recommendation")}
    onIgnore={() => refresh("resolve_alert")}
    onViewReasoning={() => setDrawerOpen(true)}
  />

  <ActionCenterPanel
    onAction={(action) => refresh(action)}
    onGuardrailEvent={logGuardrailEvent}
    busy={loadingAction}
    monitoring={snapshot.monitoring}
  />
</div>

<div className="grid gap-6 xl:grid-cols-2">
  <LiveFleetStatusPanel fleet={snapshot.fleetStatus} />

  <EscalationQueuePanel escalations={snapshot.escalations} />
</div>
<div className="grid gap-6">
  <OperationsTimelinePanel events={snapshot.timeline} />
</div>
<div className="grid gap-6 xl:grid-cols-2">
  <WorkflowQueuePanel statuses={snapshot.workflows} />

  <AutomationStatusPanel
    status={snapshot.automationStatus}
    monitoring={snapshot.monitoring}
  />
</div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ActivityFeedPanel />
        <NotificationsPanel />
      </div>

      <RecommendationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        details={snapshot.recommendationDetails}
      />
    </section>
  );
}
