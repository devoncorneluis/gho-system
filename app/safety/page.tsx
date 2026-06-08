export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">
        Safety Center
      </h1>

      <p className="text-gray-600 mt-2">
        Manage emergency alerts, incidents, and safety records.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold">🚨 Panic Alerts</h2>
          <p className="text-gray-600 mt-2">View emergency alerts from drivers or agents.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold">📋 Incident Reports</h2>
          <p className="text-gray-600 mt-2">Track breakdowns, delays, accidents, and issues.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold">📞 Emergency Contacts</h2>
          <p className="text-gray-600 mt-2">Store company and driver emergency contact details.</p>
        </div>
      </div>
    </main>
  );
}
