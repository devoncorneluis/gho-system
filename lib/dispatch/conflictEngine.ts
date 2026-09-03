export type DispatchConflict = {
  severity: "Low" | "Medium" | "High";
  message: string;
};

export function detectDispatchConflicts(
  options: {
    driverAssigned: boolean;
    vehicleAssigned: boolean;
    capacityOk: boolean;
    driverAvailable: boolean;
  }
): DispatchConflict[] {
  const conflicts: DispatchConflict[] = [];

  if (!options.driverAvailable) {
    conflicts.push({
      severity: "High",
      message: "Driver unavailable.",
    });
  }

  if (options.driverAssigned) {
    conflicts.push({
      severity: "High",
      message: "Driver already assigned.",
    });
  }

  if (options.vehicleAssigned) {
    conflicts.push({
      severity: "High",
      message: "Vehicle already assigned.",
    });
  }

  if (!options.capacityOk) {
    conflicts.push({
      severity: "Medium",
      message:
        "Vehicle capacity insufficient.",
    });
  }

  return conflicts;
}