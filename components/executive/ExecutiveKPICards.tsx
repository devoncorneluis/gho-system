"use client";

type Props = {
  revenue: number;
  activePlatforms: number;
  fleetUtilisation: number;
  collectionRate: number;
};

export default function ExecutiveKPICards({
  revenue,
  activePlatforms,
  fleetUtilisation,
  collectionRate,
}: Props) {
  const cards = [
    {
      title: "Revenue This Month",
      value: `R ${revenue.toLocaleString()}`,
      color: "text-green-600",
    },
    {
      title: "Active Platforms",
      value: activePlatforms,
      color: "text-blue-600",
    },
    {
      title: "Fleet Utilisation",
      value: `${fleetUtilisation.toFixed(1)}%`,
      color: "text-orange-500",
    },
    {
      title: "Collection Rate",
      value: `${collectionRate.toFixed(1)}%`,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl bg-white p-6 shadow"
        >
          <p className="text-sm text-gray-500">
            {card.title}
          </p>

          <h2
            className={`mt-3 text-3xl font-black ${card.color}`}
          >
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}