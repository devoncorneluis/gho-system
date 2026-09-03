"use client";

export type ExecutiveInsight = {
  title: string;
  value: string;
  subtitle: string;
};

type Props = {
  insights: ExecutiveInsight[];
};

export default function ExecutiveInsights({
  insights,
}: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

      <h2 className="text-2xl font-black text-[#061B33]">
        Operational Insights
      </h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        {insights.map((item) => (

          <div
            key={item.title}
            className="rounded-2xl border p-5"
          >

            <p className="text-sm text-gray-500">
              {item.title}
            </p>

            <h3 className="mt-2 text-xl font-black text-[#061B33]">
              {item.value}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {item.subtitle}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}
