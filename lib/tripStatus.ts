export const TRIP_STATUS = {
  DRAFT: "draft",
  PLANNED: "planned",
  APPROVED: "approved",
  ASSIGNED: "assigned",
  DISPATCHED: "dispatched",
  ACCEPTED: "accepted",
  EN_ROUTE: "en_route",
  PICKING_UP: "picking_up",
  IN_TRANSIT: "in_transit",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const ALLOWED_TRIP_TRANSITIONS = {
  [TRIP_STATUS.DRAFT]: [
    TRIP_STATUS.PLANNED,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.PLANNED]: [
    TRIP_STATUS.APPROVED,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.APPROVED]: [
    TRIP_STATUS.ASSIGNED,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.ASSIGNED]: [
    TRIP_STATUS.DISPATCHED,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.DISPATCHED]: [
    TRIP_STATUS.ACCEPTED,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.ACCEPTED]: [
    TRIP_STATUS.EN_ROUTE,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.EN_ROUTE]: [
    TRIP_STATUS.PICKING_UP,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.PICKING_UP]: [
    TRIP_STATUS.IN_TRANSIT,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.IN_TRANSIT]: [
    TRIP_STATUS.COMPLETED,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.COMPLETED]: [],
  [TRIP_STATUS.CANCELLED]: [],
} as const;

export type TripStatus = typeof TRIP_STATUS[keyof typeof TRIP_STATUS];

export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  [TRIP_STATUS.DRAFT]: "text-gray-500 bg-gray-100",
  [TRIP_STATUS.PLANNED]: "text-indigo-700 bg-indigo-100",
  [TRIP_STATUS.APPROVED]: "text-blue-700 bg-blue-100",
  [TRIP_STATUS.ASSIGNED]: "text-yellow-700 bg-yellow-100",
  [TRIP_STATUS.DISPATCHED]: "text-purple-700 bg-purple-100",
  [TRIP_STATUS.ACCEPTED]: "text-teal-700 bg-teal-100",
  [TRIP_STATUS.EN_ROUTE]: "text-blue-800 bg-blue-200",
  [TRIP_STATUS.PICKING_UP]: "text-orange-800 bg-orange-100",
  [TRIP_STATUS.IN_TRANSIT]: "text-green-800 bg-green-100",
  [TRIP_STATUS.COMPLETED]: "text-green-700 bg-green-200",
  [TRIP_STATUS.CANCELLED]: "text-red-700 bg-red-100",
};

export const TRIP_STATUS_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TRIP_STATUS.DRAFT]: [TRIP_STATUS.PLANNED, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.PLANNED]: [TRIP_STATUS.APPROVED, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.APPROVED]: [TRIP_STATUS.ASSIGNED, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.ASSIGNED]: [TRIP_STATUS.DISPATCHED, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.DISPATCHED]: [TRIP_STATUS.ACCEPTED, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.ACCEPTED]: [TRIP_STATUS.EN_ROUTE, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.EN_ROUTE]: [TRIP_STATUS.PICKING_UP, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.PICKING_UP]: [TRIP_STATUS.IN_TRANSIT, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.IN_TRANSIT]: [TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.COMPLETED]: [],
  [TRIP_STATUS.CANCELLED]: [],
};

export function canTransition(from: TripStatus, to: TripStatus): boolean {
  return TRIP_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionTripStatus(current: string, next: string) {
  const allowed = ALLOWED_TRIP_TRANSITIONS[
    current as keyof typeof ALLOWED_TRIP_TRANSITIONS
  ];
  return allowed?.includes(next as never) ?? false;
}

export function getStatusLabel(status: TripStatus): string {
  switch (status) {
    case TRIP_STATUS.DRAFT:
      return "Draft";
    case TRIP_STATUS.PLANNED:
      return "Planned";
    case TRIP_STATUS.APPROVED:
      return "Approved";
    case TRIP_STATUS.ASSIGNED:
      return "Assigned";
    case TRIP_STATUS.ACCEPTED:
      return "Accepted";
    case TRIP_STATUS.EN_ROUTE:
      return "En Route";
    case TRIP_STATUS.PICKING_UP:
      return "Picking Up";
    case TRIP_STATUS.IN_TRANSIT:
      return "In Transit";
    case TRIP_STATUS.COMPLETED:
      return "Completed";
    case TRIP_STATUS.CANCELLED:
      return "Cancelled";
    default:
      return "Unknown";
  }
}
