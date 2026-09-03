type Dashboard = {
  activeCompanies: number;
  platformAdmins: number;
  totalUsers: number;
  monthlyRevenue: number;
  outstandingInvoices: number;
  openSupportTickets: number;
  systemHealth: number;
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
🏢 Active Customer Companies
        </p>
        <h2 className="mt-2 text-4xl font-black text-[#061B33]">
          {dashboard.activeCompanies}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
          ✅ Platform Admins
        </p>
        <h2 className="mt-2 text-4xl font-black text-green-600">
          {dashboard.platformAdmins}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
👥 Total Registered Users
        </p>
        <h2 className="mt-2 text-4xl font-black text-blue-600">
          {dashboard.totalUsers}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
💰 Monthly Revenue
        </p>
        <h2 className="mt-2 text-4xl font-black text-orange-600">
          {dashboard.monthlyRevenue}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
🧾 Outstanding Invoices
        </p>
        <h2 className="mt-2 text-4xl font-black text-yellow-600">
          {dashboard.outstandingInvoices}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
🎫 Open Support Tickets
        </p>
        <h2 className="mt-2 text-4xl font-black text-purple-600">
          {dashboard.openSupportTickets}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-semibold text-gray-500">
🟢 System Health
        </p>
        <h2 className="mt-2 text-4xl font-black text-red-600">
          {dashboard.systemHealth}
        </h2>
      </div>

    </div>
  );
}