import type { SlaMetrics } from "../../types/analytics";

export interface SlaSample {
  targetMinutes: number;
  actualMinutes: number;
  onTime: boolean;
}

export function calculateSlaCompliance(samples: SlaSample[]): SlaMetrics {
  if (!samples.length) {
    return { compliance: 0, target: 0, onTimeCount: 0, totalTrips: 0 };
  }

  const onTimeCount = samples.filter((sample) => sample.onTime).length;
  const compliance = Math.round((onTimeCount / samples.length) * 100);
  const target = Math.max(...samples.map((sample) => sample.targetMinutes));

  return {
    compliance,
    target,
    onTimeCount,
    totalTrips: samples.length,
  };
}
