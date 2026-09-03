"use client";

export type ExecutiveAlert = {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
};

type Props = {
  alerts: ExecutiveAlert[];
};

export default function ExecutiveAlerts({
  alerts,
}: Props) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-2xl font-black text-[#061B33]">
          Executive Alerts
        </h2>

        <p className="mt-4 text-gray-500">
          No active alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h2 className="text-2xl font-black text-[#061B33]">
        Executive Alerts
      </h2>

      <div className="mt-6 space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <span className="font-semibold">
              {alert.title}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                alert.severity === "high"
                  ? "bg-red-100 text-red-700"
                  : alert.severity === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {alert.severity.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
