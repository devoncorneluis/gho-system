type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  colour: "green" | "blue" | "yellow" | "red";
};

type Props = {
  events: TimelineEvent[];
};

export default function FleetOperationsTimeline({
  events,
}: Props) {
  return (
    <div className="mt-6 rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold text-[#0B3A82]">
        Operations Timeline
      </h2>

      {events.length === 0 ? (
        <p className="text-gray-500">No recent activity.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between border-b pb-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    event.colour === "green"
                      ? "bg-green-500"
                      : event.colour === "blue"
                      ? "bg-blue-500"
                      : event.colour === "yellow"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />

                <span className="font-medium">{event.title}</span>
              </div>

              <span className="text-sm text-gray-500">
                {event.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}