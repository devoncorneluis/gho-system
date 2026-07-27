type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  actor: string;
  createdAt: string;
  severity: "info" | "success" | "warning" | "danger";
};

type Props = {
  events: TimelineEvent[];
};

const colours = {
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
};

export default function OperationsTimelinePanel({
  events,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-[#061B33]">
        Operations Timeline
      </h2>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">
          No operational events recorded yet.
        </p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border-l-4 border-[#F58220] pl-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{event.title}</h3>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    colours[event.severity]
                  }`}
                >
                  {event.severity}
                </span>
              </div>

              <p className="text-sm text-gray-600">
                {event.description}
              </p>

              <div className="mt-1 text-xs text-gray-500">
                {event.actor} • {new Date(event.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}