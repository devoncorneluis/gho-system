export function capacityStatus(
  passengerCount: number,
  vehicleCapacity: number
) {
  const remaining =
    vehicleCapacity - passengerCount;

  return {
    fits: remaining >= 0,
    remaining,
    utilisation:
      vehicleCapacity === 0
        ? 0
        : Math.round(
            (passengerCount /
              vehicleCapacity) *
              100
          ),
  };
}