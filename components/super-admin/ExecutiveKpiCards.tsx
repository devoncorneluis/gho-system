type Dashboard = {
  activeTrips: number;
  completedTrips: number;
  onlineDrivers: number;
  activeVehicles: number;
  pendingBilling: number;
  pendingPayroll: number;
  emergencies: number;
};

type Props = {
  dashboard: Dashboard;
};

export default function ExecutiveKpiCards({
  dashboard,
}: Props) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
          🚐 Active Trips
        </p>
        <h2 className="mt-2 text-4xl font-black text-[#061B33]">
          {dashboard.activeTrips}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
          ✅ Completed Trips
        </p>
        <h2 className="mt-2 text-4xl font-black text-green-600">
          {dashboard.completedTrips}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
          👨‍✈️ Drivers Online
        </p>
        <h2 className="mt-2 text-4xl font-black text-blue-600">
          {dashboard.onlineDrivers}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
          🚗 Active Vehicles
        </p>
        <h2 className="mt-2 text-4xl font-black text-orange-600">
          {dashboard.activeVehicles}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
          💰 Pending Billing
        </p>
        <h2 className="mt-2 text-4xl font-black text-yellow-600">
          {dashboard.pendingBilling}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
          💵 Pending Payroll
        </p>
        <h2 className="mt-2 text-4xl font-black text-purple-600">
          {dashboard.pendingPayroll}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
          🚨 Open Emergencies
        </p>
        <h2 className="mt-2 text-4xl font-black text-red-600">
          {dashboard.emergencies}
        </h2>
      </div>

    </div>
  );
}