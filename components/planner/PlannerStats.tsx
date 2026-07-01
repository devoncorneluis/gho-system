type PlannerStatsProps = {
  activeAgents: number;
  plannedTrips: number;
  planDate: string;
};

export default function PlannerStats({
  activeAgents,
  plannedTrips,
  planDate,
}: PlannerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

      <div className="bg-white rounded-2xl shadow p-5">
        <p className="text-gray-500 font-bold">
          Active Agents
        </p>

        <p className="text-4xl font-black text-[#061B33]">
          {activeAgents}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <p className="text-gray-500 font-bold">
          Planned Trips
        </p>

        <p className="text-4xl font-black text-orange-500">
          {plannedTrips}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <p className="text-gray-500 font-bold">
          Date
        </p>

        <p className="text-2xl font-black text-[#061B33]">
          {planDate}
        </p>
      </div>

    </div>
  );
}