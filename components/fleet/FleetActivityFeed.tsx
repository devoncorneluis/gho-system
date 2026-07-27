type Activity = {
  id: string;
  title: string;
  time: string;
  colour: "green" | "blue" | "yellow" | "red";
};

type Props = {
  activities: Activity[];
};

export default function FleetActivityFeed({
  activities,
}: Props) {
  return (
    <div className="mt-6 rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold text-[#0B3A82]">
        Live Fleet Activity
      </h2>

      {activities.length === 0 ? (
        <p className="text-gray-500">
          No recent fleet activity.
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b pb-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    activity.colour === "green"
                      ? "bg-green-500"
                      : activity.colour === "blue"
                      ? "bg-blue-500"
                      : activity.colour === "yellow"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />

                <span>{activity.title}</span>
              </div>

              <span className="text-sm text-gray-500">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}