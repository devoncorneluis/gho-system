import MetricCard from "../ui/MetricCard";

type FleetDriver = {
  driver_locations: {
    updated_at: string | null;
  }[] | null;
  trips: {
    trip_status: string | null;
  }[] | null;
};

type Props = {
  drivers: FleetDriver[];
  activeEmergencies: string[];
  isDriverOnline: (updatedAt: string | null | undefined) => boolean;

  onlineDrivers: number;
  offlineDrivers: number;
  activeTrips: number;
  availableDrivers: number;
  gpsReporting: number;
  fleetUtilization: number;
};

export default function FleetSummaryCards({
  drivers,
  activeEmergencies,
  onlineDrivers,
  offlineDrivers,
  activeTrips,
  availableDrivers,
  gpsReporting,
  fleetUtilization,
}: Props) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-4 xl:grid-cols-8">
<MetricCard label="Drivers" value={drivers.length} />

<MetricCard label="Online" value={onlineDrivers} />

<MetricCard label="Offline" value={offlineDrivers} />

<MetricCard label="Active Trips" value={activeTrips} />

      <MetricCard
label="Emergencies"
        value={activeEmergencies.length}
      />

      <MetricCard
label="Available"
        value={availableDrivers}
      />

      <MetricCard
label="GPS Reporting"
        value={gpsReporting}
      />

      <MetricCard
label="Fleet Utilisation"
        value={`${fleetUtilization}%`}
      />
    </div>
  );
}