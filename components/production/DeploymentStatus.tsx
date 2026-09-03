type DeploymentStatusProps = {
  version: string;
  branch: string;
  buildStatus: "passing" | "failing";
  nextMilestone: string;
};

export default function DeploymentStatus({
  version,
  branch,
  buildStatus,
  nextMilestone,
}: DeploymentStatusProps) {
  const passing = buildStatus === "passing";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-[#061B33]">Deployment Status</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-500">Version</p>
          <p className="mt-1 text-2xl font-black text-[#061B33]">{version}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-500">Branch</p>
          <p className="mt-1 text-2xl font-black text-[#061B33]">{branch}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-500">Build</p>
          <p
            className={`mt-1 text-2xl font-black ${
              passing ? "text-green-700" : "text-red-700"
            }`}
          >
            {passing ? "Passing" : "Failing"}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-500">Next Milestone</p>
          <p className="mt-1 text-2xl font-black text-[#061B33]">{nextMilestone}</p>
        </div>
      </div>
    </section>
  );
}
