"use client";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  activityType: string;
  onActivityTypeChange: (value: string) => void;
};

export default function AuditFilterBar({
  search,
  onSearchChange,
  activityType,
  onActivityTypeChange,
}: Props) {
  return (
    <div className="mb-6 rounded-2xl bg-white p-5 shadow">

      <div className="grid gap-4 md:grid-cols-2">

        <input
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          placeholder="Search trip, invoice or user..."
          className="rounded-xl border p-3"
        />

        <select
          value={activityType}
          onChange={(e) =>
            onActivityTypeChange(
              e.target.value
            )
          }
          className="rounded-xl border p-3"
        >

          <option value="">
            All Activities
          </option>

          <option value="trip_started">
            Trip Started
          </option>

          <option value="trip_completed">
            Trip Completed
          </option>

          <option value="payment_recorded">
            Payment Recorded
          </option>

          <option value="invoice_created">
            Invoice Created
          </option>

          <option value="smart_dispatch">
            Smart Dispatch
          </option>

        </select>

      </div>

    </div>
  );
}