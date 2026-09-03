"use client";

import { useState } from "react";

import ReportSummaryCards from "./ReportSummaryCards";
import ReportsNavigation from "./ReportsNavigation";
import ExportToolbar from "./ExportToolbar";

import TripsReport, {
  TripReportRow,
} from "./TripsReport";

import FleetReport, {
  FleetReportRow,
} from "./FleetReport";

type Props = {
  tripCount: number;
  driverCount: number;
  vehicleCount: number;
  incidentCount: number;
  activityCount: number;
  activeTrips: number;

  trips: TripReportRow[];
  vehicles: FleetReportRow[];
};

export default function ReportsDashboard({
  tripCount,
  driverCount,
  vehicleCount,
  incidentCount,
  activityCount,
  activeTrips,
  trips,
  vehicles,
}: Props) {
  const [selectedReport, setSelectedReport] =
    useState("Trips");

  const exportRows = trips.map((trip) => ({
    Trip: trip.trip_code ?? "",
    Date: trip.trip_date ?? "",
    Driver: trip.driver_name ?? "",
    Vehicle: trip.vehicle_name ?? "",
    Status: trip.status ?? "",
    Passengers: trip.passenger_count ?? 0,
  }));

  return (
    <div className="space-y-8">

      <ReportSummaryCards
        trips={tripCount}
        drivers={driverCount}
        vehicles={vehicleCount}
        incidents={incidentCount}
        activities={activityCount}
      />

      <ReportsNavigation
        selected={selectedReport}
        onSelect={setSelectedReport}
      />

      <ExportToolbar
        reportName={selectedReport}
        rows={exportRows}
      />

      {selectedReport === "Trips" && (
        <TripsReport trips={trips} />
      )}

      {selectedReport === "Fleet" && (
        <FleetReport
          vehicles={vehicles}
          activeTrips={activeTrips}
        />
      )}

      {selectedReport === "Drivers" && (
        <ComingSoon title="Driver Report" />
      )}

      {selectedReport === "Incidents" && (
        <ComingSoon title="Incident Report" />
      )}

      {selectedReport === "Activities" && (
        <ComingSoon title="Activity Report" />
      )}

      {selectedReport === "Executive" && (
        <ComingSoon title="Executive Report" />
      )}

    </div>
  );
}

function ComingSoon({
  title,
}: {
  title: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-10 shadow text-center">

      <h2 className="text-2xl font-black text-[#061B33]">
        {title}
      </h2>

      <p className="mt-3 text-gray-500">
        This enterprise report will be connected
        during the next build.
      </p>

    </div>
  );
}