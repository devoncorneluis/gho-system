import type { SlaSummary } from "./intelligenceTypes";

export interface SlaEngineInput {
  responseMinutes?: number;
  pickupMinutes?: number;
  arrivalMinutes?: number;
  emergencyAckMinutes?: number;
}

export function buildSlaSummary(input: SlaEngineInput): SlaSummary {
  const responseBreached = (input.responseMinutes ?? 99) > 5;
  const pickupBreached = (input.pickupMinutes ?? 99) > 10;
  const arrivalBreached = (input.arrivalMinutes ?? 99) > 15;
  const emergencyBreached = (input.emergencyAckMinutes ?? 99) > 3;

  const breaches = [responseBreached, pickupBreached, arrivalBreached, emergencyBreached].filter(Boolean).length;
  const warnings = breaches > 0 ? Math.max(1, Math.floor(breaches / 2)) : 0;
  const compliance = Math.max(0, Math.round(100 - breaches * 20));

  return {
    compliance,
    breaches,
    warnings,
  };
}
