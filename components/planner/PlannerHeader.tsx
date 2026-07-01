type PlannerHeaderProps = {
  planDate: string;
  shift: string;
  planningMode: string;
  selectedRouteGroupId: string;

  routeGroups: {
    id: string;
    route_name: string;
  }[];

  onDateChange: (value: string) => void;
  onShiftChange: (value: string) => void;
  onPlanningModeChange: (value: string) => void;
  onRouteGroupChange: (value: string) => void;

  onRefresh: () => void;
};

export default function PlannerHeader({
  planDate,
  shift,
  planningMode,
  selectedRouteGroupId,
  routeGroups,
  onDateChange,
  onShiftChange,
  onPlanningModeChange,
  onRouteGroupChange,
  onRefresh,
}: PlannerHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">
        Planning Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="date"
          value={planDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="border p-3 rounded-lg"
        />

        <select
          value={shift}
          onChange={(e) => onShiftChange(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option>06:00 Shift</option>
          <option>18:00 Shift</option>
        </select>

        <select
          value={planningMode}
          onChange={(e) => onPlanningModeChange(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option>By Area</option>
          <option>By Route Group</option>
        </select>

        {planningMode === "By Route Group" && (
          <select
            value={selectedRouteGroupId}
            onChange={(e) => onRouteGroupChange(e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option value="">Select Route Group</option>

            {routeGroups.map((route) => (
              <option key={route.id} value={route.id}>
                {route.route_name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={onRefresh}
          className="bg-orange-500 text-white rounded-lg px-5 py-3 font-bold"
        >
          Refresh Plan
        </button>
      </div>
    </div>
  );
}