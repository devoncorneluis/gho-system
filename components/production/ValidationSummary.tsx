type ValidationSummaryProps = {
  totalChecks: number;
  completedChecks: number;
};

export default function ValidationSummary({
  totalChecks,
  completedChecks,
}: ValidationSummaryProps) {
  const completionRate =
    totalChecks > 0
      ? Math.round((completedChecks / totalChecks) * 100)
      : 0;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-[#061B33]">Validation Summary</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-500">Total Checks</p>
          <p className="mt-1 text-3xl font-black text-[#061B33]">{totalChecks}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-500">Completed</p>
          <p className="mt-1 text-3xl font-black text-green-700">{completedChecks}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-500">Readiness</p>
          <p className="mt-1 text-3xl font-black text-blue-700">{completionRate}%</p>
        </div>
      </div>
    </section>
  );
}
