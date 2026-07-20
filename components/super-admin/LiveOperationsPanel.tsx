type Props = {
  activeTrips: number;
  onlineDrivers: number;
  emergencies: number;
};

export default function LiveOperationsPanel({
  activeTrips,
  onlineDrivers,
  emergencies,
}: Props) {
  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold text-[#061B33]">
        🚦 Live Operations Status
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-5">
          <p className="text-sm font-semibold text-gray-500">
            Trips In Progress
          </p>

          <p className="mt-2 text-3xl font-black text-[#061B33]">
            {activeTrips}
          </p>
        </div>

        <div className="rounded-lg border p-5">
          <p className="text-sm font-semibold text-gray-500">
            Drivers Online
          </p>

          <p className="mt-2 text-3xl font-black text-green-600">
            {onlineDrivers}
          </p>
        </div>

        <div className="rounded-lg border p-5">
          <p className="text-sm font-semibold text-gray-500">
            Active Emergencies
          </p>

          <p className="mt-2 text-3xl font-black text-red-600">
            {emergencies}
          </p>
        </div>
      </div>
    </div>
  );
}