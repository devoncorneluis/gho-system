type Passenger = {
  id: string;
  full_name: string | null;
  phone: string | null;
  pickup_address: string | null;
  pickup_area: string | null;
  pickup_time: string | null;
  pickup_status: string | null;
  pickup_order: number | null;
};

type Props = {
  passengers: Passenger[];
};

export default function FleetPassengerManifest({
  passengers,
}: Props) {
  return (
    <div className="mt-6 rounded-lg border bg-white shadow">
      <div className="border-b px-6 py-4">
        <h3 className="text-xl font-bold text-[#0B3A82]">
          Passenger Manifest
        </h3>
      </div>

      {passengers.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No passengers assigned.
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Passenger</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Pickup Area</th>
              <th className="px-4 py-3 text-left">Pickup Time</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {passengers.map((passenger) => (
              <tr
                key={passenger.id}
                className="border-t hover:bg-gray-50"
              >
<td className="px-4 py-3">
  <span
    className={`rounded-full px-2 py-1 text-xs font-semibold ${
      passenger.pickup_status === "Picked Up"
        ? "bg-green-100 text-green-700"
        : passenger.pickup_status === "Next"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {passenger.pickup_status ?? "Pending"}
  </span>
</td>
                <td className="px-4 py-3">
                  {passenger.pickup_order ?? "-"}
                </td>

                <td className="px-4 py-3 font-medium">
                  {passenger.full_name}
                </td>

                <td className="px-4 py-3">
                  {passenger.phone ?? "-"}
                </td>

                <td className="px-4 py-3">
                  {passenger.pickup_area ?? "-"}
                </td>

                <td className="px-4 py-3">
                  {passenger.pickup_time ?? "-"}
                </td>

                <td className="px-4 py-3">
                  {passenger.pickup_status ?? "Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}