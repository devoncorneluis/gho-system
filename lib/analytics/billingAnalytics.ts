export type BillingMetric = {
  revenue: number;
  cost: number;
};

export function calculateMargin(metrics: BillingMetric[]): number {
  if (!metrics.length) return 0;
  const totalRevenue = metrics.reduce((sum, metric) => sum + metric.revenue, 0);
  const totalCost = metrics.reduce((sum, metric) => sum + metric.cost, 0);
  if (!totalRevenue) return 0;
  return Math.round(((totalRevenue - totalCost) / totalRevenue) * 100);
}
