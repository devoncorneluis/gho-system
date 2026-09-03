"use client";

import { useMemo } from "react";

export type DriverReportRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  status: string | null;
  availability_status: string | null;
  assigned_vehicle: string | null;
};

type Props = {
  drivers: DriverReportRow[];
  activeTrips: number;
  incidentCount: number;
};

export default function DriverReport({
  drivers,
  activeTrips,
  incidentCount,
}: Props) {
  const totalDrivers = drivers.length;

  const availableDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) =>
          driver.availability_status === "Available"
      ).length,
    [drivers]
  );

  const onDutyDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) => driver.status === "On Duty"
      ).length,
    [drivers]
  );

  const offlineDrivers =
    totalDrivers - onDutyDrivers;

  return (
    <div className="space-y-6">

      <div className="rounded-2xl bg-white p-6 shadow">

        <h2 className="text-2xl font-black text-[#061B33]">
          Driver Performance Report
        </h2>

        <p className="mt-2 text-gray-500">
          Driver utilisation, operational status and fleet readiness.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-5">

        <Card
          title="Drivers"
          value={totalDrivers}
        />

        <Card
          title="Available"
          value={availableDrivers}
        />

        <Card
          title="On Duty"
          value={onDutyDrivers}
        />

        <Card
          title="Offline"
          value={offlineDrivers}
        />

        <Card
          title="Incidents"
          value={incidentCount}
        />

      </div>

      <div className="rounded-2xl bg-white shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Driver
              </th>

              <th className="p-4 text-left">
                Phone
              </th>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Duty
              </th>

              <th className="p-4 text-left">
                Availability
              </th>

            </tr>

          </thead>

          <tbody>

            {drivers.map((driver) => (

              <tr
                key={driver.id}
                className="border-t"
              >

                <td className="p-4 font-semibold">
                  {driver.full_name}
                </td>

                <td className="p-4">
                  {driver.phone ?? "-"}
                </td>

                <td className="p-4">
                  {driver.assigned_vehicle ?? "-"}
                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      driver.status === "On Duty"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {driver.status ?? "-"}
                  </span>

                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      driver.availability_status === "Available"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {driver.availability_status ?? "-"}
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
            Driver Availability
          </span>

          <strong>
            {totalDrivers === 0
              ? 0
              : Math.round(
                  (availableDrivers /
                    totalDrivers) *
                    100
                )}
            %
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