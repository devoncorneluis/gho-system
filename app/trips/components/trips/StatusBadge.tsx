type Props = {
  status: string | null;
};

export default function StatusBadge({ status }: Props) {
  const value = status ?? "Scheduled";

  const colour =
    value === "Completed"
      ? "bg-green-100 text-green-700"
      : value === "In Progress"
      ? "bg-blue-100 text-blue-700"
      : value === "Cancelled"
      ? "bg-red-100 text-red-700"
      : "bg-orange-100 text-orange-700";

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-bold ${colour}`}>
      {value}
    </span>
  );
}