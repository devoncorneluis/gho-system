type Props = {
  immediate: number;
  attention: number;
  emergencies: number;
  deviations: number;
  gpsOffline: number;
  available: number;
  onSelect: (
    filter:
      | "Immediate"
      | "Attention"
      | "GPS Offline"
      | "Deviation"
      | "Emergency"
      | "Available"
  ) => void;
};

export default function OperationsAlertBar({
  immediate,
  attention,
  emergencies,
  deviations,
  gpsOffline,
  available,
  onSelect,
}: Props) {
const cards: {
  title: string;
  value: number;
  colour: string;
  icon: string;
  action:
    | "Immediate"
    | "Attention"
    | "GPS Offline"
    | "Deviation"
    | "Emergency"
    | "Available";
}[] = [
  {
    title: "Immediate",
    value: immediate,
    colour: "bg-red-100 text-red-700 border-red-300",
    icon: "🔴",
    action: "Immediate",
  },
  {
    title: "Attention",
    value: attention,
    colour: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: "🟠",
    action: "Attention",
  },
  {
    title: "Emergencies",
    value: emergencies,
    colour: "bg-red-50 text-red-600 border-red-200",
    icon: "🚨",
    action: "Emergency",
  },
  {
    title: "Route Deviations",
    value: deviations,
    colour: "bg-orange-100 text-orange-700 border-orange-300",
    icon: "📍",
    action: "Deviation",
  },
  {
    title: "GPS Offline",
    value: gpsOffline,
    colour: "bg-gray-100 text-gray-700 border-gray-300",
    icon: "📡",
    action: "GPS Offline",
  },
  {
    title: "Available",
    value: available,
    colour: "bg-green-100 text-green-700 border-green-300",
    icon: "🚗",
    action: "Available",
  },
];
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
<div
  key={card.title}
  onClick={() => onSelect(card.action)}
          className={`rounded-lg border p-4 shadow-sm ${card.colour} cursor-pointer hover:scale-105 transition-transform`}
        >
          <div className="text-2xl">{card.icon}</div>

          <div className="mt-2 text-3xl font-bold">
            {card.value}
          </div>

          <div className="text-sm font-medium">
            {card.title}
          </div>
        </div>
      ))}
    </div>
  );
}