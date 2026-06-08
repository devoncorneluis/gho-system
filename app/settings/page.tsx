export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">
        Settings
      </h1>

      <p className="text-gray-600 mt-2">
        Manage company platform rules, notifications, and import/export tools.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold">🏢 Company Settings</h2>
          <p className="text-gray-600 mt-2">Company name, branding, colors, and details.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold">🔔 Notifications</h2>
          <p className="text-gray-600 mt-2">Trip alerts, driver alerts, and time-change alerts.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold">📥 Import / Export</h2>
          <p className="text-gray-600 mt-2">Excel, CSV, and PDF tools.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold">🕒 Audit Trail</h2>
          <p className="text-gray-600 mt-2">Track who changed trips, drivers, agents, and reports.</p>
        </div>
      </div>
    </main>
  );
}
