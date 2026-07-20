export type QueryHint = {
  table: string;
  selectColumns: string[];
  recommendedIndexColumns: string[];
};

export const CORE_QUERY_HINTS: QueryHint[] = [
  {
    table: "trips",
    selectColumns: ["id", "platform_id", "status", "driver_response", "trip_date"],
    recommendedIndexColumns: ["platform_id", "status", "trip_date"],
  },
  {
    table: "driver_locations",
    selectColumns: ["driver_id", "trip_id", "latitude", "longitude", "updated_at", "is_tracking"],
    recommendedIndexColumns: ["trip_id", "driver_id", "updated_at", "is_tracking"],
  },
  {
    table: "drivers",
    selectColumns: ["id", "platform_id", "availability_status"],
    recommendedIndexColumns: ["platform_id", "availability_status"],
  },
  {
    table: "vehicles",
    selectColumns: ["id", "platform_id", "status"],
    recommendedIndexColumns: ["platform_id", "status"],
  },
  {
    table: "emergency_alerts",
    selectColumns: ["id", "platform_id", "status", "created_at"],
    recommendedIndexColumns: ["platform_id", "status", "created_at"],
  },
];

export function getQueryHint(table: string): QueryHint | undefined {
  return CORE_QUERY_HINTS.find((hint) => hint.table === table);
}
