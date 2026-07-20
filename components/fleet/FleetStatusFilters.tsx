type Filter =
  | "all"
  | "online"
  | "offline"
  | "active"
  | "emergency";

type Props = {
  statusFilter: Filter;
  setStatusFilter: (filter: Filter) => void;
};

export default function FleetStatusFilters({
  statusFilter,
  setStatusFilter,
}: Props) {
  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "active", label: "Active Trips" },
    { value: "emergency", label: "Emergencies" },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => setStatusFilter(filter.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === filter.value
              ? "bg-[#0B3A82] text-white"
              : "border bg-white text-gray-700"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}