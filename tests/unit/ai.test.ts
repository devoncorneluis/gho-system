import { describe, expect, it } from "vitest";
import type { AiOperationsContext } from "../../lib/ai";
import { predictDelay } from "../../lib/ai/delayPredictor";
import { scoreDriver } from "../../lib/ai/driverScoring";
import { calculateConfidenceScore, generateRecommendation } from "../../lib/ai/recommendationEngine";
import { scoreVehicle } from "../../lib/ai/vehicleScoring";

const context: AiOperationsContext = {
  trip: {
    id: "trip-1",
    code: "GHO-105",
    passengerCount: 8,
    pickupTime: "06:30",
    routeGroup: "North",
    slaTargetMinutes: 15,
  },
  drivers: [
    {
      id: "driver-1",
      name: "John Smith",
      availability: "Available",
      workloadToday: 2,
      onTimePercentage: 96,
      completedTrips: 20,
      cancellationRate: 0.01,
      emergencyIncidents: 0,
      distanceToPickupKm: 2,
    },
    {
      id: "driver-2",
      name: "Busy Driver",
      availability: "On Trip",
      workloadToday: 7,
      onTimePercentage: 82,
      completedTrips: 12,
      cancellationRate: 0.08,
      emergencyIncidents: 2,
      distanceToPickupKm: 10,
    },
  ],
  vehicles: [
    {
      id: "vehicle-1",
      name: "Quantum",
      status: "Available",
      capacity: 15,
      requiredCapacity: 8,
      utilizationToday: 60,
      maintenanceRisk: 0.1,
    },
    {
      id: "vehicle-2",
      name: "Small Car",
      status: "Available",
      capacity: 4,
      requiredCapacity: 8,
      utilizationToday: 40,
      maintenanceRisk: 0.1,
    },
  ],
  routes: [
    {
      id: "route-1",
      name: "Direct",
      routeGroup: "North",
      distanceKm: 18,
      pickupTime: "06:30",
      historicalDelayMinutes: 4,
      trafficDelayMinutes: 3,
    },
  ],
  currentEmergencies: 0,
  activeTrafficDataAvailable: true,
  historicalDemand: [80, 82, 84],
};

describe("AI operations engine", () => {
  it("scores available low-workload drivers higher", () => {
    const best = scoreDriver(context.drivers[0]);
    const busy = scoreDriver(context.drivers[1]);

    expect(best.score).toBeGreaterThan(busy.score);
    expect(best.reasons).toContain("Available for dispatch");
  });

  it("penalizes vehicles that do not fit passenger capacity", () => {
    const fit = scoreVehicle(context.vehicles[0]);
    const tooSmall = scoreVehicle(context.vehicles[1]);

    expect(fit.score).toBeGreaterThan(tooSmall.score);
    expect(tooSmall.reasons).toContain("Capacity below passenger demand");
  });

  it("predicts delay from historical, traffic, emergency, and demand inputs", () => {
    const prediction = predictDelay({
      ...context,
      currentEmergencies: 1,
      trip: {
        ...context.trip,
        passengerCount: 11,
      },
    });

    expect(prediction.predictedDelayMinutes).toBeGreaterThan(10);
    expect(prediction.riskLevel).toBe("Medium");
  });

  it("generates a recommendation with explanation and confidence", () => {
    const recommendation = generateRecommendation(context);

    expect(recommendation.bestDriver?.name).toBe("John Smith");
    expect(recommendation.bestVehicle?.name).toBe("Quantum");
    expect(recommendation.confidenceScore).toBeGreaterThan(70);
    expect(recommendation.explanation.length).toBeGreaterThan(0);
  });

  it("calculates confidence from driver, vehicle, route, and risk fit", () => {
    const highConfidence = calculateConfidenceScore(95, 90, 88, 10);
    const lowerConfidence = calculateConfidenceScore(70, 65, 60, 60);

    expect(highConfidence).toBeGreaterThan(lowerConfidence);
  });
});
