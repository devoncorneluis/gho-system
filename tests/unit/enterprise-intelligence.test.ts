import { describe, expect, it } from "vitest";
import {
  calculateConfidence,
  evaluateOperationalRules,
  forecastDemand,
  forecastFleetRequirement,
  getDefaultIntelligenceState,
  getEnterpriseIntelligenceSnapshot,
  predictTrafficImpact,
  recommendDrivers,
  recommendRoutes,
  recommendVehicles,
  scoreDriverForTrip,
  scoreRouteForTrip,
  scoreVehicleForTrip,
  statusFromScore,
  summarizeRecommendationConfidence,
  weightedScore,
} from "../../lib/intelligence";
import { calculateCostInsight } from "../../lib/intelligence/analytics/costAnalytics";
import { buildExecutiveInsights } from "../../lib/intelligence/analytics/executiveInsights";
import { calculateFleetAvailabilityInsight } from "../../lib/intelligence/analytics/fleetAnalytics";
import { calculateProductivityInsight } from "../../lib/intelligence/analytics/productivity";
import { calculateUtilizationInsight } from "../../lib/intelligence/analytics/utilization";
import { predictTripDelay } from "../../lib/intelligence/prediction/delayPredictor";
import { predictWeatherRisk } from "../../lib/intelligence/prediction/weatherPredictor";
import { actionForPriority } from "../../lib/intelligence/recommendations/actionPlanner";
import { buildDispatchRecommendation } from "../../lib/intelligence/recommendations/recommendationEngine";
import { assessDriverRisk } from "../../lib/intelligence/risk/driverRisk";
import { assessSecurityRisk } from "../../lib/intelligence/risk/securityRisk";
import { assessSlaRisk } from "../../lib/intelligence/risk/slaRisk";
import { assessTripRiskV2 } from "../../lib/intelligence/risk/tripRisk";
import { assessVehicleRisk } from "../../lib/intelligence/risk/vehicleRisk";

const state = getDefaultIntelligenceState();
const trip = state.trips[0];
const driver = state.drivers[0];
const vehicle = state.vehicles[0];
const route = state.routes[0];

describe("enterprise intelligence engine", () => {
  it("calculates weighted scores", () => {
    expect(weightedScore([{ value: 100, weight: 1 }, { value: 50, weight: 1 }])).toBe(75);
  });

  it("maps score to status", () => {
    expect(statusFromScore(20)).toBe("healthy");
    expect(statusFromScore(45)).toBe("watch");
    expect(statusFromScore(70)).toBe("risk");
    expect(statusFromScore(90)).toBe("critical");
  });

  it("scores driver selection", () => {
    expect(scoreDriverForTrip(driver, trip).score).toBeGreaterThan(70);
  });

  it("ranks recommended drivers", () => {
    expect(recommendDrivers(state.drivers, trip)[0].id).toBe("driver-1");
  });

  it("scores vehicle capacity planning", () => {
    expect(scoreVehicleForTrip(vehicle, trip).score).toBeGreaterThan(70);
  });

  it("ranks vehicles", () => {
    expect(recommendVehicles(state.vehicles, trip)[0].id).toBe("vehicle-1");
  });

  it("scores routes", () => {
    expect(scoreRouteForTrip(route, trip).score).toBeGreaterThan(50);
  });

  it("ranks routes", () => {
    expect(recommendRoutes(state.routes, trip)[0].id).toBe("route-1");
  });

  it("predicts trip delay", () => {
    expect(predictTripDelay(trip, state.routes, state.currentEmergencies).value).toBeGreaterThan(0);
  });

  it("forecasts demand", () => {
    expect(forecastDemand(state.historicalDemand).value).toBeGreaterThan(80);
  });

  it("predicts traffic impact", () => {
    expect(predictTrafficImpact(state.routes).value).toBe(3);
  });

  it("predicts weather risk", () => {
    expect(predictWeatherRisk(0.7).priority).toBe("high");
  });

  it("forecasts fleet requirement", () => {
    expect(forecastFleetRequirement(state.trips, state.vehicles).value).toBe(0);
  });

  it("assesses trip risk", () => {
    expect(assessTripRiskV2({ ...trip, delayMinutes: 20 }).priority).toBe("critical");
  });

  it("assesses driver risk", () => {
    expect(assessDriverRisk({ ...driver, onTimeRate: 70, incidentCount: 2 }).score).toBeGreaterThan(30);
  });

  it("assesses vehicle risk", () => {
    expect(assessVehicleRisk({ ...vehicle, maintenanceRisk: 0.9 }).priority).toBe("medium");
  });

  it("assesses SLA risk", () => {
    expect(assessSlaRisk({ ...trip, delayMinutes: 30 }).priority).toBe("critical");
  });

  it("assesses security risk", () => {
    expect(assessSecurityRisk(3).priority).toBe("high");
  });

  it("calculates utilization insight", () => {
    expect(calculateUtilizationInsight(state.vehicles).value).toContain("%");
  });

  it("calculates productivity insight", () => {
    expect(calculateProductivityInsight(state.drivers).title).toBe("Driver productivity");
  });

  it("calculates fleet availability insight", () => {
    expect(calculateFleetAvailabilityInsight(state.vehicles).status).toBe("healthy");
  });

  it("calculates cost insight", () => {
    expect(calculateCostInsight(state.vehicles, state.routes).value).toContain("R");
  });

  it("builds executive insights", () => {
    expect(buildExecutiveInsights(state)).toHaveLength(4);
  });

  it("calculates confidence", () => {
    expect(calculateConfidence([{ id: "1", label: "A", score: 90, reasons: [] }], 10)).toBeGreaterThan(75);
  });

  it("summarizes recommendation confidence", () => {
    expect(summarizeRecommendationConfidence([{ id: "r", title: "R", priority: "low", confidence: 80, action: "Proceed", explanation: [] }])).toBe(80);
  });

  it("plans action by priority", () => {
    expect(actionForPriority("critical")).toBe("Escalate immediately");
  });

  it("builds dispatch recommendation", () => {
    const recommendation = buildDispatchRecommendation({
      trip,
      driver: scoreDriverForTrip(driver, trip),
      vehicle: scoreVehicleForTrip(vehicle, trip),
      route: scoreRouteForTrip(route, trip),
      risk: assessTripRiskV2(trip),
    });

    expect(recommendation.explanation.length).toBeGreaterThan(0);
  });

  it("evaluates operational rules", () => {
    expect(evaluateOperationalRules({ ...state, currentEmergencies: 1 }).some((rule) => rule.id === "active-emergency")).toBe(true);
  });

  it("generates unified intelligence snapshot", () => {
    const snapshot = getEnterpriseIntelligenceSnapshot(state);

    expect(snapshot.recommendations.length).toBeGreaterThan(0);
    expect(snapshot.risks.length).toBeGreaterThan(0);
    expect(snapshot.predictions.length).toBeGreaterThan(0);
    expect(snapshot.insights.length).toBeGreaterThan(0);
  });

  it("marks snapshot critical when active emergency rule fires", () => {
    const snapshot = getEnterpriseIntelligenceSnapshot({ ...state, currentEmergencies: 1 });

    expect(snapshot.status).toBe("critical");
    expect(snapshot.explanations.some((item) => item.includes("Active emergency"))).toBe(true);
  });
});
