"use client";

import { useMemo } from "react";
import {
  calculateFleetAvailability,
} from "../../lib/reports/reportEngine";

export type FleetReportRow = {
  id: string;
  vehicle_name: string | null;
  registration_number: string | null;
  availability_status: string | null;
  assigned_driver: string | null;
};

type Props = {
  vehicles: FleetReportRow[];
  activeTrips: number;
};

export default function FleetReport({
  vehicles,
  activeTrips,
}: Props) {
  const totalVehicles = vehicles.length;

  const availableVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => v.availability_status === "Available"
      ).length,
    [vehicles]
  );

  const unavailableVehicles =
    totalVehicles - availableVehicles;

  const availability =
    calculateFleetAvailability(
      availableVehicles,
      totalVehicles
    );

  return (
    <div className="space-y-6">

      <div className="rounded-2xl bg-white p-6 shadow">

        <h2 className="text-2xl font-black text-[#061B33]">
          Fleet Report
        </h2>

        <p className="mt-2 text-gray-500">
          Fleet utilisation and vehicle availability.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-4">

        <Card
          title="Fleet Size"
          value={totalVehicles}
        />

        <Card
          title="Available"
          value={availableVehicles}
        />

        <Card
          title="Unavailable"
          value={unavailableVehicles}
        />

        <Card
          title="Availability"
          value={`${availability}%`}
        />

      </div>

      <div className="rounded-2xl bg-white shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Registration
              </th>

              <th className="p-4 text-left">
                Driver
              </th>

              <th className="p-4 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {vehicles.map((vehicle) => (

              <tr
                key={vehicle.id}
                className="border-t"
              >

                <td className="p-4">
                  {vehicle.vehicle_name ?? "-"}
                </td>

                <td className="p-4">
                  {vehicle.registration_number ?? "-"}
                </td>

                <td className="p-4">
                  {vehicle.assigned_driver ?? "-"}
                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      vehicle.availability_status ===
                      "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {vehicle.availability_status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="rounded-2xl bg-white p-6 shadow">

        <div className="flex justify-between">

          <span>
            Active Trips
          </span>

          <strong>
            {activeTrips}
          </strong>

        </div>

        <div className="mt-4 flex justify-between">

          <span>
            Fleet Availability
          </span>

          <strong>
            {availability}%
          </strong>

        </div>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black text-[#061B33]">
        {value}
      </p>

    </div>
  );
}