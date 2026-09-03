"use client";

type Props = {
  currentMonth: number;
  previousMonth: number;
};

export default function RevenueTrendCard({
  currentMonth,
  previousMonth,
}: Props) {
  const change =
    previousMonth === 0
      ? 0
      : (
          ((currentMonth - previousMonth) /
            previousMonth) *
          100
        );

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">
        Revenue Trend
      </p>

      <h2 className="mt-4 text-3xl font-black text-[#061B33]">
        {change >= 0 ? "+" : ""}
        {change.toFixed(1)}%
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Compared to previous month
      </p>
    </div>
  );
}