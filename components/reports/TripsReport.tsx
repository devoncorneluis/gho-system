"use client";

import { useMemo, useState } from "react";
import {
  calculateCompletionRate,
  calculateCancellationRate,
} from "../../lib/reports/reportEngine";

export type TripReportRow = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  shift: string | null;
  area: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  passenger_count: number | null;
  status: string | null;
};

type Props = {
  trips: TripReportRow[];
};

export default function TripsReport({
  trips,
}: Props) {
  const [statusFilter, setStatusFilter] =
    useState("All");

  const filteredTrips = useMemo(() => {
    if (statusFilter === "All") {
      return trips;
    }

    return trips.filter(
      (trip) => trip.status === statusFilter
    );
  }, [trips, statusFilter]);

  const totalTrips = filteredTrips.length;

  const completedTrips = filteredTrips.filter(
    (trip) => trip.status === "Completed"
  ).length;

  const cancelledTrips = filteredTrips.filter(
    (trip) => trip.status === "Cancelled"
  ).length;

  const activeTrips = filteredTrips.filter(
    (trip) =>
      trip.status === "Assigned" ||
      trip.status === "Scheduled" ||
      trip.status === "In Progress"
  ).length;

  const totalPassengers = filteredTrips.reduce(
    (sum, trip) => sum + (trip.passenger_count ?? 0),
    0
  );

  const completionRate =
    calculateCompletionRate(
      completedTrips,
      totalTrips
    );

  const cancellationRate =
    calculateCancellationRate(
      cancelledTrips,
      totalTrips
    );

  return (
    <div className="space-y-6">

      <div className="rounded-2xl bg-white p-6 shadow">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-2xl font-black text-[#061B33]">
              Trips Report
            </h2>

            <p className="text-gray-500">
              Operational transport summary
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border p-3"
          >
            <option>All</option>
            <option>Scheduled</option>
            <option>Assigned</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-6">

        <SummaryCard
          title="Trips"
          value={totalTrips}
        />

        <SummaryCard
          title="Completed"
          value={completedTrips}
        />

        <SummaryCard
          title="Cancelled"
          value={cancelledTrips}
        />

        <SummaryCard
          title="Active"
          value={activeTrips}
        />

        <SummaryCard
          title="Completion %"
          value={`${completionRate}%`}
        />

        <SummaryCard
          title="Passengers"
          value={totalPassengers}
        />

      </div>

      <div className="rounded-2xl bg-white shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Trip
              </th>

              <th className="p-4 text-left">
                Date
              </th>

              <th className="p-4 text-left">
                Driver
              </th>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Passengers
              </th>

              <th className="p-4 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredTrips.map((trip) => (

              <tr
                key={trip.id}
                className="border-t"
              >

                <td className="p-4">
                  {trip.trip_code}
                </td>

                <td className="p-4">
                  {trip.trip_date}
                </td>

                <td className="p-4">
                  {trip.driver_name}
                </td>

                <td className="p-4">
                  {trip.vehicle_name}
                </td>

                <td className="p-4">
                  {trip.passenger_count}
                </td>

                <td className="p-4 font-semibold">
                  {trip.status}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="rounded-2xl bg-white p-6 shadow">

        <div className="flex justify-between">

          <span>
            Completion Rate
          </span>

          <strong>
            {completionRate}%
          </strong>

        </div>

        <div className="mt-3 flex justify-between">

          <span>
            Cancellation Rate
          </span>

          <strong>
            {cancellationRate}%
          </strong>

        </div>

      </div>

    </div>
  );
}

type SummaryProps = {
  title: string;
  value: string | number;
};

function SummaryCard({
  title,
  value,
}: SummaryProps) {
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