type Props = {
  selected: string;
  onSelect: (report: string) => void;
};

const reports = [
  "Trips",
  "Fleet",
  "Drivers",
  "Incidents",
  "Activities",
  "Executive",
];

export default function ReportsNavigation({
  selected,
  onSelect,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {reports.map((report) => (
        <button
          key={report}
          onClick={() => onSelect(report)}
          className={`rounded-xl px-5 py-3 font-semibold transition ${
            selected === report
              ? "bg-[#061B33] text-white"
              : "bg-white shadow hover:bg-gray-100"
          }`}
        >
          {report}
        </button>
      ))}
    </div>
  );
}
