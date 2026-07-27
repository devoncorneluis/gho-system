"use client";

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  performed_by: string | null;
  colour: "green" | "blue" | "yellow" | "red" | "purple";
  created_at: string;
};

type Props = {
  events: TimelineEvent[];
};

const colourClasses = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

export default function TripTimeline({
  events,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow">

      <h2 className="mb-6 text-xl font-bold text-[#0B3A82]">
        Trip Timeline
      </h2>

      {events.length === 0 ? (
        <p className="text-gray-500">
          No timeline events recorded.
        </p>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex gap-4"
            >
              <div
                className={`mt-1 h-4 w-4 rounded-full ${colourClasses[event.colour]}`}
              />

              <div className="flex-1">

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold">
                    {event.title}
                  </h3>

                  <span className="text-xs text-gray-500">
                    {new Date(
                      event.created_at
                    ).toLocaleString()}
                  </span>

                </div>

                <p className="text-sm text-gray-600 mt-1">
                  {event.description}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {event.performed_by}
                </p>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}