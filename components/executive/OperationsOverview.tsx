"use client";

type Props = {
  activeTrips: number;
  awaitingDispatch: number;
  activeEmergencies: number;
  overdueInvoices: number;
};

export default function OperationsOverview({
  activeTrips,
  awaitingDispatch,
  activeEmergencies,
  overdueInvoices,
}: Props) {
  const items = [
    {
      label: "Active Trips",
      value: activeTrips,
      color: "text-blue-600",
    },
    {
      label: "Awaiting Dispatch",
      value: awaitingDispatch,
      color: "text-orange-500",
    },
    {
      label: "Active Emergencies",
      value: activeEmergencies,
      color: "text-red-600",
    },
    {
      label: "Overdue Invoices",
      value: overdueInvoices,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

      <h2 className="text-2xl font-black text-[#061B33]">
        Operations Overview
      </h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border p-5"
          >
            <p className="text-sm text-gray-500">
              {item.label}
            </p>

            <h3
              className={`mt-3 text-3xl font-black ${item.color}`}
            >
              {item.value}
            </h3>
          </div>
        ))}

      </div>

    </div>
  );
}