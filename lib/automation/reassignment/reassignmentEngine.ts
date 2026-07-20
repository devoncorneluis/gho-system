import type { ReassignmentRecommendation } from "../../../types/recommendation";
import { matchDriver } from "./driverMatcher";
import { matchVehicle } from "./vehicleMatcher";
import { matchRoute } from "./routeMatcher";
import { buildRecommendationScore } from "./recommendationScore";
import type { ReassignmentCandidates } from "../automationTypes";

export interface ReassignmentInput {
  tripId: string;
  passengerCount: number;
  riskScore: number;
  candidates: ReassignmentCandidates;
}

export function buildReassignmentRecommendation(input: ReassignmentInput): ReassignmentRecommendation | undefined {
  if (!input.candidates.drivers.length || !input.candidates.vehicles.length || !input.candidates.routes.length) {
    return undefined;
  }

  const bestDriver = input.candidates.drivers.map(matchDriver).sort((a, b) => b.score - a.score)[0];
  const bestVehicle = input.candidates.vehicles
    .map((vehicle) => matchVehicle(vehicle, input.passengerCount))
    .sort((a, b) => b.score - a.score)[0];
  const bestRoute = input.candidates.routes.map(matchRoute).sort((a, b) => b.score - a.score)[0];

  const score = buildRecommendationScore({
    driverScore: bestDriver.score,
    vehicleScore: bestVehicle.score,
    routeScore: bestRoute.score,
    riskScore: input.riskScore,
  });

  return {
    tripId: input.tripId,
    recommendedDriverId: bestDriver.candidate.driverId,
    recommendedVehicleId: bestVehicle.candidate.vehicleId,
    recommendedRouteId: bestRoute.candidate.routeId,
    confidence: score.confidence,
    reasons: [
      ...score.reasons,
      { code: "driver_reason", message: bestDriver.reasons[0] || "Driver selected by score." },
      { code: "vehicle_reason", message: bestVehicle.reasons[0] || "Vehicle selected by score." },
      { code: "route_reason", message: bestRoute.reasons[0] || "Route selected by score." },
    ],
  };
}
