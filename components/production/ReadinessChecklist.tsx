"use client";

type Item = {
  name: string;
  complete: boolean;
};

const sections: {
  title: string;
  items: Item[];
}[] = [
  {
    title: "Core Platform",
    items: [
      { name: "Authentication", complete: true },
      { name: "Planner", complete: true },
      { name: "Smart Dispatch", complete: true },
      { name: "Driver Workflow", complete: true },
      { name: "Fleet Command Centre", complete: true },
    ],
  },
  {
    title: "Finance",
    items: [
      { name: "Billing Engine", complete: true },
      { name: "Invoice Generation", complete: true },
      { name: "PDF Generation", complete: true },
      { name: "Payment Recording", complete: true },
    ],
  },
  {
    title: "Security",
    items: [
      { name: "Finance RLS", complete: true },
      { name: "Platform Isolation", complete: true },
      { name: "Role Permissions", complete: true },
      { name: "Operational RLS Review", complete: false },
    ],
  },
  {
    title: "Production",
    items: [
      { name: "Environment Variables", complete: false },
      { name: "Backup Verification", complete: false },
      { name: "Disaster Recovery Test", complete: false },
      { name: "User Acceptance Testing", complete: false },
      { name: "Production Deployment", complete: false },
    ],
  },
];

export default function ReadinessChecklist() {
  return (
    <div className="space-y-6">

      {sections.map((section) => (

        <div
          key={section.title}
          className="rounded-2xl bg-white p-6 shadow"
        >

          <h2 className="text-2xl font-black text-[#061B33]">
            {section.title}
          </h2>

          <div className="mt-6 space-y-3">

            {section.items.map((item) => (

              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl border p-4"
              >

                <span>{item.name}</span>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    item.complete
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.complete
                    ? "Complete"
                    : "Pending"}
                </span>

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>
  );
}
