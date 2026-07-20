export interface PollingStrategy {
  activeIntervalMs: number;
  idleIntervalMs: number;
  backgroundIntervalMs: number;
}

export const DEFAULT_POLLING_STRATEGY: PollingStrategy = {
  activeIntervalMs: 10000,
  idleIntervalMs: 20000,
  backgroundIntervalMs: 60000,
};

export function resolvePollingInterval(
  isVisible: boolean,
  hasRecentInteraction: boolean,
  strategy: PollingStrategy = DEFAULT_POLLING_STRATEGY
): number {
  if (!isVisible) return strategy.backgroundIntervalMs;
  if (!hasRecentInteraction) return strategy.idleIntervalMs;
  return strategy.activeIntervalMs;
}

export function shouldRunBackgroundPolling(lastRunAtIso: string, intervalMs: number, nowIso = new Date().toISOString()): boolean {
  const last = new Date(lastRunAtIso).getTime();
  const now = new Date(nowIso).getTime();
  if (Number.isNaN(last) || Number.isNaN(now)) return true;
  return now - last >= intervalMs;
}
