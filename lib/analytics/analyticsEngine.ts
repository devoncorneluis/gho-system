export function calculateFleetUtilisation(
  activeTrips: number,
  availableVehicles: number
) {
  const total = activeTrips + availableVehicles;

  if (total === 0) return 0;

  return Math.round((activeTrips / total) * 100);
}

export function calculateSafetyScore(
  openIncidents: number,
  emergencyAlerts: number
) {
  if (emergencyAlerts > 0) return 40;

  if (openIncidents > 5) return 60;

  if (openIncidents > 0) return 85;

  return 100;
}

export function calculateOperationalHealth(
  fleetUtilisation: number,
  openIncidents: number
) {
  if (openIncidents > 0)
    return {
      colour: "text-red-600",
      label: "Attention Required",
    };

  if (fleetUtilisation > 90)
    return {
      colour: "text-yellow-600",
      label: "High Utilisation",
    };

  return {
    colour: "text-green-600",
    label: "Healthy",
  };
}