"use client";

type Props = {
  dateFrom: string;
  dateTo: string;
  shift: string;
  status: string;
  area: string;

  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onShiftChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAreaChange: (value: string) => void;
};

export default function ReportFilters({
  dateFrom,
  dateTo,
  shift,
  status,
  area,
  onDateFromChange,
  onDateToChange,
  onShiftChange,
  onStatusChange,
  onAreaChange,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <h2 className="text-xl font-black text-[#061B33]">
        Report Filters
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-5">

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Date From
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) =>
              onDateFromChange(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Date To
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={(e) =>
              onDateToChange(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Shift
          </label>

          <select
            value={shift}
            onChange={(e) =>
              onShiftChange(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          >
            <option value="All">All</option>
            <option value="Day">Day</option>
            <option value="Night">Night</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          >
            <option value="All">All</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Area
          </label>

          <input
            type="text"
            placeholder="All Areas"
            value={area}
            onChange={(e) =>
              onAreaChange(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          />
        </div>

      </div>

    </div>
  );
}