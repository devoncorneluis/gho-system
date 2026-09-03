type Props = {
  trips: number;
  drivers: number;
  vehicles: number;
  incidents: number;
  activities: number;
};

export default function ReportSummaryCards({
  trips,
  drivers,
  vehicles,
  incidents,
  activities,
}: Props) {
  const cards = [
    {
      title: "Trips",
      value: trips,
      colour: "text-[#061B33]",
    },
    {
      title: "Drivers",
      value: drivers,
      colour: "text-blue-600",
    },
    {
      title: "Vehicles",
      value: vehicles,
      colour: "text-green-600",
    },
    {
      title: "Incidents",
      value: incidents,
      colour: "text-red-600",
    },
    {
      title: "Activities",
      value: activities,
      colour: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl bg-white p-6 shadow"
        >
          <p className="text-sm text-gray-500">
            {card.title}
          </p>

          <p
            className={`mt-3 text-4xl font-black ${card.colour}`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
