"use client";
type Props = {
  driver: string;
  vehicle: string;
  trip: string;
  passengers: number;
  status: string;
};

export default function EmergencyCard({
  driver,
  vehicle,
  trip,
  passengers,
  status,
}: Props) {
  return (
    <div className="rounded-xl border-2 border-red-500 bg-red-50 p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-red-700">
        🚨 Active Emergency
      </h2>
      <div className="mt-5 space-y-2">
        <p><strong>Driver:</strong> {driver}</p>
        <p><strong>Vehicle:</strong> {vehicle}</p>
        <p><strong>Trip:</strong> {trip}</p>
        <p><strong>Passengers:</strong> {passengers}</p>
        <p><strong>Status:</strong> {status}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded bg-[#061B33] px-4 py-2 font-bold text-white">
          📞 Call Driver
        </button>
        <button className="rounded bg-red-600 px-4 py-2 font-bold text-white">
          🚑 Emergency Services
        </button>
        <button className="rounded bg-green-600 px-4 py-2 font-bold text-white">
          ✔ Resolve
        </button>
      </div>
    </div>
  );
}
