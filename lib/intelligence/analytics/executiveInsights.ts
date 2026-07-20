import type { IntelligenceInsight, IntelligenceState } from "../core/intelligenceTypes";
import { calculateCostInsight } from "./costAnalytics";
import { calculateFleetAvailabilityInsight } from "./fleetAnalytics";
import { calculateProductivityInsight } from "./productivity";
import { calculateUtilizationInsight } from "./utilization";

export function buildExecutiveInsights(state: IntelligenceState): IntelligenceInsight[] {
  return [
    calculateFleetAvailabilityInsight(state.vehicles),
    calculateUtilizationInsight(state.vehicles),
    calculateProductivityInsight(state.drivers),
    calculateCostInsight(state.vehicles, state.routes),
  ];
}
