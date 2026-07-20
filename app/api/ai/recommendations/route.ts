import { buildDispatchAdvisorSnapshot, type AiOperationsContext } from "../../../../lib/ai";

const sampleContext: AiOperationsContext = {
  trip: {
    id: "trip-gho-105",
    code: "GHO-105",
    passengerCount: 8,
    pickupTime: "06:30",
    routeGroup: "Cape Town North",
    slaTargetMinutes: 15,
  },
  drivers: [
    {
      id: "driver-1",
      name: "John Smith",
      availability: "Available",
      workloadToday: 2,
      onTimePercentage: 96,
      completedTrips: 18,
      cancellationRate: 0.01,
      emergencyIncidents: 0,
      distanceToPickupKm: 2.4,
    },
    {
      id: "driver-2",
      name: "Ayanda Khumalo",
      availability: "Available",
      workloadToday: 5,
      onTimePercentage: 91,
      completedTrips: 21,
      cancellationRate: 0.02,
      emergencyIncidents: 1,
      distanceToPickupKm: 4.7,
    },
  ],
  vehicles: [
    {
      id: "vehicle-1",
      name: "Quantum 01",
      status: "Available",
      capacity: 15,
      requiredCapacity: 8,
      utilizationToday: 62,
      maintenanceRisk: 0.1,
    },
    {
      id: "vehicle-2",
      name: "Ertiga 02",
      status: "Available",
      capacity: 7,
      requiredCapacity: 8,
      utilizationToday: 84,
      maintenanceRisk: 0.2,
    },
  ],
  routes: [
    {
      id: "route-1",
      name: "N1 Direct",
      routeGroup: "Cape Town North",
      distanceKm: 18,
      pickupTime: "06:30",
      historicalDelayMinutes: 4,
      trafficDelayMinutes: 3,
    },
    {
      id: "route-2",
      name: "Voortrekker Alternate",
      routeGroup: "Cape Town North",
      distanceKm: 22,
      pickupTime: "06:30",
      historicalDelayMinutes: 8,
      trafficDelayMinutes: 5,
    },
  ],
  currentEmergencies: 0,
  activeTrafficDataAvailable: true,
  historicalDemand: [82, 88, 91, 86, 92, 95, 89],
};

export async function GET() {
  return Response.json(buildDispatchAdvisorSnapshot([sampleContext]));
}
