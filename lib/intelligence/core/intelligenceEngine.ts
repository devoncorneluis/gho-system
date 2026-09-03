import { calculateWorkloadBalance } from "../dispatch/workloadBalancer";
import { forecastDemand } from "../prediction/demandForecast";
import { predictTripDelay } from "../prediction/delayPredictor";
import { forecastFleetRequirement } from "../prediction/fleetForecast";
import { predictTrafficImpact } from "../prediction/trafficPredictor";
import { predictWeatherRisk } from "../prediction/weatherPredictor";
import { recommendDrivers } from "../dispatch/dispatchAdvisor";
import { recommendRoutes } from "../dispatch/routeOptimizer";
import { recommendVehicles } from "../dispatch/capacityPlanner";
import { assessDriverRisk } from "../risk/driverRisk";
import { assessSecurityRisk } from "../risk/securityRisk";
import { assessSlaRisk } from "../risk/slaRisk";
import { assessTripRiskV2 } from "../risk/tripRisk";
import { assessVehicleRisk } from "../risk/vehicleRisk";
import { buildExecutiveInsights } from "../analytics/executiveInsights";
import { summarizeRecommendationConfidence } from "./confidenceEngine";
import { statusFromScore } from "./scoringEngine";
import { evaluateOperationalRules } from "./rulesEngine";
import type { EnterpriseIntelligenceSnapshot, IntelligenceRisk, IntelligenceState } from "./intelligenceTypes";
import { TRIP_STATUS } from "../../tripStatus";
import { buildDispatchRecommendation, rankRecommendations } from "../recommendations/recommendationEngine";

export function getDefaultIntelligenceState(): IntelligenceState {
  return {
    drivers: [
      {
        id: "driver-1",
        name: "John Smith",
        availability: "Available",
        workload: 2,
        onTimeRate: 96,
        completedTrips: 18,
        cancellationRate: 0.01,
        incidentCount: 0,
        distanceToPickupKm: 2.4,
      },
      {
        id: "driver-2",
        name: "Ayanda Khumalo",
        availability: "Available",
        workload: 5,
        onTimeRate: 91,
        completedTrips: 21,
        cancellationRate: 0.02,
        incidentCount: 1,
        distanceToPickupKm: 4.7,
      },
    ],
    vehicles: [
      {
        id: "vehicle-1",
        name: "Quantum 01",
        status: "Available",
        capacity: 15,
        utilizationRate: 62,
        maintenanceRisk: 0.1,
        operatingCostPerKm: 12,
      },
      {
        id: "vehicle-2",
        name: "Ertiga 02",
        status: "Available",
        capacity: 7,
        utilizationRate: 84,
        maintenanceRisk: 0.2,
        operatingCostPerKm: 8,
      },
    ],
    trips: [
      {
        id: "trip-105",
        code: "GHO-105",
        routeGroup: "Cape Town North",
        passengerCount: 8,
        pickupTime: "06:30",
        status: TRIP_STATUS.ASSIGNED,
        delayMinutes: 4,
        slaTargetMinutes: 15,
      },
    ],
    routes: [
      {
        id: "route-1",
        name: "N1 Direct",
        routeGroup: "Cape Town North",
        distanceKm: 18,
        historicalDelayMinutes: 4,
        trafficDelayMinutes: 3,
      },
    ],
    currentEmergencies: 0,
    historicalDemand: [82, 88, 91, 86, 92, 95, 89],
    weatherRisk: 0.1,
    securityAlerts: 0,
  };
}

export function getEnterpriseIntelligenceSnapshot(state: IntelligenceState = getDefaultIntelligenceState()): EnterpriseIntelligenceSnapshot {
  const risks: IntelligenceRisk[] = [
    ...state.trips.flatMap((trip) => [assessTripRiskV2(trip), assessSlaRisk(trip)]),
    ...state.drivers.map(assessDriverRisk),
    ...state.vehicles.map(assessVehicleRisk),
    assessSecurityRisk(state.securityAlerts || 0),
  ];
  const predictions = [
    ...state.trips.map((trip) => predictTripDelay(trip, state.routes, state.currentEmergencies)),
    forecastDemand(state.historicalDemand),
    predictTrafficImpact(state.routes),
    predictWeatherRisk(state.weatherRisk),
    forecastFleetRequirement(state.trips, state.vehicles),
  ];
  const recommendations = rankRecommendations(
    state.trips.map((trip) => {
      const driver = recommendDrivers(state.drivers, trip)[0];
      const vehicle = recommendVehicles(state.vehicles, trip)[0];
      const route = recommendRoutes(state.routes, trip)[0];
      const risk = risks.find((item) => item.id === `trip-risk-${trip.id}`);
      return buildDispatchRecommendation({ trip, driver, vehicle, route, risk });
    })
  );
  const ruleResults = evaluateOperationalRules(state);
  const insights = [calculateWorkloadBalance(state.drivers), ...buildExecutiveInsights(state)];
  const maxRisk = Math.max(0, ...risks.map((risk) => risk.score));
  const confidence = summarizeRecommendationConfidence(recommendations);

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    status: ruleResults.some((rule) => rule.priority === "critical") ? "critical" : statusFromScore(maxRisk),
    confidence,
    recommendations,
    risks,
    predictions,
    insights,
    explanations: [
      ...ruleResults.map((rule) => rule.message),
      `${recommendations.length} recommendation(s) generated from shared enterprise intelligence engine.`,
    ],
  };
}
