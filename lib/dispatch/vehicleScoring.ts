export type VehicleScore = {
  vehicleId: string;
  score: number;
  reasons: string[];
};

export function scoreVehicle(vehicleId: string, status: string, capacity: number, fuelLevel: number): VehicleScore {
  const statusWeight = status === "Available" ? 0.45 : 0.15;
  const capacityWeight = Math.min(1, capacity / 10);
  const fuelWeight = fuelLevel / 100;
  const score = Math.round((statusWeight * 100 + capacityWeight * 60 + fuelWeight * 40) * 10) / 10;

  return {
    vehicleId,
    score,
    reasons: [
      status === "Available" ? "Ready for assignment" : "Not immediately available",
      `Capacity ${capacity}`,
      `Fuel ${fuelLevel}%`,
    ],
  };
}
