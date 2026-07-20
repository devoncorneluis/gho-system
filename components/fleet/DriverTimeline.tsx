type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  colour: "green" | "blue" | "yellow" | "red";
};

type Props = {
  events: TimelineEvent[];
};

export default function DriverTimeline({
  events,
}: Props) {
  return (
    <div className="mt-6 rounded-lg border bg-white p-4 shadow">
      <h3 className="mb-4 text-lg font-bold text-[#0B3A82]">
        Driver Timeline
      </h3>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">
          No events recorded.
        </p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3"
            >
              <div
                className={`mt-1 h-3 w-3 rounded-full ${
                  event.colour === "green"
                    ? "bg-green-500"
                    : event.colour === "blue"
                    ? "bg-blue-500"
                    : event.colour === "yellow"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />

              <div>
                <p className="font-medium">
                  {event.title}
                </p>

                <p className="text-sm text-gray-500">
                  {event.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}