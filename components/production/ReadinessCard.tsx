type ReadinessStatus = "complete" | "pending";

type ReadinessCardProps = {
  label: string;
  status: ReadinessStatus;
};

export default function ReadinessCard({
  label,
  status,
}: ReadinessCardProps) {
  const complete = status === "complete";

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
      <p className="font-semibold text-[#061B33]">{label}</p>
      <span
        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
          complete
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {complete ? "Complete" : "Pending"}
      </span>
    </div>
  );
}
